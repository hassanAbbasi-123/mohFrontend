'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useChat } from '@/context/ChatContext';
import { 
  MessageCircle, 
  Home, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Megaphone, 
  Settings, 
  LogOut, 
  X,
  ChevronRight,
  Sparkles,
  Crown,
  Zap,
  Shield,
  BadgeCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ currentPage, setCurrentPage, isOpen, setIsOpen }) {
  const { toggleChat, unreadCount } = useChat();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  const navigation = [
    { 
      name: 'Dashboard', 
      id: 'dashboard', 
      icon: Home, 
      link: '/seller-dashboard',
      description: 'Overview of your store',
      premium: false
    },
    { 
      name: 'Products', 
      id: 'products', 
      icon: Package, 
      link: '/productmanagement',
      description: 'Manage your products',
      premium: false
    },
    { 
      name: 'Orders', 
      id: 'orders', 
      icon: ShoppingCart, 
      link: '/orders',
      description: 'View and manage orders',
      premium: false
    },
    {
      name: 'Leads',
      id: 'leads',
      icon: Sparkles,
      link: '/leadsmanagement',
      description: 'Explore new opportunities',
      premium: false
    },
    { 
      name: 'Analytics', 
      id: 'analytics', 
      icon: BarChart3, 
      link: '/analytics',
      description: 'Sales and performance',
      premium: true
    },
    { 
      name: 'Marketing', 
      id: 'marketing', 
      icon: Megaphone, 
      link: '/marketing',
      description: 'Promotions and campaigns',
      premium: true
    },
    { 
      name: 'Inventory', 
      id: 'inventory', 
      icon: Package, 
      link: '/inventory',
      description: 'Stock management',
      premium: false
    },
  ];

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    // Clear any authentication tokens or user data here
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to login page
    router.push('/login');
  };

  const handleNavigation = (itemId, itemLink) => {
    setCurrentPage(itemId);
    if (isMobile) {
      setIsOpen(false);
    }
    if (itemLink) {
      router.push(itemLink);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ 
          x: isMobile ? (isOpen ? 0 : -320) : 0,
          transition: { type: 'spring', damping: 30, stiffness: 300 }
        }}
        className="fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-b from-white to-gray-50/80 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 lg:translate-x-0"
      >
        <div className="flex h-full flex-col">
          {/* Brand Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex h-20 items-center justify-between px-6 border-b border-gray-200/50 bg-white/50"
          >
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="relative"
              >
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                  <Image
                    src="/bustardlogo.jpeg"
                    alt="Bustard Logo"
                    width={48}
                    height={48}
                    className="object-cover rounded-2xl"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden text-white font-black text-lg items-center justify-center w-full h-full">
                    B
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </motion.div>
              <div>
                <h1 className="text-xl font-black bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
                  MOH Capital
                </h1>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3 text-green-500" />
                  Seller Portal
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Chat Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleChat()}
                className="relative p-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <MessageCircle className="h-5 w-5" />
                {unreadCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg border border-white"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Close Button - Mobile Only */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(false)}
                className="lg:hidden p-2.5 text-gray-500 hover:text-gray-700 bg-white/80 rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>
          </motion.div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavigation(item.id, item.link)}
                    className={`w-full flex items-center justify-between p-4 text-left rounded-2xl transition-all duration-300 group relative overflow-hidden
                      ${isActive
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50/50 text-blue-700 shadow-lg border border-blue-200/50'
                        : 'text-gray-600 hover:bg-white/80 hover:text-gray-900 hover:shadow-md border border-transparent hover:border-gray-200/50'
                      }`}
                  >
                    {/* Background Glow Effect */}
                    <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300
                      ${isActive 
                        ? 'opacity-100 bg-gradient-to-r from-blue-500/5 to-purple-500/5' 
                        : 'opacity-0 group-hover:opacity-100 bg-gradient-to-r from-gray-500/5 to-gray-400/5'
                      }`}></div>

                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`p-2.5 rounded-xl transition-all duration-300 shadow-sm
                        ${isActive
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                          : 'bg-white text-gray-600 group-hover:bg-gradient-to-r group-hover:from-blue-100 group-hover:to-purple-100 group-hover:text-blue-600 border border-gray-200/50'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold text-sm transition-colors duration-300
                            ${isActive ? 'text-blue-700' : 'text-gray-800 group-hover:text-gray-900'}
                          `}>
                            {item.name}
                          </span>
                          {item.premium && (
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold"
                            >
                              <Crown className="h-3 w-3" />
                              <span>PRO</span>
                            </motion.div>
                          )}
                        </div>
                        <p className={`text-xs transition-colors duration-300 mt-1
                          ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-600'}
                        `}>
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 relative z-10">
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        />
                      )}
                      <ChevronRight className={`h-4 w-4 transition-all duration-300
                        ${isActive 
                          ? 'text-blue-500 translate-x-1' 
                          : 'text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1'
                        }`}
                      />
                    </div>

                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full shadow-lg"
                      />
                    )}
                  </motion.button>
                </motion.div>
              );
            })}
          </nav>

          {/* Bottom Section - Settings & Logout */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="border-t border-gray-200/50 p-4 bg-white/50 backdrop-blur-sm"
          >
            {/* Settings */}
            <motion.button
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavigation('settings', '/profile')}
              className="w-full flex items-center justify-between p-4 text-gray-600 hover:text-gray-900 rounded-2xl transition-all duration-300 group hover:bg-white/80 hover:shadow-md border border-transparent hover:border-gray-200/50 mb-2"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white text-gray-600 rounded-xl shadow-sm border border-gray-200/50 group-hover:bg-gradient-to-r group-hover:from-gray-100 group-hover:to-gray-200 group-hover:text-gray-700 transition-all duration-300">
                  <Settings className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <span className="font-semibold text-sm">Settings</span>
                  <p className="text-xs text-gray-500 group-hover:text-gray-600">Account preferences</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
            </motion.button>

            {/* Logout */}
            {/* <motion.button
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 text-gray-600 hover:text-red-600 rounded-2xl transition-all duration-300 group hover:bg-red-50/80 hover:shadow-md border border-transparent hover:border-red-200/50"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white text-gray-600 rounded-xl shadow-sm border border-gray-200/50 group-hover:bg-gradient-to-r group-hover:from-red-100 group-hover:to-red-200 group-hover:text-red-600 transition-all duration-300">
                  <LogOut className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <span className="font-semibold text-sm">Sign out</span>
                  <p className="text-xs text-gray-500 group-hover:text-red-500">Logout from your account</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all duration-300" />
            </motion.button> */}

            {/* Security Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50/50 rounded-2xl border border-green-200/50 text-center"
            >
              <div className="flex items-center justify-center gap-2 text-green-700 text-xs font-medium">
                <Shield className="h-3 w-3" />
                <span>Secure Seller Portal</span>
                <Zap className="h-3 w-3 text-amber-500" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
