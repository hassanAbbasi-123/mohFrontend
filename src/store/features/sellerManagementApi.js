import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const sellerManagementApi = createApi({
  reducerPath: "sellerManagementApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE}/seller-management/`,
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Seller"],
  endpoints: (builder) => ({
    // GET sellers (admin)
    getSellers: builder.query({
      query: ({ search, status, page, limit }) => ({
        url: "admin/sellers",
        params: { search, status, page, limit },
      }),
      providesTags: ["Seller"],
    }),

    // PATCH approve / reject
    approveOrDisapproveSeller: builder.mutation({
      query: ({ sellerId, action }) => ({
        url: `admin/approve-seller/${sellerId}`,
        method: "PATCH",
        body: { action },
      }),
      invalidatesTags: ["Seller"],
    }),

    // GET performance
    getSellerPerformance: builder.query({
      query: (sellerId) => `admin/seller-performance/${sellerId}`,
    }),
  }),
});

export const {
  useGetSellersQuery,
  useApproveOrDisapproveSellerMutation,
  useGetSellerPerformanceQuery,
} = sellerManagementApi;