// orderApiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// 🔹 Base fetch with token
const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE}/order`,
  prepareHeaders: (headers) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
    }
    return headers;
  },
});

// 🔹 Wrapper for better error messages
const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    const status = result.error.status;
    const msg = result.error.data?.message || "Something went wrong";

    if (status === 401) {
      console.error("❌ Unauthorized:", msg);
    } else if (status === 403) {
      console.error("⛔ Forbidden:", msg);
    } else if (status === 404) {
      console.error("🔎 Not Found:", msg);
    } else {
      console.error("⚠️ API Error:", msg);
    }
  }

  return result;
};

export const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Order', 'SubOrder', 'Sales', 'Analytics'],
  endpoints: (builder) => ({
    // ==========================
    // 🔹 USER ENDPOINTS (Buyer)
    // ==========================

    createOrder: builder.mutation({
      query: (orderData) => ({
        url: '/user/create-orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order'],
    }),

    buyNow: builder.mutation({
      query: (buyNowData) => ({
        url: '/user/buy-now',
        method: 'POST',
        body: buyNowData,
      }),
      invalidatesTags: ['Order'],
    }),

    getMyOrders: builder.query({
      query: (params = {}) => {
        const { from, to, status } = params;
        let url = '/user/get-my-orders?';
        if (from) url += `from=${from}&`;
        if (to) url += `to=${to}&`;
        if (status) url += `status=${status}&`;
        return url;
      },
      providesTags: ['Order'],
    }),

    getOrderDetails: builder.query({
      query: (id) => `/user/get-my-order-by-id/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),

    cancelOrder: builder.mutation({
      query: ({ id, cancellationReason }) => ({
        url: `/user/cancel-order/${id}`,
        method: 'PUT',
        body: { cancellationReason },
      }),
      invalidatesTags: ['Order'],
    }),

    confirmDelivery: builder.mutation({
      query: (id) => ({
        url: `/user/confirm-delivery/${id}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Order'],
    }),

    requestReturn: builder.mutation({
      query: ({ id, itemId, quantity, reason }) => ({
        url: `/user/request-return/${id}`,
        method: 'POST',
        body: { itemId, quantity, reason },
      }),
      invalidatesTags: ['Order'],
    }),

    openDispute: builder.mutation({
      query: ({ id, itemId, reason, attachments }) => {
        const formData = new FormData();
        formData.append('itemId', itemId);
        formData.append('reason', reason);

        if (attachments && attachments.length > 0) {
          attachments.forEach((file) => {
            formData.append('attachments', file);
          });
        }

        return {
          url: `/user/dispute/${id}`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Order'],
    }),

    // ==========================
    // 🔹 SELLER ENDPOINTS
    // ==========================

    getMySales: builder.query({
      query: (params = {}) => {
        const { from, to, status } = params;
        let url = '/seller/my-sales?';
        if (from) url += `from=${from}&`;
        if (to) url += `to=${to}&`;
        if (status) url += `status=${status}&`;
        return url;
      },
      providesTags: ['Sales'],
    }),

    updateItemStatus: builder.mutation({
      query: ({ orderId, itemId, status, trackingNumber }) => ({
        url: '/seller/update-item-status',
        method: 'PUT',
        body: { orderId, itemId, status, trackingNumber },
      }),
      invalidatesTags: ['Order', 'SubOrder', 'Sales'],
    }),

    cancelItem: builder.mutation({
      query: ({ orderId, itemId, cancellationReason }) => ({
        url: `/seller/cancel-item/${orderId}/${itemId}`,
        method: 'PUT',
        body: { cancellationReason },
      }),
      invalidatesTags: ['Order', 'SubOrder', 'Sales'],
    }),

    confirmPaymentCollection: builder.mutation({
      query: ({ orderId, itemId }) => ({
        url: '/seller/confirm-cod',
        method: 'PUT',
        body: { orderId, itemId },
      }),
      invalidatesTags: ['Order', 'SubOrder', 'Sales'],
    }),

    addTracking: builder.mutation({
      query: ({ orderId, trackingNumber }) => ({
        url: `/seller/add-tracking/${orderId}`,
        method: 'PUT',
        body: { trackingNumber },
      }),
      invalidatesTags: ['Order', 'SubOrder', 'Sales'],
    }),

    // ==========================
    // 🔹 ADMIN ENDPOINTS
    // ==========================

    getAllOrders: builder.query({
      query: (params = {}) => {
        const { from, to, status, sellerId, userId } = params;
        let url = '/admin/get-all-orders?';
        if (from) url += `from=${from}&`;
        if (to) url += `to=${to}&`;
        if (status) url += `status=${status}&`;
        if (sellerId) url += `sellerId=${sellerId}&`;
        if (userId) url += `userId=${userId}&`;
        return url;
      },
      providesTags: ['Order'],
    }),

    updateOrderStatus: builder.mutation({
      query: ({ id, orderStatus, cancellationReason }) => ({
        url: `/admin/update-status/${id}`,
        method: 'PUT',
        body: { orderStatus, cancellationReason },
      }),
      invalidatesTags: ['Order'],
    }),

    processRefund: builder.mutation({
      query: ({ id, refundReason }) => ({
        url: `/admin/refund/${id}`,
        method: 'POST',
        body: { refundReason },
      }),
      invalidatesTags: ['Order'],
    }),

    deleteOrder: builder.mutation({
      query: (id) => ({
        url: `/admin/delete/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Order'],
    }),

    getOrderAnalytics: builder.query({
      query: (params = {}) => {
        const { from, to } = params;
        let url = '/admin/analytics/sales?';
        if (from) url += `from=${from}&`;
        if (to) url += `to=${to}&`;
        return url;
      },
      providesTags: ['Analytics'],
    }),

    resolveDispute: builder.mutation({
      query: ({ disputeId, resolution, outcome }) => ({
        url: `/admin/dispute/${disputeId}`,
        method: 'PUT',
        body: { resolution, outcome },
      }),
      invalidatesTags: ['Order'],
    }),

    updateReturnStatus: builder.mutation({
      query: ({ returnId, status, adminNote }) => ({
        url: `/admin/return/${returnId}`,
        method: 'PUT',
        body: { status, adminNote },
      }),
      invalidatesTags: ['Order'],
    }),
  }),
});

// Export hooks
export const {
  // User
  useCreateOrderMutation,
  useBuyNowMutation,
  useGetMyOrdersQuery,
  useGetOrderDetailsQuery,
  useCancelOrderMutation,
  useConfirmDeliveryMutation,
  useRequestReturnMutation,
  useOpenDisputeMutation,

  // Seller
  useGetMySalesQuery,
  useUpdateItemStatusMutation,
  useCancelItemMutation,
  useConfirmPaymentCollectionMutation,
  useAddTrackingMutation,

  // Admin
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
  useProcessRefundMutation,
  useDeleteOrderMutation,
  useGetOrderAnalyticsQuery,
  useResolveDisputeMutation,
  useUpdateReturnStatusMutation,
} = orderApi;

export default orderApi;
