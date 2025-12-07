// store/features/accountsApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const accountsApi = createApi({
  reducerPath: "accountsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE}/accounts`,
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
          headers.set("authorization", `Bearer ${token}`);
        }
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Customers", "Customer", "Transactions", "Ledger", "Inventory", "Reports"],
  endpoints: (builder) => ({
    // Customer Management
    getCustomers: builder.query({
      query: ({ page = 1, limit = 1000, search = "" } = {}) => 
        `/admin/customers?page=${page}&limit=${limit}&search=${search}`,
      providesTags: ["Customers"],
    }),

    createCustomer: builder.mutation({
      query: (customerData) => ({
        url: "/admin/customers",
        method: "POST",
        body: customerData,
      }),
      invalidatesTags: ["Customers"],
    }),

    deleteCustomer: builder.mutation({
      query: (id) => ({
        url: `/admin/customers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Customers"],
    }),

    toggleCustomerStatus: builder.mutation({
      query: (id) => ({
        url: `/admin/customers/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["Customers", "Customer"],
    }),

    downloadLedgerPDF: builder.mutation({
      query: (customerId) => ({
        url: `/admin/customers/${customerId}/ledger/pdf`,
        method: "GET",
        responseHandler: async (response) => {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `account-ledger-${customerId}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
          return { success: true };
        },
        cache: "no-cache",
      }),
    }),

    // CUSTOMER DASHBOARD ENDPOINTS
    getMyLedger: builder.query({
      query: () => ({
        url: "/customer/my-ledger",
        method: "GET",
      }),
      providesTags: ["Ledger"],
    }),

    getMyTransactions: builder.query({
      query: ({ page = 1, limit = 100 } = {}) => ({
        url: `/customer/transactions?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["Transactions"],
    }),

    downloadMyLedgerPDF: builder.mutation({
      query: () => ({
        url: "/customer/ledger/pdf",
        method: "GET",
        responseHandler: async (response) => {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `my-ledger-${new Date().toISOString().split('T')[0]}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
          return { success: true };
        },
        cache: "no-cache",
      }),
    }),

    // Purchase & Payment
    createPurchase: builder.mutation({
      query: ({ customerId, ...purchaseData }) => ({
        url: `/admin/customers/${customerId}/purchases`,
        method: "POST",
        body: purchaseData,
      }),
      invalidatesTags: ["Customer", "Transactions", "Ledger", "Customers", "Inventory", "Reports"],
    }),

    updatePurchase: builder.mutation({
      query: ({ customerId, transactionId, ...purchaseData }) => ({
        url: `/admin/customers/${customerId}/purchases/${transactionId}`,
        method: "PUT",
        body: purchaseData,
      }),
      invalidatesTags: ["Customer", "Transactions", "Ledger", "Customers", "Inventory", "Reports"],
    }),

    makePayment: builder.mutation({
      query: ({ customerId, ...paymentData }) => ({
        url: `/admin/customers/${customerId}/payments`,
        method: "POST",
        body: paymentData,
      }),
      invalidatesTags: ["Customer", "Transactions", "Ledger", "Customers"],
    }),

    // Inventory Management
    getInventory: builder.query({
      query: ({ page = 1, limit = 1000, search = "" } = {}) => 
        `/admin/inventory?page=${page}&limit=${limit}&search=${search}`,
      providesTags: ["Inventory"],
    }),

    addInventory: builder.mutation({
      query: (inventoryData) => ({
        url: "/admin/inventory",
        method: "POST",
        body: inventoryData,
      }),
      invalidatesTags: ["Inventory"],
    }),

    // Stock Purchase
    addStockPurchase: builder.mutation({
      query: (stockData) => ({
        url: "/admin/stock-purchase",
        method: "POST",
        body: stockData,
      }),
      invalidatesTags: ["Inventory", "Transactions", "Reports"],
    }),

    // Expense Management
    addExpense: builder.mutation({
      query: (expenseData) => ({
        url: "/admin/expenses",
        method: "POST",
        body: expenseData,
      }),
      invalidatesTags: ["Transactions", "Reports"],
    }),

    // Commission Management
    addCommission: builder.mutation({
      query: (commissionData) => ({
        url: "/admin/commissions",
        method: "POST",
        body: commissionData,
      }),
      invalidatesTags: ["Transactions", "Reports"],
    }),

    // Damaged Goods
    addDamagedGoods: builder.mutation({
      query: (damagedData) => ({
        url: "/admin/damaged-goods",
        method: "POST",
        body: damagedData,
      }),
      invalidatesTags: ["Inventory", "Transactions", "Reports"],
    }),

    // Bully Purchase
    addBullyPurchase: builder.mutation({
      query: (bullyData) => ({
        url: "/admin/bully-purchase",
        method: "POST",
        body: bullyData,
      }),
      invalidatesTags: ["Inventory", "Transactions", "Reports"],
    }),

    // Reminders
    addReminder: builder.mutation({
      query: (reminderData) => ({
        url: "/admin/reminders",
        method: "POST",
        body: reminderData,
      }),
      invalidatesTags: ["Transactions"],
    }),

    // Reports
    getProfitLossReport: builder.query({
      query: ({ period = "all" } = {}) => 
        `/admin/profit-loss?period=${period}`,
      providesTags: ["Reports"],
    }),

    getLowStockAlerts: builder.query({
      query: () => `/admin/low-stock-alerts`,
      providesTags: ["Inventory"],
    }),

    // Get customer transactions (admin)
    getCustomerTransactions: builder.query({
      query: (customerId) => `/admin/customers/${customerId}/transactions`,
      providesTags: ["Transactions"],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useDeleteCustomerMutation,
  useToggleCustomerStatusMutation,
  useDownloadLedgerPDFMutation,
  
  // Customer dashboard hooks
  useGetMyLedgerQuery,
  useGetMyTransactionsQuery,
  useDownloadMyLedgerPDFMutation,
  
  // Purchase & payment
  useCreatePurchaseMutation,
  useUpdatePurchaseMutation,
  useMakePaymentMutation,
  
  // Inventory
  useGetInventoryQuery,
  useAddInventoryMutation,
  useAddStockPurchaseMutation,
  
  // Other
  useAddExpenseMutation,
  useAddCommissionMutation,
  useAddDamagedGoodsMutation,
  useAddBullyPurchaseMutation,
  useAddReminderMutation,
  useGetProfitLossReportQuery,
  useGetLowStockAlertsQuery,
  useGetCustomerTransactionsQuery,
} = accountsApi;