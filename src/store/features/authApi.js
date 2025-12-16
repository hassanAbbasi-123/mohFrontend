// src/store/features/authApi.js (FULLY UPDATED - added new mutations for OTP verify, resend, forgot, reset)
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE}/auth`,
  prepareHeaders: (headers) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  tagTypes: ['Seller'],
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (data) => {
        const isFormData =
          typeof FormData !== 'undefined' && data instanceof FormData;
        return {
          url: '/register',
          method: 'POST',
          body: isFormData ? data : JSON.stringify(data),
          headers: isFormData
            ? undefined
            : { 'Content-Type': 'application/json' },
        };
      },
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: { 'Content-Type': 'application/json' },
      }),
    }),
    verifyOtp: builder.mutation({
      query: ({ userId, otp }) => ({
        url: '/verify-otp',
        method: 'POST',
        body: { userId, otp },
        headers: { 'Content-Type': 'application/json' },
      }),
    }),
    resendVerificationOtp: builder.mutation({
      query: ({ email }) => ({
        url: '/resend-verification-otp',
        method: 'POST',
        body: { email },
        headers: { 'Content-Type': 'application/json' },
      }),
    }),
    forgotPassword: builder.mutation({
      query: ({ email }) => ({
        url: '/forgot-password',
        method: 'POST',
        body: { email },
        headers: { 'Content-Type': 'application/json' },
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ email, otp, newPassword }) => ({
        url: '/reset-password',
        method: 'POST',
        body: { email, otp, newPassword },
        headers: { 'Content-Type': 'application/json' },
      }),
    }),
    approveSeller: builder.mutation({
      query: ({ sellerId, action }) => ({
        url: `/approve-seller/${sellerId}`,
        method: 'PATCH',
        body: JSON.stringify({ action }),
        headers: { 'Content-Type': 'application/json' },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Seller', id: arg.sellerId },
      ],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useVerifyOtpMutation,
  useResendVerificationOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useApproveSellerMutation,
} = authApi;