// src/store/features/bannerApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"; // adjust to your backend URL

export const bannerApi = createApi({
  reducerPath: "bannerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE}/banners`,
  }),
  tagTypes: ["Banners"],
  endpoints: (builder) => ({
    // ==========================
    //  Get All Banners (Admin)
    // ==========================
    getAllBanners: builder.query({
      query: () => `/get-all-banners`,
      providesTags: ["Banners"],
    }),

    // ==========================
    //  Get Active Banners (Public)
    // ==========================
    getActiveBanners: builder.query({
      query: () => `/active`,
      providesTags: ["Banners"],
    }),

    // ==========================
    //  Create Banner (Admin)
    // ==========================
    createBanner: builder.mutation({
      query: (formData) => ({
        url: `/create-banners`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Banners"],
    }),

    // ==========================
    //  Update Banner (Admin)
    // ==========================
    updateBanner: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/update-banners/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Banners"],
    }),

    // ==========================
    //  Delete Banner (Admin)
    // ==========================
    deleteBanner: builder.mutation({
      query: (id) => ({
        url: `/delete-banners/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Banners"],
    }),

    // ==========================
    //  Toggle Status (Admin)
    // ==========================
    toggleBannerStatus: builder.mutation({
      query: (id) => ({
        url: `/toggle-status/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Banners"],
    }),
  }),
});

export const {
  useGetAllBannersQuery,
  useGetActiveBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useToggleBannerStatusMutation,
} = bannerApi;