// store/features/cartApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE}`,
    prepareHeaders: (headers, { getState }) => {
      let token = getState().auth?.user?.token;
      if (!token) {
        token = localStorage.getItem("token");
      }
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ["Cart", "CartCount"], // ✅ Added CartCount to tagTypes
  endpoints: (builder) => ({
    // ✅ Get user cart
    getCart: builder.query({
      query: () => "/cart/user/get-cart",
      providesTags: ["Cart"],
    }),

    // ✅ Get cart count for navbar
    getCartCount: builder.query({
      query: () => "/cart/user/cart-count",
      providesTags: ["CartCount"],
    }),

    // ✅ Add product to cart
    addToCart: builder.mutation({
      query: (productData) => ({
        url: "/cart/user/add-to-cart",
        method: "POST",
        body: productData,
      }),
      invalidatesTags: ["Cart", "CartCount"],
    }),

    // ✅ Update cart item
    updateCartItem: builder.mutation({
      query: (data) => ({
        url: "/cart/user/update-cart",
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ["Cart", "CartCount"],
    }),

    // ✅ Remove item from cart
    removeCartItem: builder.mutation({
      query: (data) => ({
        url: "/cart/user/remove-cart-item",
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: ["Cart", "CartCount"],
    }),

    // ✅ Clear cart
    clearCart: builder.mutation({
      query: () => ({
        url: "/cart/user/clear-cart",
        method: "DELETE",
      }),
      invalidatesTags: ["Cart", "CartCount"],
    }),

    // ✅ Apply coupon
    applyCoupon: builder.mutation({
      query: ({ code }) => ({
        url: "/cart/user/apply-coupon",
        method: "POST",
        body: { code },
      }),
      invalidatesTags: ["Cart"],
    }),

    // ✅ Remove coupon
    removeCoupon: builder.mutation({
      query: () => ({
        url: "/cart/user/remove-coupon",
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
  }),
});

// Export hooks
export const {
  useGetCartQuery,
  useGetCartCountQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useApplyCouponMutation,
  useRemoveCouponMutation,
} = cartApi;