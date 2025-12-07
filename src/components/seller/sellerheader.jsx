'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useGetProfileQuery } from '@/store/features/profileApi';
import { 
  Settings, 
  LogOut, 
  User, 
  ChevronDown, 
  Menu,
  Shield,
  BadgeCheck,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header({ setSidebarOpen }) {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Fetch profile data using RTK Query
  const { data: profileData, isLoading, error } = useGetProfileQuery();

  useEffect(() => {
    if (profileData) {
      setUser({
        name: profileData.user?.name || 'Unknown User',
        email: profileData.user?.email || 'seller@gmail.com',
        role: profileData.user?.role || 'User',
        avatar: profileData.sellerProfile?.logo || profileData.user?.avatar || null,
      });
    }
  }, [profileData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem('token');
    // Clear any other user data
    localStorage.removeItem('user');
    // Navigate to login page
    router.push('/login');
    // Close dropdown
    setIsDropdownOpen(false);
  };

  const handleProfileClick = () => {
    router.push('/profile');
    setIsDropdownOpen(false);
  };
  // Handle loading state
  if (isLoading) {
    return (
      <header className="bg-white/90 backdrop-blur-2xl shadow-2xl border-b border-gray-200/30 w-90vw sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Left: Sidebar Button and Brand */}
            <div className="flex items-center space-x-4">
              {typeof setSidebarOpen === 'function' && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-3 text-gray-500 hover:text-gray-700 rounded-2xl hover:bg-gray-100/80 transition-all duration-300 ease-in-out shadow-sm hover:shadow-md"
                >
                  <Menu className="h-5 w-5" />
                </button>
              )}
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl animate-pulse"></div>
                <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>

            {/* Right: User Info Skeleton */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="space-y-1">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Handle error state
  if (error) {
    console.error('Profile fetch error:', error);
    return (
      <header className="bg-white/90 backdrop-blur-2xl shadow-2xl border-b border-gray-200/30 w-full sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Left: Sidebar Button and Brand */}
            <div className="flex items-center space-x-4">
              {typeof setSidebarOpen === 'function' && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-3 text-gray-500 hover:text-gray-700 rounded-2xl hover:bg-gray-100/80 transition-all duration-300 ease-in-out shadow-sm hover:shadow-md"
                >
                  <Menu className="h-5 w-5" />
                </button>
              )}
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Guest
                </h1>
              </div>
            </div>

            {/* Right: User Info */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center overflow-hidden shadow-lg border border-gray-200/50">
                  <div className="text-lg font-bold text-gray-600">G</div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Guest User</p>
                  <p className="text-xs text-gray-500 capitalize">Visitor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get role badge color
  const getRoleBadgeColor = () => {
    switch (user?.role?.toLowerCase()) {
      case 'admin':
        return 'from-red-500 to-pink-600';
      case 'seller':
        return 'from-green-500 to-emerald-600';
      case 'moderator':
        return 'from-purple-500 to-indigo-600';
      default:
        return 'from-blue-500 to-cyan-600';
    }
  };

  return (
    <header className="bg-white/90 backdrop-blur-2xl shadow-2xl border-b border-gray-200/30 w-full sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Left: Sidebar Button and Brand */}
          <div className="flex items-center space-x-4">
            {typeof setSidebarOpen === 'function' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-3 text-gray-500 hover:text-gray-700 rounded-2xl hover:bg-gray-100/80 transition-all duration-300 ease-in-out shadow-sm hover:shadow-md border border-gray-200/50"
              >
                <Menu className="h-5 w-5" />
              </motion.button>
            )}
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
              >
                <span className="text-white font-bold text-sm">B</span>
              </motion.div>
              <div>
                <h1 className="text-xl font-black bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
                  {user?.name || 'Guest'}
                </h1>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3 text-green-500" />
                  Welcome back
                </p>
              </div>
            </div>
          </div>

          {/* Right: User Profile with Dropdown */}
          <div className="flex items-center space-x-4" ref={dropdownRef}>
            {/* User Profile Dropdown */}
            <motion.div 
              className="relative"
              initial={false}
              animate={isDropdownOpen ? "open" : "closed"}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 p-2 rounded-2xl hover:bg-gray-100/80 transition-all duration-300 ease-in-out group border border-transparent hover:border-gray-200/50"
              >
                <div className="hidden sm:flex flex-col items-end">
                  <p className="text-sm font-semibold text-gray-900 text-right">
                    {user?.name || 'Guest User'}
                  </p>
                  <div className="flex items-center gap-1">
                    <div className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${getRoleBadgeColor()} text-white font-medium capitalize`}>
                      {user?.role || 'User'}
                    </div>
                    <Sparkles className="w-3 h-3 text-amber-500" />
                  </div>
                </div>
                
                <div className="relative">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center overflow-hidden shadow-lg border-2 border-white group-hover:border-blue-200 transition-all duration-300">
                    {user?.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`text-sm font-bold text-gray-600 ${user?.avatar ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                      {getUserInitials()}
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                
                <motion.div
                  animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="hidden sm:block"
                >
                  <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </motion.div>
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden z-50"
                  >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-purple-50/50">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center overflow-hidden shadow-lg border-2 border-white">
                          {user?.avatar ? (
                            <Image
                              src={user.avatar}
                              alt={user.name}
                              width={48}
                              height={48}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="text-lg font-bold text-gray-600">
                              {getUserInitials()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user?.name || 'Guest User'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email || 'No email'}
                          </p>
                          <div className={`inline-flex text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${getRoleBadgeColor()} text-white font-medium mt-1 capitalize`}>
                            {user?.role || 'User'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <motion.button
                        whileHover={{ x: 5 }}
                        onClick={handleProfileClick}
                        className="w-full flex items-center space-x-3 p-3 text-sm text-gray-700 hover:text-blue-600 rounded-xl hover:bg-blue-50/80 transition-all duration-200 group"
                      >
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium">My Profile</p>
                          <p className="text-xs text-gray-500">View and edit profile</p>
                        </div>
                      </motion.button>

                      <div className="my-2 border-t border-gray-200/50"></div>

                      <motion.button
                        whileHover={{ x: 5 }}
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 p-3 text-sm text-gray-700 hover:text-red-600 rounded-xl hover:bg-red-50/80 transition-all duration-200 group"
                      >
                        <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                          <LogOut className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium">Sign Out</p>
                          <p className="text-xs text-gray-500">Logout from your account</p>
                        </div>
                      </motion.button>
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-gray-200/50 bg-gray-50/50">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>MOH Capital v1.0</span>
                        <Shield className="h-3 w-3 text-green-500" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  );
}
