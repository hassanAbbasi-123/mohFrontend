// src/store/features/couponApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const couponApi = createApi({
  reducerPath: "couponApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE}/coupons`,
    prepareHeaders: (headers, { getState }) => {
      const token =
        getState().auth?.token ||
        getState().auth?.user?.token ||
        localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Coupons"],

  endpoints: (builder) => ({
    // ---------------- ADMIN ENDPOINTS ----------------
    createCouponAdmin: builder.mutation({
      query: (data) => ({
        url: "/admin/create-coupon",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Coupons"],
    }),

    updateCouponAdmin: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/update-coupon/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Coupons"],
    }),

    toggleCouponAdmin: builder.mutation({
      query: ({ id }) => ({
        url: `/admin/toggle/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Coupons"],
    }),

    deleteCouponAdmin: builder.mutation({
      query: ({ id }) => ({
        url: `/admin/delete-coupon/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Coupons"],
    }),

    getAllCouponsAdmin: builder.query({
      query: () => "/admin/get-all-coupons",
      providesTags: ["Coupons"],
    }),

    // ---------------- SELLER ENDPOINTS ----------------
    getSellerCoupons: builder.query({
      query: () => "/seller/get-own-coupons",
      providesTags: ["Coupons"],
    }),

    createCouponSeller: builder.mutation({
      query: (data) => ({
        url: "/seller/create-coupon",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Coupons"],
    }),

    updateCouponSeller: builder.mutation({
      query: ({ id, data }) => ({
        url: `/seller/update-coupon/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Coupons"],
    }),

    toggleCouponSeller: builder.mutation({
      query: ({ id }) => ({
        url: `/seller/toggle-coupon/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Coupons"],
    }),

    deleteCouponSeller: builder.mutation({
      query: ({ id }) => ({
        url: `/seller/delete-coupon/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Coupons"],
    }),

    // ---------------- USER ENDPOINTS ----------------
    applyCoupon: builder.mutation({
      query: (data) => ({
        url: "/user/apply-coupon",
        method: "POST",
        body: data,
      }),
    }),

    getAvailableCoupons: builder.query({
      query: ({ sellerId, productId } = {}) => {
        const queryParams = [];
        if (sellerId) queryParams.push(`sellerId=${sellerId}`);
        if (productId) queryParams.push(`productId=${productId}`);
        const qs = queryParams.length ? `?${queryParams.join("&")}` : "";
        return `/user/available-coupon${qs}`;
      },
    }),

    rollbackCouponUsage: builder.mutation({
      query: ({ id }) => ({
        url: `/user/rollback-coupon/${id}`,
        method: "POST",
      }),
      invalidatesTags: ["Coupons"],
    }),
  }),
});

export const {
  // ADMIN HOOKS
  useCreateCouponAdminMutation,
  useUpdateCouponAdminMutation,
  useToggleCouponAdminMutation,
  useDeleteCouponAdminMutation,
  useGetAllCouponsAdminQuery,

  // SELLER HOOKS
  useCreateCouponSellerMutation,
  useUpdateCouponSellerMutation,
  useToggleCouponSellerMutation,
  useDeleteCouponSellerMutation,
  useGetSellerCouponsQuery,

  // USER HOOKS
  useApplyCouponMutation,
  useGetAvailableCouponsQuery,
  useRollbackCouponUsageMutation,
} = couponApi;
