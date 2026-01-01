import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Function to get the auth token (adjust key name if yours is different)
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || ''; // change 'token' if you store it under another key
  }
  return '';
};

export const partnershipApi = createApi({
  reducerPath: 'partnershipApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE}/partnership`,

    // Global header preparation – adds Content-Type and Authorization when token exists
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');

      const token = getAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },

    // Include cookies if you use httpOnly cookies (safe to keep)
    credentials: 'include',
  }),

  tagTypes: ['Partnership', 'Meeting'],

  endpoints: (builder) => ({
    // Public mutations – no auth required
    createPartnershipInquiry: builder.mutation({
      query: (body) => ({
        url: '/create-partnership-inquiry',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Partnership'],
    }),

    createMeetingRequest: builder.mutation({
      query: (body) => ({
        url: '/create-meeting-request',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Meeting'],
    }),

    // Protected queries – require admin token (automatically added via prepareHeaders)
    getAllPartnerships: builder.query({
      query: () => '/admin/get-all-partnerships',
      providesTags: ['Partnership'],
    }),

    getAllMeetings: builder.query({
      query: () => '/admin/get-all-meetings',
      providesTags: ['Meeting'],
    }),
  }),
});

export const {
  useCreatePartnershipInquiryMutation,
  useCreateMeetingRequestMutation,
  useGetAllPartnershipsQuery,
  useLazyGetAllPartnershipsQuery,
  useGetAllMeetingsQuery,
  useLazyGetAllMeetingsQuery,
} = partnershipApi;