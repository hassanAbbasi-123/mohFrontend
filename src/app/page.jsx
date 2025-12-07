'use client'

import React, { useState, useRef, useEffect } from 'react';
import { CartProvider } from '@/context/CartContext';
import Page from '@/app/(electronics)/Page';
import PromoSection from '@/features/promotions/components/promoSection';
import InfoBar from '@/features/promotions/components/InfoBar';
import RecommendedProduct from '@/features/products/components/RecommendedProduct';

import { 
  MessageCircle, 
  X, 
  Minimize2, 
  Maximize2, 
  SendHorizontal, 
  HelpCircle,
  MessageSquare,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ChatBot Component
const ChatBot = ({ isOpen, setIsOpen }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '🌟 Hello! I am Shree, your intelligent AI assistant created by MOH Capital Overseas. I\'m here to help you with any questions about our platform.',
      sender: 'ai',
      timestamp: new Date(),
      type: 'greeting'
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showFAQs, setShowFAQs] = useState(false);
  const [showAskButton, setShowAskButton] = useState(true);
  const [availableFAQs, setAvailableFAQs] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // All Existing FAQs
  const initialFAQs = [
    {
      id: 1,
      question: "What is a Lead?",
      answer: "A Lead refers to our bulk purchasing system where buyers can purchase stock in large quantities directly from sellers."
    },
    {
      id: 2,
      question: "How can I purchase a single product?",
      answer: "To purchase individual products: 1) Login as a buyer, 2) Browse products from the homepage, 3) Add desired items to cart, 4) Proceed to checkout, 5) Complete payment via RazorPay or PayPal. Buyer login is mandatory for all transactions."
    },
    {
      id: 3,
      question: "How do I purchase Leads?",
      answer: "To purchase Leads: 1) Login as a buyer, 2) Navigate to Lead Management, 3) Add Lead details (product name, price range $500-$600, contact information), 4) Submit for admin approval, 5) Once approved, sellers will contact you directly."
    },
    {
      id: 4,
      question: "What payment methods do you accept?",
      answer: "We accept multiple payment methods including RazorPay, PayPal, credit cards, debit cards, and bank transfers for your convenience."
    },
    {
      id: 5,
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for all items in original condition. Electronics have a 15-day return window from the date of delivery."
    },
    {
      id: 6,
      question: "How long does shipping take?",
      answer: "Standard shipping takes 5-7 business days. Express shipping is available within 2-3 business days. Same-day delivery is offered in select metropolitan areas."
    },
    {
      id: 7,
      question: "Do you offer international shipping?",
      answer: "Yes, we ship to over 50 countries worldwide. Shipping costs and delivery times vary depending on the destination location and selected shipping method."
    },
    {
      id: 8,
      question: "How can I track my order?",
      answer: "You can track your order using the tracking link sent to your registered email address, or through your account dashboard under 'My Orders' section."
    },
    {
      id: 9,
      question: "How do I create a seller account?",
      answer: "To create a seller account, click on 'Become a Seller' in the navigation menu, fill out the registration form, submit required documents, and wait for admin approval."
    },
    {
      id: 10,
      question: "What are the seller commission rates?",
      answer: "Our commission rates vary by product category, ranging from 8% to 15%. Detailed commission structure is available in the seller dashboard after registration."
    },
    {
      id: 11,
      question: "How do I contact customer support?",
      answer: "You can contact our customer support team via email at support@mohcapital.com, through the contact form on our website, or by calling our helpline at +1-800-XXX-XXXX during business hours."
    },
    {
      id: 12,
      question: "Is my personal information secure?",
      answer: "Yes, we use industry-standard encryption and security protocols to protect your personal information. We comply with all data protection regulations and never share your information with third parties without consent."
    }
  ];

  // Initialize available FAQs
  useEffect(() => {
    setAvailableFAQs(initialFAQs);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current && !showFAQs) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen, isMinimized, showFAQs]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAIResponse = (userMessage) => {
    const authHeader =
      'Basic ' +
      Buffer.from(
        `${process.env.NEXT_PUBLIC_WEBHOOK_USER || ''}:${process.env.NEXT_PUBLIC_WEBHOOK_PASS || ''}`
      ).toString('base64');

    return fetch(
      'https://n8n-j0ri.onrender.com/webhook/bf026618-cf64-4c6e-89c6-4d6b1f7d01e1',
      {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      }
    )
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        return response.json();
      })
      .then(response => {
        console.log('AI Response:', response);
        return response[0]?.output || "Thank you for your question! I've processed your query.";
      })
      .catch(error => {
        console.error('AI Fetch Error:', error);
        return "I apologize, but I'm currently unable to access my knowledge base. Please try again in a moment or contact our support team directly.";
      });
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const newUserMessage = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setShowFAQs(false);
    setShowAskButton(false);
    setIsTyping(true);

    getAIResponse(newUserMessage.text)
      .then(aiText => {
        const aiResponse = {
          id: Date.now() + 1,
          text: aiText,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
      })
      .finally(() => {
        setIsTyping(false);
        // Show Ask Any Question button after AI response
        if (availableFAQs.length > 0) {
          setShowAskButton(true);
        }
      });
  };

  const handleAskQuestionClick = () => {
    setShowAskButton(false);
    setShowFAQs(true);
    
    // Add a system message
    const systemMessage = {
      id: Date.now(),
      text: "Here are some frequently asked questions that might help you:",
      sender: 'ai',
      timestamp: new Date(),
      type: 'system'
    };
    
    setMessages(prev => [...prev, systemMessage]);
  };

  const handleFAQClick = (faq) => {
    // Remove the clicked FAQ from available FAQs
    const updatedFAQs = availableFAQs.filter(f => f.id !== faq.id);
    setAvailableFAQs(updatedFAQs);
    
    // First, add the user message with the question
    const userMessage = {
      id: Date.now(),
      text: faq.question,
      sender: 'user',
      timestamp: new Date(),
      type: 'faq_question'
    };

    // Then, add the AI response with the answer
    const aiResponse = {
      id: Date.now() + 1,
      text: `<div class="space-y-2">
        <p class="text-gray-700 leading-relaxed">${faq.answer}</p>
      </div>`,
      sender: 'ai',
      timestamp: new Date(),
      type: 'faq_answer'
    };

    // Add both messages to the chat
    setMessages(prev => [...prev, userMessage, aiResponse]);
    
    // Hide FAQs section and show Ask Any Question button again
    setShowFAQs(false);
    
    // If there are more FAQs left, show Ask Any Question button again
    if (updatedFAQs.length > 0) {
      setShowAskButton(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className={`fixed bottom-20 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] transition-all duration-300 transform ${
        isOpen
          ? 'scale-100 opacity-100 pointer-events-auto'
          : 'scale-95 opacity-0 pointer-events-none'
      }`}
      role="dialog"
      aria-labelledby="chatbot-title"
    >
      <motion.div
        className="border border-gray-300/20 shadow-xl rounded-2xl overflow-hidden bg-white"
        animate={{
          height: isMinimized ? 70 : 550
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut"
        }}
      >
        {/* Header - Clean Modern Design */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-[70px] flex items-center px-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h3 id="chatbot-title" className="text-white font-semibold text-sm">
                  Shree AI Assistant
                </h3>
                <p className="text-white/90 text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                  Available
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-150"
                aria-label={isMinimized ? 'Maximize chat' : 'Minimize chat'}
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-150"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <motion.div
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 p-4 space-y-3 h-[400px] bg-white"
          animate={{
            opacity: isMinimized ? 0 : 1,
            height: isMinimized ? 0 : 400
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut"
          }}
          style={{
            overflow: isMinimized ? 'hidden' : 'auto'
          }}
        >
          {!isMinimized && (
            <>
              {/* Messages */}
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 relative rounded-lg shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-emerald-500 text-white rounded-tr-none rounded-tl-xl rounded-bl-xl rounded-br-xl'
                        : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-tr-xl rounded-tl-none rounded-br-xl rounded-bl-md'
                    }`}
                  >
                    {message.type === 'system' ? (
                      <div className="text-sm font-medium text-gray-600 text-center">
                        {message.text}
                      </div>
                    ) : (
                      <>
                        <div
                          className="text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: message.text }}
                        />
                        <p
                          className={`text-xs mt-2 ${message.sender === 'user'
                            ? 'text-emerald-100'
                            : 'text-gray-500'
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {/* Ask Any Question Button - Shows after greeting OR after FAQ answer */}
              {showAskButton && availableFAQs.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center mt-4"
                >
                  <button
                    onClick={handleAskQuestionClick}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-full font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Ask Any Question
                  </button>
                </motion.div>
              )}

              {/* No Questions Remaining Message */}
              {availableFAQs.length === 0 && !showFAQs && (
                <div className="text-center text-gray-500 text-sm mt-4 p-3 bg-gray-50 rounded-lg">
                  <p>You've viewed all available questions.</p>
                  <p className="text-xs mt-1">Feel free to type your own question above!</p>
                </div>
              )}

              {/* FAQs Section - Only shows when Ask Any Question button is clicked */}
              {showFAQs && availableFAQs.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 space-y-2"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <HelpCircle className="w-5 h-5 text-emerald-500" />
                    <h4 className="text-gray-700 font-semibold">Available Questions ({availableFAQs.length})</h4>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {availableFAQs.map((faq) => (
                      <motion.button
                        key={faq.id}
                        onClick={() => handleFAQClick(faq)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full text-left p-3 bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 rounded-lg transition-all duration-200 group flex items-center justify-between"
                      >
                        <span className="text-gray-700 text-sm font-medium group-hover:text-emerald-700 line-clamp-2">
                          {faq.question}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start mb-3">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl rounded-tl-sm px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </motion.div>

        {/* Input Area */}
        <motion.div
          className="border-t border-gray-200 h-[80px] flex items-center px-4 bg-white"
          animate={{
            opacity: isMinimized ? 0 : 1,
            height: isMinimized ? 0 : 80
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut"
          }}
          style={{
            overflow: isMinimized ? 'hidden' : 'visible'
          }}
        >
          {!isMinimized && (
            <div className="flex items-center space-x-3 w-full">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all duration-150 placeholder-gray-500 text-gray-800"
                  aria-label="Chat input"
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={inputValue.trim() === ''}
                className="w-11 h-11 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white hover:from-emerald-600 hover:to-emerald-700 hover:scale-105 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md"
                aria-label="Send message"
              >
                <SendHorizontal className="w-5 h-5" />
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

// Floating Chat Button Component
const FloatingChatButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* Floating AI Logo Button - Minimal Design */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full shadow-lg flex items-center justify-center cursor-pointer border-2 border-white hover:border-emerald-400/50 transition-all duration-200 group"
        onClick={() => setIsChatOpen(true)}
        aria-label="Open AI Chat Assistant"
      >
        {/* AI Logo/Badge */}
        <div className="relative">
          <MessageCircle className="w-6 h-6 text-white" />
          <motion.span 
            animate={{ scale: isHovered ? 1.2 : 1 }}
            className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse"
          ></motion.span>
        </div>
        
        {/* Hover Tooltip */}
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 5
          }}
          className="absolute -top-12 right-0 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            <span>Ask Shree AI</span>
          </div>
          {/* Tooltip arrow */}
          <div className="absolute -bottom-1 right-5 w-2 h-2 bg-gray-800 rotate-45"></div>
        </motion.div>
      </motion.button>

      {/* Chat Bot Component */}
      <AnimatePresence>
        {isChatOpen && (
          <ChatBot 
            isOpen={isChatOpen}
            setIsOpen={setIsChatOpen}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// Main Home Component
export default function Home() {
  return (
    <CartProvider>
      <main className="bg-gray-50 min-h-screen flex flex-col">
        {/* Promotional Section - Full-width, reduced height on mobile */}
        <PromoSection className="w-full h-[50vh] sm:h-[70vh] md:h-[80vh]" />

        {/* Main Homepage Layout - Stacked, compact */}
        <Page className="flex-grow px-2 sm:px-4 md:px-6" />

        {/* Info Bar - Horizontal scroll on mobile if needed */}
        <InfoBar className="py-4 sm:py-6 overflow-x-auto" />

        {/* Recommended Products - Grid 1-2 cols mobile */}
        <RecommendedProduct className="py-4 sm:py-8" />

        {/* Floating AI Chat Button - Always visible in bottom-right */}
        <FloatingChatButton />
      </main>
    </CartProvider>
  );
}