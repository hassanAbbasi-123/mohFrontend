'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Search, 
  ShoppingCart, 
  Store, 
  Shield, 
  Smartphone, 
  Mail, 
  Phone, 
  UserPlus, 
  CreditCard, 
  Truck, 
  Package, 
  CheckCircle, 
  FileText,
  Users,
  Star,
  Zap,
  Sparkles,
  HelpCircle,
  Globe,
  Lock,
  BadgeCheck
} from 'lucide-react';

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('buyers');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState({});
  const searchInputRef = useRef(null);

  const categories = [
    {
      id: 'buyers',
      name: 'For Buyers',
      icon: ShoppingCart,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'blue'
    },
    {
      id: 'sellers',
      name: 'For Sellers',
      icon: Store,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'green'
    },
    {
      id: 'platform',
      name: 'Platform & Technical',
      icon: Shield,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'purple'
    }
  ];

  const faqs = {
    buyers: [
      {
        id: 1,
        question: "What is MOH Capital?",
        answer: "MOH Capital is a next-generation multi-vendor e-commerce platform that connects buyers and sellers across Pakistan. It offers a wide variety of products from trusted local and international sellers, ensuring quality, convenience, and secure shopping — all in one place.",
        icon: Zap
      },
      {
        id: 2,
        question: "How do I create a customer account?",
        answer: "Click on Sign Up at the top of the homepage, enter your basic details, and verify your email or phone number. Once registered, you can browse products, place orders, and track your purchases easily.",
        icon: UserPlus
      },
      {
        id: 3,
        question: "How can I track my order?",
        answer: "After placing an order, you can go to My Orders in your account dashboard. There, you'll see the current status (Processing, Shipped, or Delivered) and real-time tracking updates.",
        icon: Truck
      },
      {
        id: 4,
        question: "What payment methods does MOH Capital accept?",
        answer: "We accept Cash on Delivery (COD), Debit/Credit Cards, and Digital Wallets (like Easypaisa and JazzCash). Online payments are processed securely through trusted gateways.",
        icon: CreditCard
      },
      {
        id: 5,
        question: "How can I cancel or modify an order?",
        answer: "Orders can be canceled within a limited time after placement, as long as they haven't been shipped. Go to My Orders → Cancel Order. Once dispatched, cancellations may not be possible, but you can initiate a return after delivery.",
        icon: Package
      },
      {
        id: 6,
        question: "What if I receive a damaged or incorrect product?",
        answer: "No worries — MOH Capital offers a simple 7-day return or replacement policy. Go to My Orders → Return/Replace and follow the guided steps. Our team will assist you promptly.",
        icon: CheckCircle
      },
      {
        id: 7,
        question: "Are all products on MOh Capital authentic?",
        answer: "Yes. MOh Capital only allows verified sellers to list products. Our team performs regular checks, and sellers with repeated complaints are removed from the platform.",
        icon: BadgeCheck
      },
      {
        id: 8,
        question: "How do I contact customer support?",
        answer: "You can reach us through the Contact Us page or via email at support@MOHCapital.pk. Our customer support team is available Monday to Saturday, 9 AM – 9 PM.",
        icon: Mail
      }
    ],
    sellers: [
      {
        id: 9,
        question: "How can I become a seller on MOH Capital?",
        answer: "Click Become a Seller on our homepage and fill out the registration form. After verification, you can start listing your products and managing your store from the seller dashboard.",
        icon: Store
      },
      {
        id: 10,
        question: "What documents are required for seller verification?",
        answer: "You'll need: A valid CNIC or business registration document, Bank account details for payments, Basic business information (name, address, contact).",
        icon: FileText
      },
      {
        id: 11,
        question: "How do sellers get paid?",
        answer: "Once your order is successfully delivered and the return period has passed, payments are automatically transferred to your registered bank account. You can view payment history in the Seller Dashboard → Payments section.",
        icon: CreditCard
      },
      {
        id: 12,
        question: "What are MOH Capital's commission rates?",
        answer: "MOH Capital charges a small percentage on each successful sale, depending on the product category. Full details are available in your Seller Agreement during onboarding.",
        icon: Users
      },
      {
        id: 13,
        question: "Can I manage my own shipping?",
        answer: "Yes. You can either use MOH Capital's logistics partners or handle shipping independently. Our logistics integration makes deliveries smoother and reduces disputes.",
        icon: Truck
      },
      {
        id: 14,
        question: "How do I handle returns or disputes?",
        answer: "If a customer initiates a return, you'll be notified immediately through your dashboard. Follow the guided process to approve, reject, or request review from our support team.",
        icon: Shield
      }
    ],
    platform: [
      {
        id: 15,
        question: "Is my personal information safe on MOH Capital?",
        answer: "Absolutely. We use advanced encryption and secure payment gateways to protect your data. MOH Capital is fully compliant with Pakistan's e-commerce data protection standards.",
        icon: Lock
      },
      {
        id: 16,
        question: "Does MOH Capital have a mobile app?",
        answer: "Yes. The MOH Capital mobile app (available soon on Android and iOS) lets you shop, sell, and manage your store on the go.",
        icon: Smartphone
      },
      {
        id: 17,
        question: "How can I advertise or promote my products?",
        answer: "Sellers can choose from various promotion packages inside their dashboard — including featured listings, homepage banners, and sponsored ads.",
        icon: Star
      },
      {
        id: 18,
        question: "Can I operate multiple stores under one account?",
        answer: "Currently, each seller account is linked to a single store. However, you can apply for additional stores after meeting certain performance criteria.",
        icon: Store
      },
      {
        id: 19,
        question: "What should I do if I forget my password?",
        answer: "Click Forgot Password on the login page. Enter your registered email or phone number, and you'll receive a link or OTP to reset your password securely.",
        icon: Shield
      },
      {
        id: 20,
        question: "Who do I contact for business partnerships or collaborations?",
        answer: "For partnerships, collaborations, or media inquiries, please email partnerships@MOHCapital.pk or reach out through our Corporate Contact Form.",
        icon: Users
      }
    ]
  };

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredFaqs = faqs[activeCategory].filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToCategory = (categoryId) => {
    setActiveCategory(categoryId);
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/10 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-r from-blue-200/10 to-purple-200/10 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-r from-emerald-200/10 to-cyan-200/10 rounded-full blur-3xl"
        />
        
        {/* Floating Particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-300/30 rounded-full"
            initial={{
              x: Math.random() * 400 + 100,
              y: Math.random() * 400 + 100,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl mb-6 shadow-lg"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="font-bold">Frequently Asked Questions</span>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl md:text-6xl font-black mb-6 leading-tight"
          >
            How Can We
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Help You?
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            Find answers to common questions about shopping, selling, and using the MOH Capital platform
          </motion.p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative max-w-2xl mx-auto mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-12 py-4 bg-white/90 backdrop-blur-lg border-0 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg placeholder-gray-400 focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-sm">Clear</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.button
                key={category.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToCategory(category.id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${
                  activeCategory === category.id
                    ? `bg-gradient-to-r ${category.color} text-white shadow-2xl`
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 shadow-lg hover:shadow-xl border border-white/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {category.name}
              </motion.button>
            );
          })}
        </motion.div>

        {/* FAQ Content */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, index) => {
                  const Icon = faq.icon;
                  const isOpen = openItems[faq.id];
                  
                  return (
                    <motion.div
                      key={faq.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(faq.id)}
                        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50/50 transition-colors duration-200"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`p-2 rounded-xl bg-gradient-to-r ${categories.find(c => c.id === activeCategory)?.color} text-white shadow-lg mt-1`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg leading-relaxed">
                              {faq.question}
                            </h3>
                            <AnimatePresence>
                              {isOpen && (
                                <motion.p
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="text-gray-600 mt-3 leading-relaxed"
                                >
                                  {faq.answer}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="ml-4 flex-shrink-0"
                        >
                          <ChevronDown className={`w-5 h-5 text-gray-400 transition-colors ${
                            isOpen ? 'text-blue-500' : ''
                          }`} />
                        </motion.div>
                      </button>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg"
                >
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-black text-gray-900 mb-3">No results found</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    We couldn't find any FAQs matching your search. Try different keywords or browse by category.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-lg rounded-3xl p-8 border border-blue-200/30 shadow-2xl max-w-2xl mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">
              Still Have Questions?
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Our support team is always ready to help you with any questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="mailto:support@MOHCapital.pk"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Mail className="w-5 h-5" />
                Email Support
              </motion.a>
              <motion.a
                href="mailto:MOHCapital@gmail.com"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-white/50 text-gray-700 px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Users className="w-5 h-5" />
                Business Inquiries
              </motion.a>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
        >
          {[
            { icon: Users, label: 'Happy Customers', value: '50K+' },
            { icon: Store, label: 'Verified Sellers', value: '2K+' },
            { icon: Package, label: 'Products', value: '100K+' },
            { icon: CheckCircle, label: 'Questions Answered', value: '20+' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.3 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}