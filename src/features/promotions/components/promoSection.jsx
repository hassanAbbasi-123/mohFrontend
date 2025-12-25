// components/HeroBanner.jsx
'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { FaChevronLeft, FaChevronRight, FaHome, FaHeart, FaShoppingCart, FaUser, FaSearch } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { useGetActiveBannersQuery } from '@/store/features/bannerApi'
import Link from 'next/link'
import { Search, ShoppingCart, PhoneCall, Heart, User } from 'lucide-react'
import { useGetCartCountQuery } from '@/store/features/cartApi'
import { useGetSearchSuggestionsQuery } from '@/store/features/productApi'
import { useRouter } from 'next/navigation'

// Define API_BASE
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Default fallback slides with vegetable/fruit theme
const defaultSlides = [
  {
    id: 1,
    title: "Fresh Vegetables",
    subtitle: "Farm to Table Quality",
    bgColor: "from-green-500 to-emerald-600",
    image: "/vegetables-banner.jpg",
    overlay: "bg-gradient-to-r",
    textColor: "text-white"
  },
  {
    id: 2,
    title: "Organic Fruits",
    subtitle: "Nature's Sweetest Treats",
    bgColor: "from-orange-500 to-red-500",
    image: "/fruits-banner.jpg",
    overlay: "bg-gradient-to-br",
    textColor: "text-white"
  },
  {
    id: 3,
    title: "Premium Seeds",
    subtitle: "Grow Your Own Garden",
    bgColor: "from-amber-500 to-yellow-600",
    image: "/seeds-banner.jpg",
    overlay: "bg-gradient-to-tr",
    textColor: "text-white"
  },
  {
    id: 4,
    title: "Dried Legumes",
    subtitle: "Healthy & Nutritious",
    bgColor: "from-amber-700 to-orange-800",
    image: "/legumes-banner.jpg",
    overlay: "bg-gradient-to-l",
    textColor: "text-white"
  },
  {
    id: 5,
    title: "Seasonal Specials",
    subtitle: "Fresh Picked Daily",
    bgColor: "from-lime-500 to-green-600",
    image: "/seasonal-banner.jpg",
    overlay: "bg-gradient-to-t",
    textColor: "text-white"
  },
]

