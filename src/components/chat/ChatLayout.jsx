"use client";
import React from "react";
import { useSelector } from "react-redux";
import {
  useGetUserConversationsQuery,
  useGetSellerConversationsQuery,
} from "@/store/features/chatApi";
import ConversationList from "@/components/chat/ConversationList";
import MessageWindow from "@/components/chat/MessageWindow";
import { useChat } from "@/context/ChatContext";
import { XMarkIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

export default function ChatLayout() {
  const { user } = useSelector((state) => state.auth);
  const { isChatOpen, openChat, closeChat, unreadCount } = useChat();
  const [activeConversationId, setActiveConversationId] = React.useState(null);

  const role = user?.role;
  const userId = user?._id;

  const { data: sellerConversations, isLoading: sellerLoading } =
    useGetSellerConversationsQuery(undefined, {
      skip: !user || role !== "seller",
      pollingInterval: 30000,
    });

  const { data: userConversations, isLoading: userLoading } =
    useGetUserConversationsQuery(undefined, {
      skip: !user || role !== "user",
      pollingInterval: 30000,
    });

  const conversations =
    role === "seller"
      ? sellerConversations
      : role === "user"
      ? userConversations
      : [];

  if (!user) return null;

  return (
    <>
      {/* Chat Widget Container */}
      <div
        className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
          isChatOpen ? "w-96 h-[32rem]" : "w-10 h-5"
        }`}
      >
        {isChatOpen && (
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-full h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-4 py-3 text-white rounded-t-lg flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                <span className="font-semibold">
                  {activeConversationId ? "Conversation" : "Messages"}
                </span>
                {unreadCount > 0 && !activeConversationId && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setActiveConversationId(null);
                  closeChat();
                }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {!activeConversationId ? (
                // ✅ Conversation list takes full space in widget mode
                <div className="h-full w-full">
                  <ConversationList
                    conversations={conversations}
                    currentUserId={userId}
                    activeId={activeConversationId}
                    onSelectConversation={(id) => setActiveConversationId(id)}
                  />
                </div>
              ) : (
                // ✅ Message window also takes full space in widget mode
                <div className="h-full w-full">
                  <MessageWindow
                    conversationId={activeConversationId}
                    userId={userId}
                    widgetMode={true}
                    onClose={() => setActiveConversationId(null)}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => (isChatOpen ? closeChat() : openChat())}
          className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <div className="relative">
            <ChatBubbleLeftRightIcon className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
        </button>
      </div>
    </>
  );
}