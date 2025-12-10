"use client"
import React, { useState, useEffect } from "react"
import {
  Home, Search, ShoppingCart, Heart, User, Package, Settings, Smartphone,
  Star, TrendingUp, X, Menu, MessageCircle, LogOut, ChevronRight,
  Sparkles, BadgeCheck,
  HeartCrack
} from "lucide-react"
import { useChat } from "@/context/ChatContext"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useGetProfileQuery } from "@/store/features/profileApi"
import Image from "next/image"

// Custom SidebarMenu component with chat functionality
const CustomSidebarMenu = ({ items, onItemClick }) => {
  const { toggleChat, unreadCount } = useChat() || {}
  
  const safeToggleChat = () => {
    if (typeof toggleChat === "function") {
      try {
        toggleChat()
      } catch (err) {
        window.dispatchEvent(new CustomEvent("open-chat"))
      }
    } else {
      window.dispatchEvent(new CustomEvent("open-chat"))
    }
  }

  return (
    <ul className="space-y-1">
      {items.map((item, index) => (
        <motion.li
          key={item.title}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.06 }}
        >
          {item.customAction ? (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                safeToggleChat()
                onItemClick && onItemClick()
              }}
              aria-label={item.title}
              className="flex items-center w-full p-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 relative group border border-transparent hover:border-blue-200/50"
            >
              <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200/50 group-hover:bg-gradient-to-r group-hover:from-blue-100 group-hover:to-purple-100 group-hover:text-blue-600 transition-all duration-300">
                <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="ml-3 flex-1 text-left">
                <span className="font-medium text-sm">{item.title}</span>
              </div>
              {unreadCount > 0 && item.title === "Messages" && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg border border-white"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </motion.span>
              )}
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </motion.button>
          ) : (
            item.url ? (
              <Link
                href={item.url}
                onClick={(e) => {
                  onItemClick && onItemClick()
                }}
                className="flex items-center w-full p-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 group border border-transparent hover:border-blue-200/50"
              >
                <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200/50 group-hover:bg-gradient-to-r group-hover:from-blue-100 group-hover:to-purple-100 group-hover:text-blue-600 transition-all duration-300">
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="ml-3 flex-1 text-left">
                  <span className="font-medium text-sm">{item.title}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </Link>
            ) : (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onItemClick && onItemClick()
                }}
                className="flex items-center w-full p-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 group border border-transparent hover:border-blue-200/50"
              >
                <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200/50 group-hover:bg-gradient-to-r group-hover:from-blue-100 group-hover:to-purple-100 group-hover:text-blue-600 transition-all duration-300">
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="ml-3 flex-1 text-left">
                  <span className="font-medium text-sm">{item.title}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </motion.button>
            )
          )}
        </motion.li>
      ))}
    </ul>
  )
}

// Chat Header Component for sidebar
const ChatHeader = ({ onItemClick }) => {
  const { toggleChat, unreadCount } = useChat() || {}
  
  const safeToggleChat = () => {
    if (typeof toggleChat === "function") {
      try {
        toggleChat()
      } catch (err) {
        window.dispatchEvent(new CustomEvent("open-chat"))
      }
    } else {
      window.dispatchEvent(new CustomEvent("open-chat"))
    }
  }

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        safeToggleChat()
        onItemClick && onItemClick()
      }}
      aria-label="Open chat"
      className="relative p-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <MessageCircle className="w-6 h-6" />
      {unreadCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg border border-white"
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </motion.span>
      )}
    </motion.button>
  )
}

const mainNavItems = [
  { title: "Dashboard", url: "/user/user-dash", icon: Home },
  { title: "Cart", url: "/user/cart", icon: ShoppingCart },
  { title: "Lead", url: "/user/lead", icon: Heart },
  { title: "Wishlist", url: "/user/wishlist", icon: Heart },
  { title: "Orders", url: "/user/user-orders", icon: Package },
  { title: "Profile", url: "/user/user-profile", icon: User },
  { title: "Messages", url: "#", icon: MessageCircle, customAction: true },
]

const categoryItems = [
  { title: "All Categories", url: "/user/category", icon: Smartphone },
]

const quickLinks = [
  { title: "Trending", url: "/user/trending", icon: TrendingUp },
  { title: "Top Rated", url: "/user/top-rated", icon: Star },
  { title: "Settings", url: "/user/settings", icon: Settings },
]

