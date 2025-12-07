// src/components/chat/ChatHeader.jsx
"use client";

import { useChat } from "@/contexts/ChatContext";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

export default function ChatHeader() {
  const { toggleChat, unreadCount } = useChat();

  return (
    <button
      onClick={toggleChat}
      className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
    >
      <ChatBubbleLeftRightIcon className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}