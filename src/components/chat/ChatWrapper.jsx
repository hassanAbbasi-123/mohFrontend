// src/components/chat/ChatWrapper.jsx
"use client";

import { useChat } from "@/context/ChatContext";
import ChatLayout from "@/components/chat/ChatLayout";

export default function ChatWrapper() {
  const { isChatOpen } = useChat();

  if (!isChatOpen) return null;

  return (
    <div className="fixed bottom-0 right-4 w-full max-w-md h-[500px]  z-50 ">
      <ChatLayout />
    </div>
  );
}