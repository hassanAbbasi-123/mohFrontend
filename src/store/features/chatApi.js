// src/store/features/chatApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE}/chat`,
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Conversation", "Message"],
  endpoints: (builder) => ({
    startConversation: builder.mutation({
      query: (data) => ({
        url: "/user/start-conversation",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Conversation"],
    }),
    getUserConversations: builder.query({
      query: () => "/user/get-conversations",
      providesTags: ["Conversation"],
    }),
    getSellerConversations: builder.query({
      query: () => "/conversations/seller",
      providesTags: ["Conversation"],
    }),
    getConversation: builder.query({
      query: (id) => `/conversation/${id}`,
      providesTags: ["Conversation"],
    }),
    getMessages: builder.query({
      query: (conversationId) => `/messages/${conversationId}`,
      providesTags: ["Message"],
    }),
  }),
});

export const {
  useStartConversationMutation,
  useGetUserConversationsQuery,
  useGetSellerConversationsQuery,
  useGetConversationQuery,
  useGetMessagesQuery,
} = chatApi;
