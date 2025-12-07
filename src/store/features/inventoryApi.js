// src/store/features/inventoryApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const inventoryApi = createApi({
  reducerPath: "inventoryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE}/inventory`, // ✅ adjust if your API prefix is different
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: ["Inventory"],

  endpoints: (builder) => ({
    // ==================== SELLER ====================

    getMyInventory: builder.query({
      query: () => "/stock/my-inventory",
      providesTags: ["Inventory"],
    }),

    updateQuantity: builder.mutation({
      query: ({ id, data }) => ({
        url: `/stock/${id}/update-quantity`,
        method: "PATCH",
        body: data, // { quantity, reason }
      }),
      invalidatesTags: ["Inventory"],
    }),

    addStock: builder.mutation({
      query: ({ id, data }) => ({
        url: `/seller/add-stock/${id}`,
        method: "PATCH",
        body: data, // { amount, reason }
      }),
      invalidatesTags: ["Inventory"],
    }),

    removeStock: builder.mutation({
      query: ({ id, data }) => ({
        url: `/seller/remove-stock/${id}`,
        method: "PATCH",
        body: data, // { amount, reason }
      }),
      invalidatesTags: ["Inventory"],
    }),

    toggleStock: builder.mutation({
      query: ({ id }) => ({
        url: `/seller/toggle-stock/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Inventory"],
    }),

    getStockHistory: builder.query({
      query: (id) => `/seller/stock-history/${id}`,
      providesTags: ["Inventory"],
    }),

    // ==================== ADMIN ====================

    getAllInventory: builder.query({
      query: () => "/admin/stock/all",
      providesTags: ["Inventory"],
    }),

    getSellerInventory: builder.query({
      query: (sellerId) => `/admin/get-seller-inventory/${sellerId}`,
      providesTags: ["Inventory"],
    }),
  }),
});

export const {
  // Seller
  useGetMyInventoryQuery,
  useUpdateQuantityMutation,
  useAddStockMutation,
  useRemoveStockMutation,
  useToggleStockMutation,
  useGetStockHistoryQuery,

  // Admin
  useGetAllInventoryQuery,
  useGetSellerInventoryQuery,
} = inventoryApi;