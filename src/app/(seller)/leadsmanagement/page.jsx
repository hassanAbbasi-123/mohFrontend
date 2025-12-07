"use client";
import { useState, useEffect, useRef } from "react";
import {
    Package, Search, ShoppingCart, Eye, RefreshCw,
    BadgeCheck, AlertCircle, CheckCircle, Clock, XCircle,
    DollarSign, MessageCircle, CreditCard, Globe,
    Filter, X, IndianRupee, ArrowRight, ExternalLink,
    Upload, FileText, Banknote, Smartphone, Wallet,
    Camera, Image, AlertTriangle
} from "lucide-react";
import {
    useGetAvailableLeadsQuery,
    useBuyLeadMutation,
    useUploadPaymentScreenshotMutation,
    useGetMyPurchasedLeadsQuery,
} from "@/store/features/leadsApi";
import { useChat } from '@/context/ChatContext';

// In the compressImage function in page.jsx, add more error handling:

const compressImage = (file, maxSizeMB = 1) => {
    return new Promise((resolve, reject) => {
        console.log("🔄 Starting image compression:", {
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + "MB",
            type: file.type
        });

        if (file.size <= maxSizeMB * 1024 * 1024) {
            console.log("✅ File already within size limit, no compression needed");
            resolve(file);
            return;
        }

        const reader = new FileReader();

        reader.onload = (event) => {
            console.log("📖 File read successfully, creating image");
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                console.log("🖼️ Image loaded:", {
                    width: img.width,
                    height: img.height
                });

                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                const maxDimension = 1200;
                if (width > height && width > maxDimension) {
                    height = (height * maxDimension) / width;
                    width = maxDimension;
                    console.log(`📐 Resized: ${img.width}x${img.height} → ${width}x${height}`);
                } else if (height > maxDimension) {
                    width = (width * maxDimension) / height;
                    height = maxDimension;
                    console.log(`📐 Resized: ${img.width}x${img.height} → ${width}x${height}`);
                } else {
                    console.log("📐 Image dimensions are OK, no resizing needed");
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                console.log("🎨 Drawing image to canvas");
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error("Canvas to Blob conversion failed"));
                        return;
                    }

                    const compressedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });

                    console.log(`📊 Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
                    resolve(compressedFile);
                }, 'image/jpeg', 0.7); // 0.7 quality
            };

            img.onerror = (err) => {
                console.error("❌ Image loading error:", err);
                reject(new Error("Failed to load image for compression"));
            };
        };

        reader.onerror = (err) => {
            console.error("❌ File reading error:", err);
            reject(new Error("Failed to read file for compression"));
        };

        reader.readAsDataURL(file);
    });
};

export default function SellerLeadsManagement() {
    const [activeTab, setActiveTab] = useState("available");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedLocation, setSelectedLocation] = useState("");
    const [selectedLead, setSelectedLead] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [currencyRates, setCurrencyRates] = useState({ USD: 0.012 });
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    // Manual payment state
    const [manualPaymentScreenshot, setManualPaymentScreenshot] = useState(null);
    const [manualPaymentPreview, setManualPaymentPreview] = useState(null);
    const [currentPurchaseId, setCurrentPurchaseId] = useState(null);
    const [compressionProgress, setCompressionProgress] = useState(0);
    const [uploadError, setUploadError] = useState("");

    const fileInputRef = useRef(null);

    const { toggleChat } = useChat();

    // Check user role
    const [userRole, setUserRole] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    useEffect(() => {
        const checkUserAuth = () => {
            const userData = localStorage.getItem("user");
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    setUserRole(user.role);
                } catch (error) {
                    console.error("❌ Error parsing user data:", error);
                }
            }
            setIsLoadingUser(false);
        };
        checkUserAuth();

        fetchExchangeRates();
    }, []);

    useEffect(() => {
        // Clean up preview URLs on unmount
        return () => {
            if (manualPaymentPreview) {
                URL.revokeObjectURL(manualPaymentPreview);
            }
        };
    }, [manualPaymentPreview]);

    const fetchExchangeRates = async () => {
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
            const data = await response.json();
            setCurrencyRates(data.rates);
        } catch (error) {
            console.error("❌ Failed to fetch exchange rates, using fallback:", error);
            setCurrencyRates({ USD: 0.012 });
        }
    };

    const convertINRtoUSD = (inrAmount) => {
        const usdAmount = inrAmount * (currencyRates.USD || 0.012);
        return Math.round(usdAmount * 100) / 100;
    };

    // RTK Query Hooks
    const shouldFetchLeads = userRole === "seller";

    const availableLeadsParams = {
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        location: selectedLocation || undefined
    };

    const {
        data: availableLeadsResponse = {},
        isLoading: availableLoading,
        error: availableError,
        refetch: refetchAvailable
    } = useGetAvailableLeadsQuery(availableLeadsParams, {
        skip: !shouldFetchLeads,
        refetchOnMountOrArgChange: true
    });

    const {
        data: purchasedLeadsResponse = {},
        isLoading: purchasedLoading,
        error: purchasedError,
        refetch: refetchPurchased
    } = useGetMyPurchasedLeadsQuery(undefined, {
        skip: !shouldFetchLeads
    });

    const [buyLead, { isLoading: buying }] = useBuyLeadMutation();
    const [uploadPaymentScreenshot, { isLoading: uploadingScreenshot }] = useUploadPaymentScreenshotMutation();

    // Extract leads properly from responses
    const availableLeads = availableLeadsResponse?.leads || [];
    const purchasedLeads = purchasedLeadsResponse?.purchases || [];

    // Filter leads based on search term
    const getFilteredLeads = () => {
        let leads = [];

        if (activeTab === "available") {
            leads = availableLeads;
        } else {
            leads = purchasedLeads
                .map(purchase => purchase.lead)
                .filter(lead => lead !== null && lead !== undefined);
        }

        if (searchTerm) {
            leads = leads.filter(lead =>
                lead?.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead?.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead?.delivery_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead?.buyer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead?.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return leads;
    };

    const filteredLeads = getFilteredLeads();

    const categories = ["all", "Vegetables", "Fruits", "Pulses", "Grains", "Spices", "Oil Seeds", "Dry Fruits"];

    // Calculate stats
    const stats = {
        available: availableLeads.length,
        purchased: purchasedLeads.length,
        active: purchasedLeads.filter(p => p.payment_status === "approved").length,
        pending: purchasedLeads.filter(p => p.payment_status === "pending" || p.payment_status === "manual_pending").length,
    };

    // Handle purchase button click
    const handlePurchaseClick = (lead) => {
        setSelectedLead(lead);
        setSelectedPaymentMethod("");
        setManualPaymentScreenshot(null);
        setManualPaymentPreview(null);
        setCurrentPurchaseId(null);
        setUploadError("");
        setCompressionProgress(0);
        setShowPaymentModal(true);
    };

    // Handle payment submission
    const handlePaymentSubmit = async () => {
        if (!selectedLead || !selectedPaymentMethod) {
            alert("Please select a payment method");
            return;
        }

        setPaymentProcessing(true);
        setUploadError("");

        try {
            console.log("🔄 Creating payment order for lead:", selectedLead._id, "method:", selectedPaymentMethod);

            const result = await buyLead({
                leadId: selectedLead._id,
                payment_method: selectedPaymentMethod
            }).unwrap();

            console.log("✅ Payment order response:", result);

            if (result.success === false) {
                throw new Error(result.message || "Payment order creation failed");
            }

            if (selectedPaymentMethod === "razorpay" && result.order) {
                console.log("🔄 Processing Razorpay payment...");
                await handleRazorpayPayment(result.order, result.purchaseId);
            } else if (selectedPaymentMethod === "paypal" && result.order) {
                console.log("🔄 Processing PayPal payment...");
                handlePayPalPayment(result.order, result.purchaseId);
            } else if (selectedPaymentMethod === "manual") {
                setCurrentPurchaseId(result.purchaseId);
                console.log("✅ Manual purchase created, purchaseId:", result.purchaseId);
            } else {
                console.log("✅ Payment request submitted");
                alert(result.message || "Purchase request submitted successfully!");
                setShowPaymentModal(false);
                resetPaymentState();

                setTimeout(() => {
                    refetchAvailable();
                    refetchPurchased();
                }, 1000);
            }

        } catch (error) {
            console.error("❌ Failed to process payment:", error);

            const errorMessage = error?.data?.userFriendlyMessage ||
                error?.data?.message ||
                error?.message ||
                "Payment processing failed. Please try again.";

            setUploadError(errorMessage);
            alert(`Payment Error: ${errorMessage}`);
            setPaymentProcessing(false);
        } finally {
            if (selectedPaymentMethod !== "manual") {
                setPaymentProcessing(false);
            }
        }
    };

    // In the handleManualPaymentSubmit function:

    // In the handleManualPaymentSubmit function in page.jsx:

    const handleManualPaymentSubmit = async () => {
        if (!currentPurchaseId) {
            setUploadError("Purchase not found. Please try again.");
            return;
        }

        if (!manualPaymentScreenshot) {
            setUploadError("Please upload a payment screenshot");
            return;
        }

        try {
            console.log("🔄 Starting manual payment submission");
            console.log("📦 Purchase ID:", currentPurchaseId);
            console.log("📁 File details:", {
                name: manualPaymentScreenshot.name,
                type: manualPaymentScreenshot.type,
                size: manualPaymentScreenshot.size,
                isFile: manualPaymentScreenshot instanceof File
            });

            setUploadError("");
            setCompressionProgress(30);

            // Compress image first
            const compressedFile = await compressImage(manualPaymentScreenshot, 1);
            setCompressionProgress(60);

            console.log("✅ File compressed:", {
                originalSize: manualPaymentScreenshot.size,
                compressedSize: compressedFile.size,
                reduction: `${((1 - compressedFile.size / manualPaymentScreenshot.size) * 100).toFixed(1)}%`
            });

            // Upload screenshot
            console.log("📤 Calling uploadPaymentScreenshot API");
            const result = await uploadPaymentScreenshot({
                purchaseId: currentPurchaseId,
                payment_proof: compressedFile
            }).unwrap();

            console.log("✅ Payment screenshot uploaded successfully:", result);
            setCompressionProgress(100);

            alert("✅ Payment screenshot uploaded successfully! Our team will review and approve your payment within 24 hours. You can track the status in your purchases.");

            // Close modal and reset
            setShowPaymentModal(false);
            resetPaymentState();

            // Refresh data
            setTimeout(() => {
                refetchAvailable();
                refetchPurchased();
            }, 1000);

        } catch (error) {
            console.error("❌ Failed to upload payment screenshot:", error);
            console.error("❌ Error details:", {
                status: error?.status,
                data: error?.data,
                message: error?.message
            });

            setCompressionProgress(0);

            let errorMessage = "Failed to upload payment screenshot. Please try again.";
            let errorDetails = "";

            if (error?.data?.userFriendlyMessage) {
                errorMessage = error.data.userFriendlyMessage;
                errorDetails = error.data.details || "";
            } else if (error?.status === 413) {
                errorMessage = "Image file is too large. Please compress the image or use a smaller file.";
            } else if (error?.data?.message) {
                errorMessage = error.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            setUploadError(`${errorMessage}${errorDetails ? `\n\n${errorDetails}` : ''}`);
            alert(`❌ Upload Error:\n\n${errorMessage}${errorDetails ? `\n\n${errorDetails}` : ''}`);
        }
    };

    // Convert file to base64
    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    // Reset payment state
    const resetPaymentState = () => {
        setSelectedLead(null);
        setSelectedPaymentMethod("");
        setManualPaymentScreenshot(null);
        if (manualPaymentPreview) {
            URL.revokeObjectURL(manualPaymentPreview);
        }
        setManualPaymentPreview(null);
        setCurrentPurchaseId(null);
        setPaymentProcessing(false);
        setUploadError("");
        setCompressionProgress(0);
    };

    // Handle file upload for manual payment screenshot
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Check file size (max 10MB initially)
        const maxSizeMB = 10;
        if (file.size > maxSizeMB * 1024 * 1024) {
            setUploadError(`File size too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is ${maxSizeMB}MB.`);
            return;
        }

        // Check file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setUploadError("Please upload a valid image file (JPEG, PNG, GIF, WEBP).");
            return;
        }

        setUploadError("");
        setCompressionProgress(20);

        try {
            // Compress image if needed
            let processedFile = file;
            if (file.size > 2 * 1024 * 1024) { // If > 2MB, compress
                processedFile = await compressImage(file, 2);
            }
            setCompressionProgress(40);

            setManualPaymentScreenshot(processedFile);

            // Create preview URL
            const previewUrl = URL.createObjectURL(processedFile);
            setManualPaymentPreview(previewUrl);
            setCompressionProgress(0);

        } catch (error) {
            console.error("❌ Error processing image:", error);
            setUploadError("Failed to process image. Please try another file.");
            setCompressionProgress(0);
        }
    };

    // Clear uploaded file
    const clearUploadedFile = () => {
        setManualPaymentScreenshot(null);
        if (manualPaymentPreview) {
            URL.revokeObjectURL(manualPaymentPreview);
            setManualPaymentPreview(null);
        }
        setUploadError("");
        setCompressionProgress(0);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Razorpay payment handler
    const handleRazorpayPayment = (order, purchaseId) => {
        return new Promise((resolve, reject) => {
            const initializeRazorpay = () => {
                try {
                    console.log("🔄 Initializing Razorpay with order:", order.id);

                    const options = {
                        key: order.key,
                        amount: order.amount,
                        currency: order.currency,
                        name: order.name || "Lead Purchase",
                        description: order.description || `Purchase lead for ${selectedLead?.product}`,
                        order_id: order.id,
                        handler: function (response) {
                            console.log("✅ Razorpay payment successful:", response);
                            alert("🎉 Payment successful! Your lead purchase is being processed.");
                            setShowPaymentModal(false);
                            resetPaymentState();

                            // Refresh data to show the new purchase
                            setTimeout(() => {
                                refetchAvailable();
                                refetchPurchased();
                            }, 2000);

                            resolve(response);
                        },
                        prefill: {
                            name: order.prefill?.name || "",
                            email: order.prefill?.email || "",
                            contact: order.prefill?.contact || ""
                        },
                        theme: {
                            color: "#10B981"
                        },
                        modal: {
                            ondismiss: function () {
                                console.log("ℹ️ Payment modal closed by user");
                                const userConfirmed = window.confirm(
                                    "Are you sure you want to cancel the payment? You can complete it later from your purchases."
                                );

                                if (userConfirmed) {
                                    reject(new Error("Payment cancelled by user"));
                                } else {
                                    // Reopen the modal if user changes mind
                                    rzp.open();
                                }
                            }
                        }
                    };

                    const rzp = new window.Razorpay(options);

                    rzp.on('payment.failed', function (response) {
                        console.error("❌ Razorpay payment failed:", response.error);
                        const errorMsg = response.error.description || "Payment failed. Please try again.";
                        alert(`Payment Failed: ${errorMsg}`);
                        reject(new Error(errorMsg));
                    });

                    rzp.open();

                } catch (error) {
                    console.error("❌ Razorpay initialization error:", error);
                    reject(new Error("Failed to initialize payment gateway. Please try again."));
                }
            };

            // Load Razorpay SDK if not already loaded
            if (window.Razorpay) {
                initializeRazorpay();
            } else {
                console.log("📥 Loading Razorpay SDK...");
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => {
                    console.log("✅ Razorpay SDK loaded");
                    initializeRazorpay();
                };
                script.onerror = () => {
                    console.error("❌ Failed to load Razorpay SDK");
                    reject(new Error("Failed to load payment service. Please try PayPal or manual payment."));
                };
                document.body.appendChild(script);
            }
        });
    };

    // PayPal payment handler
    const handlePayPalPayment = (order, purchaseId) => {
        if (order.links) {
            console.log("🔗 Redirecting to PayPal:", order.links);

            // Store purchase info in localStorage to check status later
            const pendingPayment = {
                purchaseId: purchaseId,
                leadId: selectedLead?._id,
                leadProduct: selectedLead?.product,
                timestamp: new Date().toISOString(),
                gateway: 'paypal',
                amount: selectedLead?.lead_price
            };
            localStorage.setItem('pendingPaypalPayment', JSON.stringify(pendingPayment));

            // Show confirmation before redirecting
            const confirmRedirect = window.confirm(
                `You will be redirected to PayPal to complete your payment of $${convertINRtoUSD(selectedLead?.lead_price || 0)} USD.\n\nClick OK to proceed to PayPal.`
            );

            if (confirmRedirect) {
                window.location.href = order.links;
            } else {
                console.log("ℹ️ User cancelled PayPal redirect");
                alert("PayPal payment cancelled. You can try again later.");
            }
        } else {
            console.log("✅ PayPal order created (no redirect needed):", order);
            alert("PayPal order created successfully! Please check your purchases for status updates.");
        }

        setShowPaymentModal(false);
        resetPaymentState();
    };

    const handleRefresh = () => {
        refetchAvailable();
        refetchPurchased();
        fetchExchangeRates();
    };

    const clearFilters = () => {
        setSelectedCategory("all");
        setSelectedLocation("");
        setSearchTerm("");
    };

    const getPaymentStatusConfig = (status) => {
        const config = {
            approved: { color: "bg-green-100 text-green-800", icon: BadgeCheck, text: "Approved" },
            pending: { color: "bg-orange-100 text-orange-800", icon: Clock, text: "Pending" },
            manual_pending: { color: "bg-purple-100 text-purple-800", icon: Clock, text: "Awaiting Verification" },
            failed: { color: "bg-red-100 text-red-800", icon: XCircle, text: "Failed" },
            initiated: { color: "bg-blue-100 text-blue-800", icon: Clock, text: "Initiated" },
            cancelled: { color: "bg-gray-100 text-gray-800", icon: XCircle, text: "Cancelled" },
        };
        return config[status] || { color: "bg-gray-100 text-gray-800", icon: Clock, text: "Processing" };
    };

    const handleStartChat = (lead, purchase) => {
        toggleChat();
        console.log("Starting chat with buyer:", {
            leadId: lead?._id,
            buyer: lead?.buyer,
            purchaseId: purchase?._id
        });
    };

    // Check for pending PayPal payments on component mount
    useEffect(() => {
        const checkPendingPayment = () => {
            const pendingPayment = localStorage.getItem('pendingPaypalPayment');
            if (pendingPayment) {
                try {
                    const paymentData = JSON.parse(pendingPayment);
                    const paymentTime = new Date(paymentData.timestamp);
                    const currentTime = new Date();
                    const timeDiff = (currentTime - paymentTime) / (1000 * 60);

                    if (timeDiff < 30) {
                        console.log("ℹ️ Pending PayPal payment found:", paymentData);
                    } else {
                        localStorage.removeItem('pendingPaypalPayment');
                    }
                } catch (error) {
                    console.error("❌ Error parsing pending payment:", error);
                    localStorage.removeItem('pendingPaypalPayment');
                }
            }
        };

        checkPendingPayment();
    }, []);

    // Loading and error states
    if (isLoadingUser) {
        return <LoadingState />;
    }

    if (userRole && userRole !== "seller") {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-lg mb-4">Access Denied: Seller Role Required</div>
                    <p className="text-gray-600">This page is only accessible to sellers.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50/30 p-4 sm:p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Seller Leads Management</h1>
                    <p className="text-gray-600 mt-2">Find and purchase quality leads for your business</p>
                </div>
                <button
                    onClick={toggleChat}
                    className="relative p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <MessageCircle className="h-6 w-6" />
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Available Leads"
                    value={stats.available}
                    icon={Package}
                    color="blue"
                    loading={availableLoading}
                />
                <StatCard
                    title="Total Purchased"
                    value={stats.purchased}
                    icon={ShoppingCart}
                    color="emerald"
                    loading={purchasedLoading}
                />
                <StatCard
                    title="Active Leads"
                    value={stats.active}
                    icon={CheckCircle}
                    color="green"
                    loading={purchasedLoading}
                />
                <StatCard
                    title="Pending Approval"
                    value={stats.pending}
                    icon={Clock}
                    color="orange"
                    loading={purchasedLoading}
                />
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <div className="flex flex-wrap">
                        {[
                            { id: "available", name: "Available Leads", count: stats.available, icon: Package },
                            { id: "purchased", name: "My Purchases", count: stats.purchased, icon: ShoppingCart },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === tab.id
                                    ? "border-emerald-600 text-emerald-600 bg-emerald-50"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.name}
                                <span className={`px-2 py-1 rounded-full text-xs ${activeTab === tab.id ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-600"
                                    }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder={
                                        activeTab === "available"
                                            ? "Search available leads..."
                                            : "Search your purchased leads..."
                                    }
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all duration-200 bg-white"
                                />
                            </div>

                            <button
                                onClick={handleRefresh}
                                disabled={availableLoading || purchasedLoading}
                                className="px-4 py-3 bg-white border border-gray-300 hover:border-gray-400 rounded-xl text-gray-700 font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RefreshCw className={`w-4 h-4 ${availableLoading || purchasedLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>

                        {/* Advanced Filters */}
                        {showFilters && activeTab === "available" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-xl border border-gray-200">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all duration-200 bg-white"
                                    >
                                        {categories.map(category => (
                                            <option key={category} value={category}>
                                                {category === "all" ? "All Categories" : category}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Filter by location..."
                                        value={selectedLocation}
                                        onChange={(e) => setSelectedLocation(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all duration-200 bg-white"
                                    />
                                </div>

                                <div className="md:col-span-2 flex justify-end gap-2">
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Leads Grid/Table */}
                <div className="p-6">
                    {activeTab === "available" && availableLoading ? (
                        <LoadingState />
                    ) : activeTab === "purchased" && purchasedLoading ? (
                        <LoadingState />
                    ) : filteredLeads.length === 0 ? (
                        <EmptyState
                            activeTab={activeTab}
                            searchTerm={searchTerm}
                            selectedCategory={selectedCategory}
                            selectedLocation={selectedLocation}
                            onClearFilters={clearFilters}
                        />
                    ) : activeTab === "available" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredLeads.map((lead) => (
                                <AvailableLeadCard
                                    key={lead._id}
                                    lead={lead}
                                    onPurchase={handlePurchaseClick}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead Details</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Buyer & Location</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Purchase Info</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {purchasedLeads.map((purchase) => (
                                        <PurchasedLeadRow
                                            key={purchase._id}
                                            purchase={purchase}
                                            paymentStatusConfig={getPaymentStatusConfig(purchase?.payment_status)}
                                            onStartChat={handleStartChat}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Method Modal */}
            {showPaymentModal && (
                <PaymentMethodModal
                    lead={selectedLead}
                    selectedMethod={selectedPaymentMethod}
                    onMethodSelect={setSelectedPaymentMethod}
                    onSubmit={handlePaymentSubmit}
                    onManualPaymentSubmit={handleManualPaymentSubmit}
                    onClose={() => {
                        setShowPaymentModal(false);
                        resetPaymentState();
                    }}
                    loading={buying || paymentProcessing}
                    uploadingScreenshot={uploadingScreenshot}
                    currencyRates={currencyRates}
                    convertINRtoUSD={convertINRtoUSD}
                    manualPaymentScreenshot={manualPaymentScreenshot}
                    manualPaymentPreview={manualPaymentPreview}
                    onFileUpload={handleFileUpload}
                    currentPurchaseId={currentPurchaseId}
                    clearUploadedFile={clearUploadedFile}
                    uploadError={uploadError}
                    compressionProgress={compressionProgress}
                    fileInputRef={fileInputRef}
                />
            )}
        </div>
    );
}

// Available Lead Card Component
function AvailableLeadCard({ lead, onPurchase }) {
    const isSoldOut = lead.remaining_slots === 0;
    const isExpired = new Date(lead.expires_at) < new Date();

    return (
        <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group ${isSoldOut || isExpired ? 'border-gray-300 opacity-75' : 'border-gray-200 hover:border-emerald-300'
            }`}>
            <div className="p-6">
                {/* Header with status badges */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isSoldOut || isExpired ? 'bg-gray-100' : 'bg-emerald-50'
                            }`}>
                            <Package className={`w-6 h-6 ${isSoldOut || isExpired ? 'text-gray-400' : 'text-emerald-600'}`} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 line-clamp-1">{lead.product}</h3>
                            <div className="flex flex-wrap gap-1 mt-1">
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                    {lead.category}
                                </span>
                                {isSoldOut && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                        Sold Out
                                    </span>
                                )}
                                {isExpired && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                        Expired
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1 text-lg font-bold text-emerald-600">
                            <IndianRupee className="w-4 h-4" />
                            ₹{lead.lead_price}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">per lead</div>
                    </div>
                </div>

                {/* Lead Details */}
                <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">{lead.quantity}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Quality:</span>
                        <span className="font-medium">{lead.quality_type || "Standard"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium text-right">{lead.delivery_location}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Buyer:</span>
                        <span className="font-medium">{lead.buyer?.name || "Unknown"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Slots Left:</span>
                        <span className={`font-medium ${isSoldOut ? 'text-red-600' : 'text-emerald-600'
                            }`}>
                            {lead.remaining_slots || 0}/{lead.max_sellers || 1}
                        </span>
                    </div>
                    {lead.expires_at && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Expires:</span>
                            <span className="font-medium text-orange-600">
                                {new Date(lead.expires_at).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </div>

                {/* Description */}
                {lead.description && (
                    <div className="mb-4">
                        <p className="text-sm text-gray-600 line-clamp-2">{lead.description}</p>
                    </div>
                )}

                {/* Contact Sharing Notice */}
                {lead.allow_sellers_contact && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                            <CheckCircle className="w-4 h-4" />
                            <span>Contact details shared after payment</span>
                        </div>
                    </div>
                )}

                {/* Single Purchase Button */}
                {!isSoldOut && !isExpired && (
                    <button
                        onClick={() => onPurchase(lead)}
                        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 group-hover:scale-105"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Purchase Lead
                    </button>
                )}

                {(isSoldOut || isExpired) && (
                    <button
                        disabled
                        className="w-full py-3 px-4 bg-gray-400 text-white rounded-lg font-semibold cursor-not-allowed"
                    >
                        {isExpired ? "Lead Expired" : "Sold Out"}
                    </button>
                )}
            </div>
        </div>
    );
}

// Purchased Lead Row Component
function PurchasedLeadRow({ purchase, paymentStatusConfig, onStartChat }) {
    const lead = purchase.lead;
    const StatusIcon = paymentStatusConfig?.icon || Clock;

    if (!lead) {
        return (
            <tr className="hover:bg-gray-50 transition-colors duration-150">
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Lead information not available
                    </div>
                </td>
            </tr>
        );
    }

    return (
        <tr className="hover:bg-gray-50 transition-colors duration-150">
            <td className="px-6 py-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">{lead.product}</h3>
                        <p className="text-sm text-gray-600 mt-1">{lead.category}</p>
                        <p className="text-sm text-gray-500 mt-1">{lead.quantity} • {lead.quality_type || "Standard"}</p>
                    </div>
                </div>
            </td>

            <td className="px-6 py-4">
                <div className="space-y-2">
                    <div>
                        <p className="font-medium text-gray-900">{lead.buyer?.name || "Unknown Buyer"}</p>
                        <p className="text-sm text-gray-600">{lead.buyer?.email || "No email"}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                        📍{lead.delivery_location}
                    </div>
                </div>
            </td>

            <td className="px-6 py-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
                        <IndianRupee className="w-4 h-4" />
                        ₹{lead.lead_price || "N/A"}
                    </div>
                    <div className="text-sm text-gray-600">
                        Purchased: {purchase?.createdAt ? new Date(purchase.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 capitalize">
                        {purchase.payment_mode}
                    </div>
                </div>
            </td>

            <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${paymentStatusConfig?.color || 'bg-gray-100 text-gray-800'}`}>
                    <StatusIcon className="w-3 h-3" />
                    {paymentStatusConfig?.text || 'Unknown'}
                </span>
            </td>

            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    {purchase?.payment_status === "approved" && (
                        <>
                            <button
                                onClick={() => onStartChat(lead, purchase)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                            >
                                <MessageCircle className="w-4 h-4" />
                                Chat
                            </button>

                            {lead.allow_sellers_contact && lead.buyer_contact_phone && lead.buyer_contact_email && (
                                <button
                                    onClick={() => {
                                        alert(`Buyer Contact Details:\nName: ${lead.buyer?.name || 'N/A'}\nPhone: ${lead.buyer_contact_phone}\nEmail: ${lead.buyer_contact_email}`);
                                    }}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                                >
                                    <Eye className="w-4 h-4" />
                                    View Contact
                                </button>
                            )}
                        </>
                    )}

                    {purchase?.payment_status === "pending" && (
                        <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors duration-200">
                            <Clock className="w-4 h-4" />
                            Awaiting Approval
                        </button>
                    )}

                    {purchase?.payment_status === "manual_pending" && (
                        <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors duration-200">
                            <Clock className="w-4 h-4" />
                            Awaiting Verification
                        </button>
                    )}

                    {purchase?.payment_status === "failed" && (
                        <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200">
                            <XCircle className="w-4 h-4" />
                            Payment Failed
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}

// Payment Method Modal Component
function PaymentMethodModal({
    lead,
    selectedMethod,
    onMethodSelect,
    onSubmit,
    onManualPaymentSubmit,
    onClose,
    loading,
    uploadingScreenshot,
    currencyRates,
    convertINRtoUSD,
    manualPaymentScreenshot,
    manualPaymentPreview,
    onFileUpload,
    currentPurchaseId,
    clearUploadedFile,
    uploadError,
    compressionProgress,
    fileInputRef
}) {
    const paymentMethods = [
        {
            id: "razorpay",
            name: "Razorpay",
            description: "Secure payment with cards, UPI, netbanking in Indian Rupees",
            icon: CreditCard,
            color: "bg-blue-500",
            popular: true,
            features: [
                "Pay in Indian Rupees (₹)",
                "Credit/Debit Cards Support",
                "UPI & Net Banking",
                "Instant Payment Processing",
                "No Currency Conversion"
            ]
        },
        {
            id: "paypal",
            name: "PayPal",
            description: "International payments with PayPal (Auto-converted to USD)",
            icon: Globe,
            color: "bg-yellow-500",
            popular: false,
            features: [
                "Auto-converted to USD",
                "International Payment Support",
                "PayPal Balance & Cards",
                "Buyer Protection",
                "Global Currency Support"
            ]
        },
        {
            id: "manual",
            name: "Manual Payment",
            description: "Bank transfer, UPI, or cash payment with screenshot upload",
            icon: Banknote,
            color: "bg-purple-500",
            popular: false,
            features: [
                "Bank Transfer / UPI Payment",
                "Upload Payment Screenshot",
                "Manual Verification",
                "24-48 Hours Approval",
                "No Automatic Processing"
            ]
        }
    ];

    const usdAmount = convertINRtoUSD(lead?.lead_price || 0);
    const exchangeRate = currencyRates.USD || 0.012;

    // Render manual payment screenshot upload
    const renderManualPaymentUpload = () => {
        return (
            <div className="space-y-6">
                {/* Step Indicator */}
                <div className="flex items-center justify-center mb-6">
                    <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white">
                            1
                        </div>
                        <div className="w-16 h-1 bg-emerald-600"></div>
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white">
                            2
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-green-800">
                            <strong>Purchase Created Successfully!</strong> Your purchase ID is: <code className="bg-green-100 px-2 py-1 rounded font-mono">{currentPurchaseId?.slice(-8)}</code>. Please upload your payment screenshot below.
                        </div>
                    </div>
                </div>

                {/* Upload Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Upload Payment Screenshot</h3>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                        <div className="flex items-start gap-3">
                            <Camera className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800">
                                <strong>Required for manual verification:</strong> Upload a clear screenshot of your payment confirmation, transaction receipt, or UPI payment success screen. <strong>Max file size: 2MB</strong>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {uploadError && (
                        <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-red-800">
                                    {uploadError}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upload Area */}
                    <div
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 ${manualPaymentScreenshot
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-300 bg-gray-50'
                            } ${uploadingScreenshot ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !uploadingScreenshot && document.getElementById('payment-screenshot').click()}
                    >
                        <input
                            id="payment-screenshot"
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={onFileUpload}
                            className="hidden"
                            disabled={uploadingScreenshot}
                        />

                        {manualPaymentScreenshot ? (
                            <div className="space-y-3">
                                <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-emerald-700">Screenshot uploaded!</p>
                                    <p className="text-sm text-emerald-600 mt-1">
                                        {manualPaymentScreenshot.name} ({(manualPaymentScreenshot.size / 1024 / 1024).toFixed(2)}MB)
                                    </p>
                                </div>
                                {/* Preview */}
                                {manualPaymentPreview && (
                                    <div className="mt-4">
                                        <img
                                            src={manualPaymentPreview}
                                            alt="Payment screenshot preview"
                                            className="max-w-full max-h-48 mx-auto rounded-lg border border-gray-300"
                                        />
                                        <p className="text-xs text-gray-500 mt-2">Preview of your uploaded screenshot</p>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        clearUploadedFile();
                                    }}
                                    className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                                    disabled={uploadingScreenshot}
                                >
                                    Remove file
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Upload className="w-8 h-8 text-gray-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-700">Click to upload payment screenshot</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Supported: JPG, PNG, GIF, WEBP (Max 10MB, will be compressed to 2MB)
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Compression Progress */}
                        {compressionProgress > 0 && compressionProgress < 100 && (
                            <div className="mt-4">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
                                        style={{ width: `${compressionProgress}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-600 mt-2">
                                    {compressionProgress < 50 ? "Processing image..." :
                                        compressionProgress < 80 ? "Compressing..." :
                                            "Preparing upload..."}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Instructions */}
                    <div className="bg-gray-50 p-4 rounded-xl">
                        <h4 className="font-medium text-gray-800 mb-2">What to include in screenshot:</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                            <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                Transaction amount (₹{lead?.lead_price})
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                Transaction ID or UTR number (if available)
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                Date and time of payment
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                Payment success message or confirmation
                            </li>
                            <li className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                <span className="text-amber-700"><strong>Tip:</strong> Use screenshot tool (Snipping Tool on Windows, Screenshot on Mac) for smaller files</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-3 mt-6 pt-4 border-t">
                    <button
                        onClick={onClose}
                        disabled={uploadingScreenshot}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                    <button
                        onClick={onManualPaymentSubmit}
                        disabled={uploadingScreenshot || !manualPaymentScreenshot || compressionProgress > 0}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                    >
                        {uploadingScreenshot ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Uploading...
                            </>
                        ) : compressionProgress > 0 ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Banknote className="w-4 h-4" />
                                Submit Payment Screenshot
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    };

    // Render payment method selection
    const renderPaymentMethodSelection = () => {
        return (
            <div className="space-y-6">
                {/* Lead Summary */}
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-5 rounded-xl border border-emerald-200">
                    <h3 className="font-semibold text-gray-800 mb-4 text-lg">Order Summary</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Product:</span>
                            <span className="font-medium text-gray-900">{lead?.product}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Category:</span>
                            <span className="font-medium text-gray-900">{lead?.category}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Quantity:</span>
                            <span className="font-medium text-gray-900">{lead?.quantity}</span>
                        </div>
                        <div className="border-t pt-3 mt-2">
                            <div className="flex justify-between items-center text-lg font-bold text-emerald-600">
                                <span>Total Amount:</span>
                                <div className="text-right">
                                    <div className="flex items-center gap-1">
                                        <IndianRupee className="w-5 h-5" />
                                        <span>{lead?.lead_price} INR</span>
                                    </div>
                                    {selectedMethod === "paypal" && (
                                        <div className="text-sm font-normal text-gray-600 mt-1">
                                            ≈ ${usdAmount} USD
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800 text-lg">Select Payment Method</h3>

                    <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {paymentMethods.map((method) => (
                            <div
                                key={method.id}
                                onClick={() => onMethodSelect(method.id)}
                                className={`p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${selectedMethod === method.id
                                    ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${method.color} text-white flex-shrink-0`}>
                                        <method.icon className="w-7 h-7" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-semibold text-gray-900 text-lg">{method.name}</h4>
                                            {method.popular && (
                                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                                                    Popular
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 mb-3">{method.description}</p>

                                        {/* Features List */}
                                        <div className="space-y-2">
                                            {method.features.map((feature, index) => (
                                                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Radio Button */}
                                    <div className="flex items-center flex-shrink-0">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={method.id}
                                            checked={selectedMethod === method.id}
                                            onChange={() => onMethodSelect(method.id)}
                                            className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Instructions */}
                {selectedMethod === "paypal" && (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                        <div className="flex items-start gap-3">
                            <ExternalLink className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800">
                                <strong>Note:</strong> After clicking "Continue to Pay", you will be redirected to PayPal to complete your payment. Please complete the payment process on PayPal and you will be redirected back to this site.
                            </div>
                        </div>
                    </div>
                )}

                {/* Manual Payment Instructions */}
                {selectedMethod === "manual" && (
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                        <div className="flex items-start gap-3">
                            <Banknote className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-purple-800">
                                <strong>Manual Payment Process:</strong>
                                <ol className="mt-2 list-decimal pl-5 space-y-1">
                                    <li>Complete your payment via bank transfer, UPI, or cash</li>
                                    <li>Click "Continue with Manual Payment"</li>
                                    <li>Upload a screenshot of your payment confirmation (Max 2MB)</li>
                                    <li>Our team will verify within 24-48 hours</li>
                                </ol>
                                <p className="mt-2 text-amber-700">
                                    <strong>Tip:</strong> Large images will be automatically compressed
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Security Notice */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-green-800">
                            <strong>Secure Payment:</strong> All payments are processed through certified payment gateways.
                            Your financial information is encrypted and secure. We never store your payment details.
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-4 border-t">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={loading || !selectedMethod}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Processing...
                            </>
                        ) : selectedMethod === "paypal" ? (
                            <>
                                <ExternalLink className="w-4 h-4" />
                                Redirect to PayPal
                                <ArrowRight className="w-4 h-4" />
                            </>
                        ) : selectedMethod === "manual" ? (
                            <>
                                <Banknote className="w-4 h-4" />
                                Continue with Manual Payment
                                <ArrowRight className="w-4 h-4" />
                            </>
                        ) : (
                            <>
                                <CreditCard className="w-4 h-4" />
                                Continue to Pay
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scaleIn">
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-2rem)]">
                    <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <CreditCard className="w-6 h-6 text-emerald-600" />
                            {currentPurchaseId
                                ? "Upload Payment Screenshot"
                                : "Choose Payment Method"}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                            disabled={loading || uploadingScreenshot}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Render different views based on manual payment flow */}
                    {selectedMethod === "manual" && currentPurchaseId
                        ? renderManualPaymentUpload()
                        : renderPaymentMethodSelection()}
                </div>
            </div>
        </div>
    );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color, loading = false }) {
    const colors = {
        blue: "from-blue-500 to-blue-600",
        emerald: "from-emerald-500 to-emerald-600",
        green: "from-green-500 to-green-600",
        orange: "from-orange-500 to-orange-600",
    };

    return (
        <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">{title}</p>
                    {loading ? <div className="w-16 h-7 bg-gray-200 rounded-lg animate-pulse"></div> : <p className="text-2xl font-bold text-gray-900">{value}</p>}
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${colors[color]} text-white group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
}

// Loading State Component
function LoadingState() {
    return (
        <div className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg">Loading leads...</p>
        </div>
    );
}

// Empty State Component
function EmptyState({ activeTab, searchTerm, selectedCategory, selectedLocation, onClearFilters }) {
    const messages = {
        available: "No available leads found",
        purchased: "You haven't purchased any leads yet",
    };

    const descriptions = {
        available: searchTerm || selectedCategory !== "all" || selectedLocation
            ? "Try adjusting your search filters to see more results"
            : "Check back later for new leads or contact support",
        purchased: "Purchase leads from the Available tab to see them here",
    };

    return (
        <div className="p-16 text-center">
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">{messages[activeTab] || "No data available"}</p>
            <p className="text-gray-400 text-sm mb-4">{descriptions[activeTab]}</p>

            {(searchTerm || selectedCategory !== "all" || selectedLocation) && activeTab === "available" && (
                <button
                    onClick={onClearFilters}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                    Clear All Filters
                </button>
            )}
        </div>
    );
}

// Add custom scrollbar styles
const styles = `
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes scaleIn {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
    
    .animate-fadeIn {
        animation: fadeIn 0.2s ease-out;
    }
    
    .animate-scaleIn {
        animation: scaleIn 0.2s ease-out;
    }
`;

// Add styles to head
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style")
    styleSheet.innerText = styles
    document.head.appendChild(styleSheet)
}