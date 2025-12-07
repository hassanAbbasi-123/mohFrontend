// src/store/features/wishlistApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const wishlistApi = createApi({
  reducerPath: "wishlistApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE}/wishlist`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token || localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Wishlist"],

  endpoints: (builder) => ({
    // 🟢 Get wishlist
    getWishlist: builder.query({
      query: () => `/user/get-wishlist`,
      providesTags: ["Wishlist"],
    }),

    // 🟢 Add to wishlist
    addToWishlist: builder.mutation({
      query: ({ id }) => ({
        url: `/user/add-to-wishlist`,
        method: "POST",
        body: { productId: id },
      }),
      invalidatesTags: ["Wishlist"],
    }),

    // 🟢 Remove from wishlist
    removeFromWishlist: builder.mutation({
      query: ({ id }) => ({
        url: `/user/remove-from-wishlist`,
        method: "PATCH",
        body: { productId: id },
      }),
      invalidatesTags: ["Wishlist"],
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} = wishlistApi;