export function AppSidebar() {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { data: profile, isLoading } = useGetProfileQuery()
  const router = useRouter()

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (!mobile) {
        setOpen(true)
      } else {
        setOpen(false)
      }
    }

    const token = localStorage.getItem("token")
    if (!token) router.push("/not-found")
    
    handleResize()
    window.addEventListener("resize", handleResize)
    
    return () => window.removeEventListener("resize", handleResize)
  }, [router])

  const toggleSidebar = () => setOpen(!open)

  const handleItemClick = () => {
    if (isMobile) {
      setOpen(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict; Secure"
    router.push("/login")
  }

  return (
    <>
      {/* Mobile header */}
      {isMobile && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-200/50 p-4 flex items-center justify-between"
        >
          <div className="flex items-center">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSidebar}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 bg-white/80 rounded-xl border border-gray-200/50 shadow-sm"
            >
              {open ? <X size={20} className="w-5 h-5" /> : <Menu size={20} className="w-5 h-5" />}
            </motion.button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                <Image
                  src="/mohcapitallogo.webp"
                  alt="Bustard Logo"
                  width={32}
                  height={32}
                  className="object-cover rounded-xl"
                  onError={(e) => {
                    try {
                      e.currentTarget.style.display = "none"
                      const fallback = document.createElement("span")
                      fallback.textContent = "B"
                      fallback.className = "text-white font-bold text-sm flex items-center justify-center w-full h-full"
                      e.currentTarget.parentNode.appendChild(fallback)
                    } catch (err) {
                      // ignore
                    }
                  }}
                />
              </div>
              <div>
                <h1 className="text-lg font-black bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
                  MOH Capital
                </h1>
              </div>
            </div>
          </div>
          <ChatHeader onItemClick={handleItemClick} />
        </motion.div>
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: open ? 0 : (isMobile ? -320 : 0),
          transition: { type: "spring", damping: 30, stiffness: 300 },
        }}
        className={`fixed inset-y-0 left-0 z-40 w-80 bg-gradient-to-b from-white to-gray-50/80 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isMobile ? (open ? "translate-x-0" : "-translate-x-full") : "translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Desktop Header */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex h-20 items-center justify-between px-6 border-b border-gray-200/50 bg-white/50"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden"
                >
                  <Image
                    src="/mohcapitallogo.webp"
                    alt="Bustard Logo"
                    width={48}
                    height={48}
                    className="object-cover rounded-2xl"
                  />
                </motion.div>
                <div>
                  <h1 className="text-xl font-black bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
                    MOH Capital
                  </h1>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3 text-green-500" />
                    Shopping Hub
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ChatHeader onItemClick={handleItemClick} />
              </div>
            </motion.div>
          )}

          {/* Mobile Sidebar Header */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex h-20 items-center justify-between px-6 border-b border-gray-200/50 bg-white/50"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden"
                >
                  <Image
                    src="/mohcapitallogo.webp"
                    alt="Bustard Logo"
                    width={48}
                    height={48}
                    className="object-cover rounded-2xl"
                  />
                </motion.div>
                <div>
                  <h1 className="text-xl font-black bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
                    MOH Capital
                  </h1>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3 text-green-500" />
                    Shopping Hub
                  </p>
                </div>
              </div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleSidebar}
                className="p-2 text-gray-600 hover:text-gray-900 bg-white/80 rounded-xl border border-gray-200/50 shadow-sm"
              >
                <X size={20} />
              </motion.button>
            </motion.div>
          )}

          {/* Navigation Content */}
          <div className="flex-1 overflow-y-auto py-6">
            <div className="px-4 mb-8">
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"
              >
                <div className="w-1 h-4 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
                Main Menu
              </motion.h3>
              <CustomSidebarMenu items={mainNavItems} onItemClick={handleItemClick} />
            </div>
            <div className="px-4 mb-8">
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"
              >
                <div className="w-1 h-4 bg-gradient-to-b from-green-400 to-emerald-400 rounded-full"></div>
                Categories
              </motion.h3>
              <CustomSidebarMenu items={categoryItems} onItemClick={handleItemClick} />
            </div>
            <div className="px-4">
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"
              >
                <div className="w-1 h-4 bg-gradient-to-b from-amber-400 to-orange-400 rounded-full"></div>
                Quick Links
              </motion.h3>
              <CustomSidebarMenu items={quickLinks} onItemClick={handleItemClick} />
            </div>
          </div>

          {/* Profile + Logout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="border-t border-gray-200/50 bg-white/50 backdrop-blur-sm p-4 mt-auto"
          >
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ) : profile ? (
              <div className="flex items-center justify-between">
                <Link
                  href="/user/user-profile"
                  onClick={handleItemClick}
                  className="flex items-center gap-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 p-3 rounded-2xl transition-all duration-300 group flex-1"
                >
                  <div className="relative">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center overflow-hidden shadow-lg border-2 border-white group-hover:border-blue-200 transition-all duration-300">
                      {profile.user?.avatar ? (
                        <Image
                          src={profile.user.avatar}
                          alt={profile.user.name}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="text-sm font-bold text-gray-600 flex items-center justify-center w-full h-full">
                          {profile.user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {profile.user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {profile.user?.email || "No email"}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="text-xs px-2 py-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-medium capitalize">
                        {profile.user?.role || "User"}
                      </div>
                      <Sparkles className="w-3 h-3 text-amber-500" />
                    </div>
                  </div>
                </Link>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="p-3 text-gray-600 hover:text-red-600 hover:bg-red-50/80 rounded-xl transition-all duration-300 border border-transparent hover:border-red-200/50 ml-2"
                >
                  <LogOut className="w-6 h-6" />
                </motion.button>
              </div>
            ) : (
              <div className="text-center p-4 text-gray-500 text-sm bg-gray-50/50 rounded-2xl border border-gray-200/50">
                <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p>No profile data</p>
                <p className="text-xs">Please login to continue</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Mobile spacing */}
      {isMobile && <div className="h-16 lg:h-0"></div>}
    </>
  )
}

export default AppSidebar