"use client";

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function useChatSocket({ userId, conversationId, onMessage, onTyping }) {
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect
    socketRef.current = io(SOCKET_URL, { transports: ["websocket"] });

    socketRef.current.on("connect", () => {
      console.log("✅ Connected to socket:", SOCKET_URL);
      socketRef.current.emit("joinRoom", { conversationId, userId });
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("❌ Socket connect_error:", err.message);
    });

    socketRef.current.on("disconnect", () => {
      console.log("⚠️ Socket disconnected");
    });

    // Receive messages
    socketRef.current.on("receiveMessage", (message) => {
      console.log("📩 Received message:", message);
      if (onMessage) onMessage(message);
    });

    // Typing events
    socketRef.current.on("typing", ({ userId: typingUserId }) => {
      if (onTyping && typingUserId !== userId) {
        onTyping(typingUserId);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [conversationId, userId, onMessage, onTyping]); // Added onMessage and onTyping

  // Send a message
  const sendMessage = (data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("sendMessage", data);
    } else {
      console.warn("⚠️ Tried to send message but socket not connected");
    }
  };

  // Emit typing event
  const sendTyping = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("typing", { conversationId, userId });
    }
  };

  return { sendMessage, sendTyping };
}