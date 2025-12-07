// src/redux/features/analyticsApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const analyticsApi = createApi({
  reducerPath: "analyticsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE}/analytics`,
    prepareHeaders: (headers, { getState }) => {
      // Try token from Redux store or localStorage (if persisted)
      const token = getState().auth?.token || localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Analytics"],

  endpoints: (builder) => ({
    // ====================
    // ADMIN ANALYTICS ROUTES
    // ====================
    
    // 1) Get Dashboard Overview (Admin)
    getAdminDashboard: builder.query({
      query: ({ from, to } = {}) => {
        const params = new URLSearchParams();
        if (from) params.append("from", from);
        if (to) params.append("to", to);
        return `/admin/dashboard?${params.toString()}`;
      },
      providesTags: ["Analytics"],
    }),

    // 2) Get Sales Reports (Admin)
    getSalesReport: builder.query({
      query: ({ from, to, groupBy } = {}) => {
        const params = new URLSearchParams();
        if (from) params.append("from", from);
        if (to) params.append("to", to);
        if (groupBy) params.append("groupBy", groupBy);
        return `/admin/sales-report?${params.toString()}`;
      },
      providesTags: ["Analytics"],
    }),

    // 3) Get Product Performance Report (Admin)
    getProductPerformance: builder.query({
      query: ({ from, to, category, status } = {}) => {
        const params = new URLSearchParams();
        if (from) params.append("from", from);
        if (to) params.append("to", to);
        if (category) params.append("category", category);
        if (status) params.append("status", status);
        return `/admin/product-performance?${params.toString()}`;
      },
      providesTags: ["Analytics"],
    }),

    // 4) Get Customer Analytics (Admin)
    getCustomerAnalytics: builder.query({
      query: ({ from, to } = {}) => {
        const params = new URLSearchParams();
        if (from) params.append("from", from);
        if (to) params.append("to", to);
        return `/admin/customer-analytics?${params.toString()}`;
      },
      providesTags: ["Analytics"],
    }),

    // 5) Get Financial Reports (Admin)
    getFinancialReport: builder.query({
      query: ({ from, to } = {}) => {
        const params = new URLSearchParams();
        if (from) params.append("from", from);
        if (to) params.append("to", to);
        return `/admin/financial-report?${params.toString()}`;
      },
      providesTags: ["Analytics"],
    }),

    // ====================
    // SELLER ANALYTICS ROUTES
    // ====================
    
    // 1) Get Seller Dashboard
    getSellerDashboard: builder.query({
      query: ({ from, to } = {}) => {
        const params = new URLSearchParams();
        if (from) params.append("from", from);
        if (to) params.append("to", to);
        return `/seller/dashboard?${params.toString()}`;
      },
      providesTags: ["Analytics"],
    }),

    // 2) Get Seller Sales Report
    getSellerSalesReport: builder.query({
      query: ({ from, to, groupBy } = {}) => {
        const params = new URLSearchParams();
        if (from) params.append("from", from);
        if (to) params.append("to", to);
        if (groupBy) params.append("groupBy", groupBy);
        return `/seller/sales-report?${params.toString()}`;
      },
      providesTags: ["Analytics"],
    }),

    // 3) Get Seller Product Performance
    getSellerProductPerformance: builder.query({
      query: ({ from, to } = {}) => {
        const params = new URLSearchParams();
        if (from) params.append("from", from);
        if (to) params.append("to", to);
        return `/seller/product-performance?${params.toString()}`;
      },
      providesTags: ["Analytics"],
    }),

    // 4) Get Seller Order Analytics
    getSellerOrderAnalytics: builder.query({
      query: ({ from, to } = {}) => {
        const params = new URLSearchParams();
        if (from) params.append("from", from);
        if (to) params.append("to", to);
        return `/seller/order-analytics?${params.toString()}`;
      },
      providesTags: ["Analytics"],
    }),

    // 5) Get Seller Customer Insights
    getSellerCustomerInsights: builder.query({
      query: ({ from, to } = {}) => {
        const params = new URLSearchParams();
        if (from) params.append("from", from);
        if (to) params.append("to", to);
        return `/seller/customer-insights?${params.toString()}`;
      },
      providesTags: ["Analytics"],
    }),
  }),
});

export const {
  // Admin Analytics
  useGetAdminDashboardQuery,
  useGetSalesReportQuery,
  useGetProductPerformanceQuery,
  useGetCustomerAnalyticsQuery,
  useGetFinancialReportQuery,
  
  // Seller Analytics
  useGetSellerDashboardQuery,
  useGetSellerSalesReportQuery,
  useGetSellerProductPerformanceQuery,
  useGetSellerOrderAnalyticsQuery,
  useGetSellerCustomerInsightsQuery,
} = analyticsApi;