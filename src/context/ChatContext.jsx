"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeConversations, setActiveConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('chat-state');
    if (saved) {
      try {
        const { isOpen, conversations, unread } = JSON.parse(saved);
        setIsChatOpen(isOpen || false);
        setActiveConversations(conversations || []);
        setUnreadCount(unread || 0);
      } catch (error) {
        console.error('Error loading chat state:', error);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chat-state', JSON.stringify({
      isOpen: isChatOpen,
      conversations: activeConversations,
      unread: unreadCount
    }));
  }, [isChatOpen, activeConversations, unreadCount]);

  const openChat = (conversationId = null) => {
    setIsChatOpen(true);
    if (conversationId && !activeConversations.includes(conversationId)) {
      setActiveConversations(prev => [...prev, conversationId]);
    }
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
  };

  const openConversation = (conversationId) => {
    if (!activeConversations.includes(conversationId)) {
      setActiveConversations(prev => [...prev, conversationId]);
    }
    setIsChatOpen(true);
  };

  const closeConversation = (conversationId) => {
    setActiveConversations(prev => prev.filter(id => id !== conversationId));
    // If no more active conversations, close chat window
    if (activeConversations.length <= 1) {
      setIsChatOpen(false);
    }
  };

  const updateUnreadCount = (count) => {
    setUnreadCount(count);
  };

  const value = {
    isChatOpen,
    activeConversations,
    unreadCount,
    updateUnreadCount,
    openChat,
    closeChat,
    toggleChat,
    openConversation,
    closeConversation
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};