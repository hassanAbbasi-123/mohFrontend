import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const contactApi = createApi({
  reducerPath: 'contactApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE}/contact`,
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
          // Critical fix: Use "Authorization" with capital A
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: ['Contact'],
  endpoints: (builder) => ({
    // Public: Create contact from frontend form (no auth needed)
    createContact: builder.mutation({
      query: (body) => ({
        url: '/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Contact'],
    }),

    // Admin: Get all contacts (protected by isAdmin middleware)
    getAllContacts: builder.query({
      query: () => '/admin/get-all',
      providesTags: ['Contact'],
    }),
  }),
});

export const {
  useCreateContactMutation,
  useGetAllContactsQuery,
  useLazyGetAllContactsQuery,
} = contactApi;