export default function HeroBanner() {
  const { data: fetchedBanners, isLoading, isError } = useGetActiveBannersQuery()
  const { data: cartCount } = useGetCartCountQuery()
  const { data: suggestions, isLoading: isSuggestionsLoading } = useGetSearchSuggestionsQuery('', { skip: true })
  
  const [search, setSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const searchRef = useRef(null)
  const router = useRouter()

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

  const slides = useMemo(() => {
    if (Array.isArray(fetchedBanners) && fetchedBanners.length > 0) {
      return fetchedBanners.map((b, i) => {
        const id = b._id || b.id || `banner-${i}`
        let image = b.image || ""
        if (image && !/^https?:\/\//i.test(image)) {
          image = `${API_BASE}${image}`
        }
        return {
          id,
          title: b.title || "",
          subtitle: b.subtitle || "",
          bgColor: b.bgColor || "from-green-500 to-emerald-600",
          image: image || "/placeholder.jpg",
          overlay: b.overlay || "bg-gradient-to-br",
          textColor: b.textColor || "text-white",
        }
      })
    }
    return defaultSlides
  }, [fetchedBanners, API_BASE])

  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isHovered, setIsHovered] = useState(false)
  const timerRef = useRef(null)
  const [isClient, setIsClient] = useState(false)

  // Detect mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (currentSlide >= slides.length) {
      setCurrentSlide(0)
    }
  }, [slides.length])

  useEffect(() => {
    if (!isHovered && isClient && slides.length > 1) {
      timerRef.current = setInterval(() => {
        setDirection(1)
        setCurrentSlide(prev => (prev + 1) % slides.length)
      }, 6000)
    }

    return () => clearInterval(timerRef.current)
  }, [isHovered, isClient, slides.length])

  const goToSlide = (index) => {
    setDirection(index > currentSlide ? 1 : -1)
    setCurrentSlide(index)
    resetTimer()
  }

  const nextSlide = () => {
    setDirection(1)
    setCurrentSlide(prev => (prev + 1) % slides.length)
    resetTimer()
  }

  const prevSlide = () => {
    setDirection(-1)
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)
    resetTimer()
  }

  const resetTimer = () => {
    clearInterval(timerRef.current)
    if (slides.length > 1) {
      timerRef.current = setInterval(() => {
        setDirection(1)
        setCurrentSlide(prev => (prev + 1) % slides.length)
      }, 6000)
    }
  }

  // Search functionality
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearch(value)
    setShowSuggestions(value.trim().length >= 2)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (search.trim()) {
      setShowSuggestions(false)
      setShowMobileSearch(false)
      router.push(`/search?query=${encodeURIComponent(search.trim())}`)
    }
  }

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch)
    setShowSuggestions(false)
  }

  const totalItems = cartCount?.totalItems || 0
  const cartTotal = cartCount?.cartTotal || 0

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0.7,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 400, damping: 30 },
        opacity: { duration: 0.6 },
        scale: { duration: 0.8 }
      }
    },
    exit: (direction) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0.7,
      scale: 0.95,
      transition: {
        x: { type: 'spring', stiffness: 400, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.6 }
      }
    })
  }

  const contentVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: (i) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.15,
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1]
      }
    })
  }

  // Mobile bottom bar navigation items
  const mobileNavItems = [
    {
      id: 'home',
      label: 'Home',
      icon: FaHome,
      href: '/',
      active: true
    },
    {
      id: 'search',
      label: 'Search',
      icon: FaSearch,
      action: toggleMobileSearch
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: FaHeart,
      href: '/favorites'
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: FaShoppingCart,
      href: '/cart',
      badge: totalItems > 0 ? totalItems : null
    },
    {
      id: 'account',
      label: 'Account',
      icon: FaUser,
      href: '/login'
    }
  ]

  return (
    <>
      {/* Main Banner Container - Separate from mobile bottom bar */}
      <div
        className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[85vh] max-h-[800px] overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Navigation Bar on Banner Top */}
        <div className={`absolute top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'
        }`}>
          <div className="px-4 py-3 flex items-center justify-between">
            {/* Empty left side - Logo removed */}
            <div className="flex items-center space-x-2 cursor-pointer min-w-max"></div>

            {/* Right Side Icons - Hide cart on mobile since it's in bottom bar */}
            <div className="flex items-center space-x-4">
              {/* Desktop Hotline */}
              <div className="hidden md:flex items-center space-x-2">
                <PhoneCall size={18} className={`flex-shrink-0 ${isScrolled ? 'text-green-600' : 'text-yellow-300'}`} />
                <div className="hidden lg:block">
                  <div className={`font-bold ${isScrolled ? 'text-green-700' : 'text-white'}`}>Hot Line 24/7</div>
                  <div className={`text-sm ${isScrolled ? 'text-green-600' : 'text-green-100'}`}>(+92)311-6636050</div>
                </div>
              </div>

              {/* Wishlist - Hide on mobile since it's in bottom bar */}
              <Link href="#" className={`p-2 ${isScrolled ? 'text-green-700' : 'text-white'} hover:text-yellow-400 transition-colors drop-shadow-lg ${isMobile ? 'hidden' : ''}`}>
                <Heart size={24} />
              </Link>

              {/* User Account - Hide on mobile since it's in bottom bar */}
              <Link href="/login" className={`p-2 ${isScrolled ? 'text-green-700' : 'text-white'} hover:text-yellow-400 transition-colors drop-shadow-lg ${isMobile ? 'hidden' : ''}`}>
                <User size={24} />
              </Link>

              {/* Cart - Hide on mobile since it's in bottom bar */}
              <button className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 group relative ${
                isScrolled 
                  ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                  : 'bg-white/10 backdrop-blur-md text-white hover:bg-white/20'
              } ${isMobile ? 'hidden' : ''}`}>
                <ShoppingCart className="flex-shrink-0 group-hover:text-yellow-400 transition-colors" size={20} />
                <div>
                  <div className="text-sm font-bold">
                    Rs. {cartTotal.toLocaleString()}
                  </div>
                  <div className="hidden sm:block text-xs opacity-80">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </div>
                </div>
                
                {/* Cart Badge */}
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isMobile && showMobileSearch && (
            <div className="absolute top-full left-0 w-full bg-white p-4 shadow-lg z-50">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowMobileSearch(false)}
                  className="flex-shrink-0 text-gray-600"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </button>
                <div className="flex-1 relative">
                  <form onSubmit={handleSearchSubmit}>
                    <div className="flex items-center bg-white rounded-full px-4 py-2 border-2 border-green-300 focus-within:border-green-500 transition-all duration-200">
                      <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Search for fresh produce..."
                        className="flex-1 text-black bg-transparent outline-none px-2 min-w-0 text-sm placeholder-gray-500"
                        autoFocus
                      />
                      <button type="submit">
                        <Search className="text-green-600 flex-shrink-0 cursor-pointer hover:text-green-700 transition-colors" size={20} />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Banner Content */}
        <div className="relative z-10 h-full w-full pt-16">
          <AnimatePresence custom={direction} initial={false}>
            {slides.length > 0 && (
              <motion.div
                key={slides[currentSlide].id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 flex items-center justify-center sm:justify-start"
              >
                {/* Slide background */}
                <div className={`absolute inset-0 ${slides[currentSlide].overlay} ${slides[currentSlide].bgColor} opacity-90`}></div>

                {/* Image */}
                <motion.div
                  className="absolute inset-0 overflow-hidden"
                  initial={{ scale: 1.15 }}
                  animate={{ scale: 1.05 }}
                  transition={{ duration: 8, ease: 'linear' }}
                >
                  <img
                    src={slides[currentSlide].image}
                    alt={slides[currentSlide].title}
                    className="w-full h-full object-cover"
                    style={{
                      filter: 'brightness(0.95) contrast(1.05)'
                    }}
                  />
                </motion.div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>

                {/* Content */}
                <div className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-8 md:px-12 lg:px-16 text-white text-center sm:text-left">
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    className="max-w-2xl space-y-5 sm:space-y-6"
                  >
                    <motion.span
                      custom={0}
                      variants={contentVariants}
                      className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm sm:text-base font-medium border border-white/10 shadow-lg"
                    >
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                      {slides[currentSlide].title}
                    </motion.span>

                    <motion.h1
                      custom={1}
                      variants={contentVariants}
                      className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight ${slides[currentSlide].textColor} drop-shadow-2xl`}
                    >
                      {slides[currentSlide].subtitle}
                    </motion.h1>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Arrows */}
          <motion.button
            onClick={prevSlide}
            className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 p-3 md:p-4 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all shadow-lg"
            aria-label="Previous"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaChevronLeft className="text-sm md:text-xl" />
          </motion.button>

          <motion.button
            onClick={nextSlide}
            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 p-3 md:p-4 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all shadow-lg"
            aria-label="Next"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaChevronRight className="text-sm md:text-xl" />
          </motion.button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2 md:gap-3">
            {slides.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-500 ${currentSlide === index ? 'bg-white scale-125' : 'bg-white/40 scale-100'}`}
                aria-label={`Slide ${index + 1}`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                {currentSlide === index && (
                  <span
                    className="absolute inset-0 rounded-full bg-white/30"
                    style={{ animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }}
                  ></span>
                )}
              </motion.button>
            ))}
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 md:h-1.5 z-20 bg-white/10 backdrop-blur-sm">
            <motion.div
              className="h-full bg-gradient-to-r from-white to-white/80"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 5.8, ease: 'linear' }}
              key={currentSlide}
            />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar - Semi-transparent background */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-sm py-3 px-4">
          <div className="flex justify-between items-center">
            {mobileNavItems.map((item) => (
              <div key={item.id} className="flex flex-col items-center flex-1">
                {item.href ? (
                  <Link 
                    href={item.href}
                    className="relative flex flex-col items-center p-2 rounded-lg transition-all duration-200 hover:bg-white/20 active:bg-white/30 w-full"
                  >
                    <item.icon 
                      className={`text-xl text-white drop-shadow-lg ${item.active ? 'text-yellow-300' : 'text-white'}`}
                    />
                    <span className={`text-xs mt-1 text-white drop-shadow-lg ${item.active ? 'text-yellow-300 font-semibold' : 'text-white'}`}>
                      {item.label}
                    </span>
                    
                    {/* Badge for cart */}
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse drop-shadow-lg">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </Link>
                ) : (
                  <button
                    onClick={item.action}
                    className="relative flex flex-col items-center p-2 rounded-lg transition-all duration-200 hover:bg-white/20 active:bg-white/30 w-full"
                  >
                    <item.icon 
                      className={`text-xl text-white drop-shadow-lg ${item.active ? 'text-yellow-300' : 'text-white'}`}
                    />
                    <span className={`text-xs mt-1 text-white drop-shadow-lg ${item.active ? 'text-yellow-300 font-semibold' : 'text-white'}`}>
                      {item.label}
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </>
  )
}