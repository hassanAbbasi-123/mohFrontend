import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE}/categories`, // adjust if your route prefix differs
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    // ================= PUBLIC =================
    getAllCategories: builder.query({
      query: () => "/user/get-all-cat",
      providesTags: ["Category"],
    }),
    getCategoryByIdOrSlug: builder.query({
      query: (idOrSlug) => `/user/get-cat-by-id/${idOrSlug}`,
    }),
    getSubcategories: builder.query({
      query: (parentId) => `/user/subcategories/get-by-sub-cat/${parentId}`,
    }),

    // ================= SELLER =================
    createCategory: builder.mutation({
      query: (data) => ({
        url: "/seller/create-cat",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),
    updateOwnCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/seller/update-cat/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),
    deleteOwnCategory: builder.mutation({
      query: (id) => ({
        url: `/seller/delete-cat/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),

    getAllCategoriesWithSubForSeller: builder.query({
      query: () => "/seller/get-all-categories-with-sub",
      providesTags: ["Category"],
    }),

    // ================= ADMIN =================
    createAdminCategory: builder.mutation({
      query: (data) => ({
        url: "/admin/create-cat",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),
    toggleCategoryStatus: builder.mutation({
      query: (id) => ({
        url: `/admin/toggle-cat/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Category"],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/update-cat/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/admin/delete-cat/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),

    getAllCategoriesAdmin: builder.query({
      query: () => "/admin/get-all-categories",
      providesTags: ["Category"],
    }),
  }),
});

export const {
  // Public
  useGetAllCategoriesQuery,
  useGetCategoryByIdOrSlugQuery,
  useGetSubcategoriesQuery,
  // Seller
  useCreateCategoryMutation,
  useUpdateOwnCategoryMutation,
  useDeleteOwnCategoryMutation,
  useGetAllCategoriesWithSubForSellerQuery,
  // Admin
  useCreateAdminCategoryMutation,
    useGetAllCategoriesAdminQuery, // ✅ admin
  useToggleCategoryStatusMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
