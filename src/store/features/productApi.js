
// src/redux/features/productApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE}/products`,
    prepareHeaders: (headers, { getState }) => {
      // Try token from Redux store or localStorage (if persisted)
      const token = getState().auth?.token || localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Products", "MyProducts", "Wishlist"],

  endpoints: (builder) => ({
    // ====================
    // USER ROUTES
    // ====================
    getApprovedProducts: builder.query({
      query: ({ category, minPrice, maxPrice, search, page = 1, limit = 12 } = {}) => {
        const params = new URLSearchParams();
        if (category && category !== 'all') params.append("category", category);
        if (minPrice) params.append("minPrice", minPrice);
        if (maxPrice) params.append("maxPrice", maxPrice);
        if (search) params.append("search", search);
        params.append("page", page);
        params.append("limit", limit);
        
        return `/products?${params.toString()}`;
      },
      providesTags: ["Products"],
    }),

    getProductBySlug: builder.query({
      query: (slug) => `/products/${slug}`,
      providesTags: (_r, _e, slug) => [{ type: "Products", id: slug }],
    }),

    likeProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}/like`,
        method: "PATCH",
      }),
      invalidatesTags: ["Products", "Wishlist"],
    }),

    addReview: builder.mutation({
      query: ({ id, rating }) => ({
        url: `/products/${id}/review`,
        method: "POST",
        body: { rating },
      }),
      invalidatesTags: ["Products"],
    }),

    getWishlist: builder.query({
      query: () => `/user/wishlist`,
      providesTags: ["Wishlist"],
    }),

    addToWishlist: builder.mutation({
      query: ({ id }) => ({
        url: `/user/wishlist/${id}`,
        method: "POST",
      }),
      invalidatesTags: ["Wishlist"],
    }),

    // New query for search suggestions
    getSearchSuggestions: builder.query({
      query: (searchTerm) => {
        const params = new URLSearchParams();
        if (searchTerm) params.append("search", searchTerm);
        return `/products?${params.toString()}`;
      },
      transformResponse: (response) => {
        // Ensure we return an array
        return Array.isArray(response) ? response : [];
      },
    }),

    // ====================
    // SELLER ROUTES
    // ====================
    createProduct: builder.mutation({
      query: (formData) => ({
        url: `/seller/add-products`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["MyProducts", "Products"],
    }),

    updateOwnProduct: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/seller/update-products/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["MyProducts", "Products"],
    }),

    deleteOwnProduct: builder.mutation({
      query: (id) => ({
        url: `/seller/delet-products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MyProducts", "Products"],
    }),

    toggleStock: builder.mutation({
      query: (id) => ({
        url: `/seller/products/${id}/stock`,
        method: "PATCH",
      }),
      invalidatesTags: ["MyProducts", "Products"],
    }),

    toggleSale: builder.mutation({
      query: (id) => ({
        url: `/seller/onsale-products/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["MyProducts", "Products"],
    }),

    applyCoupon: builder.mutation({
      query: ({ id, couponId }) => ({
        url: `/seller/apply-coupon-onproduct/${id}`,
        method: "PATCH",
        body: { couponId },
      }),
      invalidatesTags: ["MyProducts", "Products"],
    }),

    removeCouponFromSellerProduct: builder.mutation({
      query: ({ id, couponId }) => ({
        url: `/seller/remove-coupon-fromproduct/${id}`,
        method: "PATCH",
        body: { couponId },
      }),
      invalidatesTags: ["MyProducts", "Products"],
    }),

    getMyProducts: builder.query({
      query: () => `/seller/get-seller-ownproducts`,
      providesTags: ["MyProducts"],
    }),

    // ====================
    // ADMIN ROUTES
    // ====================
    getAllProductsAdmin: builder.query({
      query: () => `/admin/get-all-products`,
      providesTags: ["Products"],
    }),

    approveProduct: builder.mutation({
      query: (id) => ({
        url: `/admin/approve-products/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Products"],
    }),

    rejectProduct: builder.mutation({
      query: (id) => ({
        url: `/admin/reject-products/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Products"],
    }),

    deleteProductAdmin: builder.mutation({
      query: (id) => ({
        url: `/admin/delete-product/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),

    assignCouponToProduct: builder.mutation({
      query: ({ id, couponId }) => ({
        url: `/admin/assign-products-coupons/${id}`,
        method: "PATCH",
        body: { couponId },
      }),
      invalidatesTags: ["Products"],
    }),

    removeCouponFromAdminProduct: builder.mutation({
      query: ({ id, couponId }) => ({
        url: `/admin/remove-coupons-products/${id}`,
        method: "DELETE",
        body: { couponId },
      }),
      invalidatesTags: ["Products"],
    }),
  }),
});

export const {
  // User
  useGetApprovedProductsQuery,
  useGetProductBySlugQuery,
  useLikeProductMutation,
  useAddReviewMutation,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useGetSearchSuggestionsQuery,
  
  // Seller
  useCreateProductMutation,
  useUpdateOwnProductMutation,
  useDeleteOwnProductMutation,
  useToggleStockMutation,
  useToggleSaleMutation,
  useApplyCouponMutation,
  useRemoveCouponFromSellerProductMutation,
  useGetMyProductsQuery,

  // Admin
  useGetAllProductsAdminQuery,
  useApproveProductMutation,
  useRejectProductMutation,
  useDeleteProductAdminMutation,
  useAssignCouponToProductMutation,
  useRemoveCouponFromAdminProductMutation,
} = productApi;
