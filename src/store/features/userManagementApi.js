// src/store/features/userManagementApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Base URL from env
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const userManagementApi = createApi({
  reducerPath: "userManagementApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/user-management`,
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem("token"); // JWT stored in localStorage
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    // GET all users
    getUsers: builder.query({
      query: ({ search = "", status = "all" } = {}) => ({
        url: "/get-users",
        method: "GET",
        params: { search, status },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "Users", id: _id })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
    }),

    // GET single user by ID
    getUserById: builder.query({
      query: (id) => `/get-user-by-id/${id}`,
      providesTags: (result, error, id) => [{ type: "Users", id }],
    }),

    // UPDATE user info
    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/update-user/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),

    // DELETE a user
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/delete-user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),

    // CHANGE user status
    changeUserStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/change-user-status/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),
  }),
});

// Export hooks
export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useChangeUserStatusMutation,
} = userManagementApi;
