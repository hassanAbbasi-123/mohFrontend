// src/components/chat/ConversationList.jsx
"use client";

import Link from "next/link";
import { 
  ChatBubbleLeftRightIcon, 
  UserCircleIcon, 
  CheckBadgeIcon,
  ClockIcon,
  ShoppingBagIcon
} from "@heroicons/react/24/outline";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";

export default function ConversationList({ conversations, activeId, currentUserId, onSelectConversation }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredConversations, setFilteredConversations] = useState(conversations || []);

  // Calculate total unread count for footer
  const totalUnreadCount = conversations?.reduce((total, conversation) => {
    return total + (conversation.unreadCount || 0);
  }, 0) || 0;

  // Filter conversations based on search term
  useEffect(() => {
    if (!conversations) return;
    
    if (!searchTerm.trim()) {
      setFilteredConversations(conversations);
      return;
    }

    const filtered = conversations.filter(conversation => {
      const displayName = getDisplayName(conversation).toLowerCase();
      const lastMessage = (conversation.lastMessage || "").toLowerCase();
      const searchLower = searchTerm.toLowerCase();

      return displayName.includes(searchLower) || lastMessage.includes(searchLower);
    });

    setFilteredConversations(filtered);
  }, [searchTerm, conversations]);

  const getDisplayName = (conversation) => {
    // Debug: Log conversation structure to help with troubleshooting
    if (process.env.NODE_ENV === 'development') {
      console.log('Conversation data:', {
        id: conversation._id,
        sellerProfile: conversation.sellerProfile,
        seller: conversation.seller,
        buyer: conversation.buyer,
        participants: conversation.participants
      });
    }

    // Try seller profile first (for store names)
    if (conversation.sellerProfile?.storeName) {
      return conversation.sellerProfile.storeName;
    }

    // Try seller displayName (set by your controller)
    if (conversation.seller?.displayName) {
      return conversation.seller.displayName;
    }

    // Try seller name
    if (conversation.seller?.name) {
      return conversation.seller.name;
    }

    // Try buyer displayName (set by your controller)
    if (conversation.buyer?.displayName) {
      return conversation.buyer.displayName;
    }

    // Try buyer name
    if (conversation.buyer?.name) {
      return conversation.buyer.name;
    }

    // Check participants array (common fallback)
    if (conversation.participants && Array.isArray(conversation.participants)) {
      // Find the other participant (not current user)
      const otherParticipant = conversation.participants.find(participant => {
        const participantId = participant._id || participant;
        return participantId !== currentUserId;
      });

      if (otherParticipant) {
        if (typeof otherParticipant === 'object') {
          return otherParticipant.displayName || otherParticipant.name || "Other User";
        }
      }

      // If no other participant found, use first participant
      const firstParticipant = conversation.participants[0];
      if (firstParticipant && typeof firstParticipant === 'object') {
        return firstParticipant.displayName || firstParticipant.name || "User";
      }
    }

    // Final fallbacks
    if (conversation.displayName) {
      return conversation.displayName;
    }

    if (conversation.name) {
      return conversation.name;
    }

    return "Unknown User";
  };

  const getInitials = (name) => {
    if (!name || name === "Unknown User") return "UU";
    
    // Handle cases where name might be an object
    if (typeof name === 'object') {
      const displayName = name.displayName || name.name;
      if (!displayName) return "UU";
      name = displayName;
    }

    // Clean the name and get initials
    const cleanName = name.trim();
    if (cleanName.length <= 2) return cleanName.toUpperCase();
    
    return cleanName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (conversation) => {
    if (conversation.unreadCount > 0) return "bg-green-500";
    if (conversation.lastMessage) return "bg-blue-500";
    return "bg-gray-400";
  };

  const getStatusTooltip = (conversation) => {
    if (conversation.unreadCount > 0) return `${conversation.unreadCount} unread messages`;
    if (conversation.lastMessage) return "Has messages";
    return "No messages yet";
  };

  const formatLastMessage = (message) => {
    if (!message) return "No messages yet";
    
    // Handle cases where message might be an object
    if (typeof message === 'object') {
      message = message.text || message.content || "Media message";
    }
    
    return message.length > 35 ? message.substring(0, 35) + "..." : message;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      // Handle both string and Date objects
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      if (isNaN(date.getTime())) return "";
      
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "";
    }
  };

  const isSeller = (conversation) => {
    // Check if current user is the seller in this conversation
    if (!currentUserId) return false;
    
    const sellerId = conversation.seller?._id || conversation.seller;
    return sellerId === currentUserId;
  };

  const getConversationType = (conversation) => {
    if (isSeller(conversation)) {
      return { type: "buyer", label: "Buyer", color: "blue" };
    }
    return { type: "seller", label: "Seller", color: "green" };
  };

  return (
    <div className="w-full flex flex-col h-full bg-white border-r border-gray-200 shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-6 py-5 text-white">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-xl">
            <ChatBubbleLeftRightIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Conversations</h2>
            <p className="text-blue-100 text-sm">
              {filteredConversations.length} active chats
              {searchTerm && filteredConversations.length !== conversations?.length && (
                <span className="ml-2">({conversations?.length || 0} total)</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border-0 rounded-xl py-3 px-4 pl-10 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {!conversations || conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-600">No conversations</p>
            <p className="text-sm text-gray-500 text-center">Start a new conversation to see it here</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-600">No matches found</p>
            <p className="text-sm text-gray-500 text-center">Try adjusting your search terms</p>
            <button
              onClick={() => setSearchTerm("")}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Clear search
            </button>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const displayName = getDisplayName(conversation);
            const isActive = activeId === conversation._id;
            const convoType = getConversationType(conversation);
            const hasUnread = conversation.unreadCount > 0;

            // Wrapper element: if onSelectConversation is provided, use div + onClick
            const Wrapper = ({ children }) =>
              onSelectConversation ? (
                <div
                  onClick={() => onSelectConversation(conversation._id)}
                  className="cursor-pointer"
                >
                  {children}
                </div>
              ) : (
                <Link key={conversation._id} href={`/chat/${conversation._id}`}>
                  {children}
                </Link>
              );

            return (
              <Wrapper key={conversation._id}>
                <div
                  className={`border-b border-gray-100 transition-all duration-200 ${
                    isActive 
                      ? "bg-gradient-to-r from-blue-50 to-blue-25 border-l-4 border-l-blue-500" 
                      : "hover:bg-gray-50 hover:border-l-4 hover:border-l-gray-200"
                  } ${hasUnread ? 'bg-amber-50' : ''}`}
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div 
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-semibold text-sm shadow-md ${
                            isActive 
                              ? "from-blue-500 to-blue-600" 
                              : hasUnread
                                ? "from-amber-500 to-amber-600"
                                : "from-gray-400 to-gray-600"
                          }`}
                          title={displayName}
                        >
                          {getInitials(displayName)}
                        </div>
                        {/* Status indicator with tooltip */}
                        <div 
                          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            getStatusColor(conversation)
                          }`}
                          title={getStatusTooltip(conversation)}
                        ></div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-semibold truncate ${
                            isActive ? "text-blue-900" : "text-gray-900"
                          } ${hasUnread ? 'font-bold' : ''}`}>
                            {displayName}
                            {conversation.sellerProfile?.isVerified && (
                              <CheckBadgeIcon className="w-4 h-4 text-blue-500 inline-block ml-1" />
                            )}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {hasUnread && (
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium min-w-[20px] text-center">
                                {conversation.unreadCount}
                              </span>
                            )}
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatTime(conversation.updatedAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 mb-1">
                          {/* Conversation type badge */}
                          <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs ${
                            convoType.type === 'seller' 
                              ? 'bg-green-50 text-green-700' 
                              : 'bg-blue-50 text-blue-700'
                          }`}>
                            <ShoppingBagIcon className="w-3 h-3" />
                            <span>{convoType.label}</span>
                          </span>
                          
                          {/* Product context if available */}
                          {conversation.product && (
                            <span className="inline-flex items-center space-x-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-xs">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              <span>Product</span>
                            </span>
                          )}
                        </div>

                        <p className={`text-sm truncate ${
                          isActive ? "text-blue-700" : hasUnread ? "text-gray-900 font-medium" : "text-gray-600"
                        }`}>
                          {formatLastMessage(conversation.lastMessage)}
                        </p>

                        {/* Metadata */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <ClockIcon className="w-3 h-3" />
                            <span>Active {formatTime(conversation.lastMessageAt)}</span>
                          </div>
                          
                          {/* Additional status indicators */}
                          {conversation.status === 'blocked' && (
                            <span className="text-xs text-red-500 font-medium">Blocked</span>
                          )}
                          {conversation.status === 'archived' && (
                            <span className="text-xs text-gray-500 font-medium">Archived</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Wrapper>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>
            Showing {filteredConversations.length} of {conversations?.length || 0} conversations
            {totalUnreadCount > 0 && (
              <span className="ml-2 text-red-500">
                • {totalUnreadCount} unread
              </span>
            )}
          </span>
          <span>Updated just now</span>
        </div>
      </div>
    </div>
  );
}
