import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const leadsApi = createApi({
    reducerPath: "leadsApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_BASE}`,
        prepareHeaders: (headers) => {
            if (typeof window !== "undefined") {
                const userData = localStorage.getItem("user");
                if (userData) {
                    try {
                        const user = JSON.parse(userData);
                        const token = user.token;
                        if (token) {
                            headers.set("authorization", `Bearer ${token}`);
                        }
                    } catch (error) {
                        console.error("❌ Error parsing user data:", error);
                    }
                }
            }
            // Don't set Content-Type for FormData, let browser set it with boundary
            return headers;
        },
    }),
    tagTypes: ["Leads", "AvailableLeads", "PurchasedLeads", "PendingPayments", "Chats", "Messages"],
    endpoints: (builder) => ({
        // 🧩 Get available leads for sellers WITH FILTERS
        getAvailableLeads: builder.query({
            query: ({ category, location } = {}) => {
                const params = new URLSearchParams();
                if (category && category !== "all") params.append('category', category);
                if (location) params.append('location', location);

                return `/leads/seller/available?${params.toString()}`;
            },
            transformResponse: (response) => {
                return response || { leads: [], total: 0, page: 1, pages: 0 };
            },
            transformErrorResponse: (response) => {
                console.error("❌ Error fetching available leads:", response);
                return response;
            },
            providesTags: ["AvailableLeads"],
        }),

        // 🧩 Get purchased leads for seller
        getMyPurchasedLeads: builder.query({
            query: () => `/leads/seller/purchased`,
            transformResponse: (response) => {
                return response || { purchases: [], total: 0, page: 1, pages: 0 };
            },
            transformErrorResponse: (response) => {
                console.error("❌ Error fetching purchased leads:", response);
                return response;
            },
            providesTags: ["PurchasedLeads"],
        }),

        // 🧩 Buy a lead with integrated payment methods
        buyLead: builder.mutation({
            query: ({ leadId, payment_method }) => {
                console.log("🔄 buyLead API call:", { leadId, payment_method });
                return {
                    url: `/leads/seller/buy/${leadId}`,
                    method: "POST",
                    body: {
                        payment_method
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
            },
            transformResponse: (response, meta, arg) => {
                console.log("✅ buyLead successful response:", response);
                return response;
            },
            transformErrorResponse: (response, meta, arg) => {
                console.error("❌ buyLead error response:", {
                    status: response.status,
                    data: response.data,
                    leadId: arg.leadId,
                    payment_method: arg.payment_method
                });

                let errorMessage = "Failed to create payment order";
                if (response.status === 500) {
                    errorMessage = response.data?.message || "Internal server error. Please try again.";
                } else if (response.status === 400) {
                    errorMessage = response.data?.message || "Invalid request. Please check your input.";
                } else if (response.status === 403) {
                    errorMessage = "You don't have permission to purchase this lead.";
                } else if (response.status === 404) {
                    errorMessage = "Lead not found or no longer available.";
                } else if (response.status === 413) {
                    errorMessage = "Request too large. Please try a smaller image.";
                }

                return {
                    ...response,
                    data: {
                        ...response.data,
                        userFriendlyMessage: errorMessage
                    }
                };
            },
            invalidatesTags: ["AvailableLeads", "PurchasedLeads"],
        }),

        // Update the uploadPaymentScreenshot endpoint:

        // In leadsApi.js, replace the uploadPaymentScreenshot endpoint with:

        uploadPaymentScreenshot: builder.mutation({
            query: ({ purchaseId, payment_proof }) => {
                console.log("🔄 uploadPaymentScreenshot API call - START");
                console.log("📦 Purchase ID:", purchaseId);
                console.log("📦 Payment proof type:", typeof payment_proof);
                console.log("📦 Is File?", payment_proof instanceof File);
                console.log("📦 Is Blob?", payment_proof instanceof Blob);
                console.log("📦 Constructor name:", payment_proof?.constructor?.name);

                // Create FormData
                const formData = new FormData();

                // Check what type of payment_proof we have
                if (payment_proof instanceof File) {
                    console.log("📤 Appending File object to FormData");
                    console.log("📁 File details:", {
                        name: payment_proof.name,
                        type: payment_proof.type,
                        size: payment_proof.size,
                        lastModified: payment_proof.lastModified
                    });
                    formData.append('payment_proof', payment_proof);
                }
                else if (payment_proof instanceof Blob) {
                    console.log("📤 Appending Blob to FormData");
                    formData.append('payment_proof', payment_proof, 'payment_screenshot.png');
                }
                else if (typeof payment_proof === 'string') {
                    console.log("📤 Processing string - length:", payment_proof.length);

                    if (payment_proof.startsWith('data:image')) {
                        console.log("📤 Detected base64 data URL");
                        // Convert base64 to Blob
                        const base64Data = payment_proof.split(',')[1];
                        const mimeType = payment_proof.split(':')[1].split(';')[0];

                        try {
                            const byteCharacters = atob(base64Data);
                            const byteArrays = [];

                            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                                const slice = byteCharacters.slice(offset, offset + 512);
                                const byteNumbers = new Array(slice.length);

                                for (let i = 0; i < slice.length; i++) {
                                    byteNumbers[i] = slice.charCodeAt(i);
                                }

                                byteArrays.push(new Uint8Array(byteNumbers));
                            }

                            const blob = new Blob(byteArrays, { type: mimeType });
                            formData.append('payment_proof', blob, 'payment_screenshot.png');
                            console.log("✅ Base64 converted to Blob successfully");
                        } catch (error) {
                            console.error("❌ Failed to convert base64 to Blob:", error);
                            // Fallback: send as string
                            formData.append('payment_proof', payment_proof);
                        }
                    } else {
                        console.log("📤 String is not base64, appending as is");
                        formData.append('payment_proof', payment_proof);
                    }
                }
                else {
                    console.error("❌ Invalid payment_proof type:", typeof payment_proof);
                    throw new Error("Invalid payment proof format");
                }

                // Log FormData contents for debugging
                console.log("📋 FormData entries:");
                for (let pair of formData.entries()) {
                    console.log(`${pair[0]}:`, pair[1]);
                }

                console.log("🔄 uploadPaymentScreenshot API call - END");

                return {
                    url: `/leads/seller/upload-payment-screenshot/${purchaseId}`,
                    method: "POST",
                    body: formData,
                    // Note: Don't set Content-Type header for FormData
                };
            },
            transformResponse: (response, meta, arg) => {
                console.log("✅ Payment screenshot uploaded successfully:", response);
                return response;
            },
            transformErrorResponse: (response, meta, arg) => {
                console.error("❌ Payment screenshot upload failed:", {
                    status: response.status,
                    data: response.data,
                    purchaseId: arg.purchaseId
                });

                let errorMessage = "Failed to upload payment screenshot";
                let details = "";

                if (response.status === 400) {
                    errorMessage = response.data?.message || "Invalid request";
                    details = response.data?.details || "Please check your file and try again.";
                } else if (response.status === 404) {
                    errorMessage = "Purchase not found";
                    details = "The purchase ID is invalid or the purchase has been deleted.";
                } else if (response.status === 413) {
                    errorMessage = "File too large";
                    details = "Maximum file size is 10MB. Please compress your image.";
                } else if (response.status === 415) {
                    errorMessage = "Unsupported file type";
                    details = "Please upload JPEG, PNG, GIF, PDF, MP4, CSV, DOC, or DOCX files only.";
                } else if (response.status === 500) {
                    errorMessage = "Server error";
                    details = "Please try again later or contact support.";
                }

                return {
                    ...response,
                    data: {
                        ...response.data,
                        userFriendlyMessage: errorMessage,
                        details: details
                    }
                };
            },
            invalidatesTags: ["PurchasedLeads", "PendingPayments"],
        }),

        // 🧩 Check payment status
        checkPaymentStatus: builder.query({
            query: (purchaseId) => `/leads/seller/payment-status/${purchaseId}`,
            transformResponse: (response) => {
                console.log("📊 Payment status:", response);
                return response;
            },
            providesTags: ["PurchasedLeads"],
        }),

        // 🧩 Get pending payments (Admin)
        getPendingPayments: builder.query({
            query: () => `/leads/admin/pending-payments`,
            transformResponse: (response) => {
                return response?.payments || [];
            },
            providesTags: ["PendingPayments"],
        }),

        // 🧩 Verify payment (Admin)
        verifyPayment: builder.mutation({
            query: (purchaseId) => ({
                url: `/leads/admin/verify-payment/${purchaseId}`,
                method: "PUT",
            }),
            transformResponse: (response) => {
                console.log("✅ Payment verified:", response);
                return response;
            },
            transformErrorResponse: (response) => {
                console.error("❌ Payment verification failed:", response);
                return response;
            },
            invalidatesTags: ["PendingPayments", "PurchasedLeads", "AvailableLeads"],
        }),

        // 🧩 Create Razorpay order
        createRazorpayOrder: builder.mutation({
            query: (leadId) => ({
                url: `/leads/seller/razorpay-order/${leadId}`,
                method: "POST",
            }),
        }),

        // User/Buyer endpoints
        getUserLeads: builder.query({
            query: () => `/leads/user/my-leads`,
            transformResponse: (response) => {
                return response?.leads || [];
            },
            providesTags: ["Leads"],
        }),

        createLead: builder.mutation({
            query: (leadData) => ({
                url: `/leads/user/create`,
                method: "POST",
                body: leadData,
            }),
            invalidatesTags: ["Leads"],
        }),

        updateLead: builder.mutation({
            query: ({ id, ...leadData }) => ({
                url: `/leads/user/update/${id}`,
                method: "PUT",
                body: leadData,
            }),
            invalidatesTags: ["Leads"],
        }),

        getAllLeads: builder.query({
            query: () => `/leads/admin/all`,
            transformResponse: (response) => {
                return response?.leads || [];
            },
            providesTags: ["Leads"],
        }),

        getLeadAnalytics: builder.query({
            query: () => `/leads/admin/analytics`,
        }),

        getPendingLeads: builder.query({
            query: () => `/leads/admin/pending`,
            transformResponse: (response) => response?.leads || [],
        }),

        approveLead: builder.mutation({
            query: ({ leadId, status, lead_price, max_sellers }) => ({
                url: `/leads/admin/approve/${leadId}`,
                method: "PUT",
                body: { status, lead_price, max_sellers },
            }),
            invalidatesTags: ["Leads", "AvailableLeads"],
        }),

        // Chat endpoints
        getConversations: builder.query({
            query: () => `/chat/conversations`,
            providesTags: ["Chats"],
        }),

        getMessages: builder.query({
            query: (conversationId) => `/chat/messages/${conversationId}`,
            providesTags: ["Messages"],
        }),

        sendMessage: builder.mutation({
            query: ({ conversationId, text }) => ({
                url: `/chat/send/${conversationId}`,
                method: "POST",
                body: { text },
            }),
            invalidatesTags: ["Messages"],
        }),

        createConversation: builder.mutation({
            query: ({ buyerId, sellerId, leadId }) => ({
                url: `/chat/conversation`,
                method: "POST",
                body: { buyerId, sellerId, leadId },
            }),
            invalidatesTags: ["Chats"],
        }),
    }),
});

export const {
    useGetUserLeadsQuery,
    useCreateLeadMutation,
    useUpdateLeadMutation,
    useGetAvailableLeadsQuery,
    useGetMyPurchasedLeadsQuery,
    useBuyLeadMutation,
    useUploadPaymentScreenshotMutation,
    useCheckPaymentStatusQuery,
    useGetPendingPaymentsQuery,
    useVerifyPaymentMutation,
    useCreateRazorpayOrderMutation,
    useGetAllLeadsQuery,
    useGetLeadAnalyticsQuery,
    useGetPendingLeadsQuery,
    useApproveLeadMutation,
    useGetConversationsQuery,
    useGetMessagesQuery,
    useSendMessageMutation,
    useCreateConversationMutation,
} = leadsApi;