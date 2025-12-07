"use client";

import { useEffect, useState, useRef } from "react";
import { useGetMessagesQuery } from "@/store/features/chatApi";
import useChatSocket from "@/hooks/useChatSocket";
import {
  PaperAirplaneIcon,
  UserCircleIcon,
  XMarkIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

export default function MessageWindow({
  conversationId,
  userId,
  widgetMode = false,
  onClose,
}) {
  const { data: initialMessages } = useGetMessagesQuery(conversationId);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const { sendMessage } = useChatSocket({
    userId,
    conversationId,
    onMessage: (msg) => setMessages((prev) => [...prev, msg]),
  });

  useEffect(() => {
    if (initialMessages) setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage({ conversationId, senderId: userId, text });
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e) => {
    setText(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  const formatMessageTime = (timestamp) => {
    try {
      return format(new Date(timestamp), "HH:mm");
    } catch {
      return "";
    }
  };

  const getSenderName = (sender) => {
    if (!sender) return "Unknown User";
    return sender.displayName || sender.name || sender.email || "Unknown User";
  };

  const getSenderInitials = (sender) => {
    const name = getSenderName(sender);
    if (!name || name === "Unknown User") return "UU";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const closeConversation = () => {
    if (onClose) {
      onClose(conversationId);
    }
  };

  return (
    <div
      className={`${
        widgetMode
          ? "h-full flex flex-col"
          : "w-full lg:w-2/3 flex flex-col h-full"
      } bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl overflow-hidden`}
    >
      {/* Header — only show if NOT in widget mode */}
      {!widgetMode && (
        <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {/* Back Arrow */}
            <button
              onClick={closeConversation}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <h2 className="text-lg font-semibold text-gray-800">
                Chat Conversation
              </h2>
            </div>
          </div>
          {/* Close Button */}
          <button
            onClick={closeConversation}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white/50 to-transparent">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <UserCircleIcon className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm">Start a conversation by sending a message!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage =
              msg.sender?._id === userId || msg.senderId === userId;

            return (
              <div
                key={msg._id || msg.id || `msg-${Date.now()}-${Math.random()}`}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex max-w-[70%] items-end ${
                    isOwnMessage
                      ? "flex-row-reverse space-x-reverse space-x-2"
                      : "flex-row space-x-2"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${
                      isOwnMessage
                        ? "from-blue-500 to-blue-600"
                        : "from-gray-400 to-gray-500"
                    } flex items-center justify-center text-white text-sm font-medium shadow-md`}
                  >
                    {getSenderInitials(msg.sender)}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`relative rounded-2xl px-4 py-3 shadow-sm ${
                      isOwnMessage
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md"
                        : "bg-white text-gray-800 rounded-bl-md border border-gray-200"
                    }`}
                  >
                    {!isOwnMessage && (
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        {getSenderName(msg.sender)}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                      {msg.text}
                    </p>
                    <div
                      className={`text-xs mt-2 ${
                        isOwnMessage ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {formatMessageTime(
                        msg.createdAt || msg.timestamp || Date.now()
                      )}
                    </div>
                    <div
                      className={`absolute bottom-0 w-3 h-3 ${
                        isOwnMessage ? "-right-1" : "-left-1"
                      }`}
                    >
                      <div
                        className={`w-full h-full ${
                          isOwnMessage
                            ? "bg-blue-500 rounded-br-full"
                            : "bg-white border-l border-b border-gray-200 rounded-bl-full"
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-6 shadow-lg">
        <div className="flex items-end space-x-4">
          <div className="flex-1 bg-gray-100 rounded-2xl border border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all duration-200">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              className="w-full bg-transparent border-0 resize-none focus:ring-0 focus:outline-none py-3 px-4 text-gray-800 placeholder-gray-500 max-h-32"
              placeholder="Type your message..."
              rows="1"
            />
          </div>
          <button
            onClick={handleSend}
            className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-3 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-transform"
          >
            <PaperAirplaneIcon className="w-5 h-5 rotate-45" />
          </button>
        </div>
      </div>
    </div>
  );
}
