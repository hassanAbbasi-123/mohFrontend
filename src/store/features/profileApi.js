// src/store/features/profileApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const profileApi = createApi({
  reducerPath: "profileApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE}/profile`, // ✅ updated base for clarity
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
  tagTypes: ["Profile"],
  endpoints: (builder) => ({
    // Get profile data
    getProfile: builder.query({
      query: () => "/profile", // ✅ matches router.get("/profile")
      providesTags: ["Profile"],
    }),

    // Update profile
    updateProfile: builder.mutation({
      query: (profileData) => {
        const formData = new FormData();
        
        // Append all profile data
        Object.keys(profileData).forEach(key => {
          if (key === 'logo' && profileData[key] instanceof File) {
            formData.append('logo', profileData[key]);
          } else if (key === 'documents' && Array.isArray(profileData[key])) {
            profileData[key].forEach((doc, index) => {
              if (doc instanceof File) {
                formData.append('documents', doc);
              }
            });
          } else if (profileData[key] !== null && profileData[key] !== undefined) {
            formData.append(key, profileData[key]);
          }
        });

        return {
          url: "/update-profile", // ✅ matches router.put("/update-profile")
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["Profile"],
    }),

    // Change password
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: "/change-password", // ✅ matches router.put("/change-password")
        method: "PUT",
        body: passwordData,
      }),
    }),

    // Upload profile picture
    uploadProfilePicture: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append("profilePicture", file);
        
        return {
          url: "/upload-picture", // ✅ matches router.post("/upload-picture")
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Profile"],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useUploadProfilePictureMutation,
} = profileApi;
