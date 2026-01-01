// components/HeroBanner.jsx
'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { FaChevronLeft, FaChevronRight, FaHome, FaHeart, FaShoppingCart, FaUser, FaSearch } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { useGetActiveBannersQuery } from '@/store/features/bannerApi'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Search, ShoppingCart, PhoneCall, Heart, User, ChevronDown, UserPlus,
  LogIn } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Define API_BASE
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Default fallback slides with vegetable/fruit theme - FIXED: Removed image paths to prevent 404 errors
const defaultSlides = [
  {
    id: 1,
    title: "Fresh Vegetables",
    subtitle: "Farm to Table Quality",
    bgColor: "from-green-500 to-emerald-600",
    image: "", // Empty string to prevent 404 error
    overlay: "bg-gradient-to-r",
    textColor: "text-white"
  },
  {
    id: 2,
    title: "Organic Fruits",
    subtitle: "Nature's Sweetest Treats",
    bgColor: "from-orange-500 to-red-500",
    image: "", // Empty string to prevent 404 error
    overlay: "bg-gradient-to-br",
    textColor: "text-white"
  },
  {
    id: 3,
    title: "Premium Seeds",
    subtitle: "Grow Your Own Garden",
    bgColor: "from-amber-500 to-yellow-600",
    image: "", // Empty string to prevent 404 error
    overlay: "bg-gradient-to-tr",
    textColor: "text-white"
  },
  {
    id: 4,
    title: "Dried Legumes",
    subtitle: "Healthy & Nutritious",
    bgColor: "from-amber-700 to-orange-800",
    image: "", // Empty string to prevent 404 error
    overlay: "bg-gradient-to-l",
    textColor: "text-white"
  },
  {
    id: 5,
    title: "Seasonal Specials",
    subtitle: "Fresh Picked Daily",
    bgColor: "from-lime-500 to-green-600",
    image: "", // Empty string to prevent 404 error
    overlay: "bg-gradient-to-t",
    textColor: "text-white"
  },
]

export default function HeroBanner() {
  const { data: fetchedBanners, isLoading, isError } = useGetActiveBannersQuery()
  
  
  
  const [search, setSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
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
          image: image || "", // Use empty string if no image
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
    // Close menu if search is opened
    if (!showMobileSearch) {
      setShowMobileMenu(false)
    }
  }

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu)
    // Close search if menu is opened
    if (!showMobileMenu) {
      setShowMobileSearch(false)
    }
  }



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
      icon: UserPlus,
      href: '/signup' // Updated to /signup
    },
   
    {
      id: 'account',
      label: 'Account',
      icon: LogIn,
      href: '/login'
    }
  ]

  return (
    <>
      {/* Mobile View - Hamburger, Logo, Search - SHOWN ONLY ON MOBILE */}
      <div className="md:hidden bg-gradient-to-r from-green-700 to-emerald-800 text-white text-sm">
        <div className="px-4">
          <div className="flex items-center justify-between py-2">
            {/* Hamburger Menu */}
            <button
              onClick={toggleMobileMenu}
              className="flex items-center space-x-2 text-white hover:text-green-300 transition-colors"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>

            {/* Logo in Center - WITH YOUR LOGO IMAGE */}
            <Link href="/" className="flex items-center space-x-2 cursor-pointer">
              <Image
                src="/mohcapitallogo.webp"
                alt="MOH Capital Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="text-lg font-bold text-white drop-shadow-lg">
                MOH<span className="text-yellow-400">Capital</span>
              </div>
            </Link>

            {/* Search Icon on Right */}
            <button 
              onClick={toggleMobileSearch}
              className="flex items-center space-x-2 text-white hover:text-green-300 transition-colors"
              aria-label="Search"
            >
              <Search size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar - Below the green bar */}
        {isMobile && showMobileSearch && (
          <div className="md:hidden bg-white p-4 border-t border-emerald-800">
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

        {/* Mobile Menu Dropdown - Below the green bar */}
        {isMobile && showMobileMenu && (
          <div className="md:hidden bg-emerald-900 border-t border-emerald-800">
            <div className="px-4 py-3 space-y-4">
              <div className="space-y-3">
                <h3 className="text-green-300 text-xs font-semibold uppercase tracking-wider">
                  Quick Links
                </h3>
                <Link 
                  href="/" 
                  className="flex items-center justify-between py-2 text-white hover:text-green-300 transition-colors border-b border-emerald-800"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <div className="flex items-center space-x-3">
                    <FaHome size={18} />
                    <span className="font-medium">Home</span>
                  </div>
                </Link>
                <Link 
                  href="/our-partners" 
                  className="flex items-center justify-between py-2 text-white hover:text-green-300 transition-colors border-b border-emerald-800"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span className="font-medium">Our Partners</span>
                  <ChevronDown size={18} className="transform -rotate-90" />
                </Link>
                <Link 
                  href="/become-seller" 
                  className="flex items-center justify-between py-2 text-white hover:text-green-300 transition-colors border-b border-emerald-800"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span className="font-medium">Become a Seller</span>
                  <ChevronDown size={18} className="transform -rotate-90" />
                </Link>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-green-300 text-xs font-semibold uppercase tracking-wider">
                  Support
                </h3>
                <Link 
                  href="/contact-about" 
                  className="flex items-center justify-between py-2 text-white hover:text-green-300 transition-colors border-b border-emerald-800"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span className="font-medium">Contact Us</span>
                  <ChevronDown size={18} className="transform -rotate-90" />
                </Link>
                <Link 
                  href="/faq" 
                  className="flex items-center justify-between py-2 text-white hover:text-green-300 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span className="font-medium">FAQs</span>
                  <ChevronDown size={18} className="transform -rotate-90" />
                </Link>
              </div>

              <div className="space-y-3">
                <h3 className="text-green-300 text-xs font-semibold uppercase tracking-wider">
                  Account
                </h3>
                <Link 
                  href="/signup" 
                  className="flex items-center justify-between py-2 text-white hover:text-green-300 transition-colors border-b border-emerald-800"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <div className="flex items-center space-x-3">
                    <UserPlus size={18} />
                    <span className="font-medium">Wishlist</span>
                  </div>
                </Link>
                <Link 
                  href="/login" 
                  className="flex items-center justify-between py-2 text-white hover:text-green-300 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <div className="flex items-center space-x-3">
                    <LogIn size={18} />
                    <span className="font-medium">My Account</span>
                  </div>
                </Link>
              </div>
              
              {/* Hotline in Mobile Menu */}
              <div className="pt-4 border-t border-emerald-800">
                <div className="flex items-center space-x-3">
                  <PhoneCall size={18} className="text-green-300" />
                  <div>
                    <div className="text-green-300 text-sm font-semibold">Hot Line 24/7</div>
                    <div className="text-white text-sm">(+91)96476 24282</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Banner Container - With Desktop Navigation on Top of Banner */}
      <div
        className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[85vh] max-h-[800px] overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Desktop Navigation Bar - On Top of Banner Image */}
        <div className="hidden md:block absolute top-0 left-0 w-full z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo - WITH YOUR LOGO IMAGE ON LEFT SIDE */}
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/mohcapitallogo.webp"
                  alt="MOH Capital Logo"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="text-xl font-bold text-white drop-shadow-lg">
                  MOH<span className="text-yellow-400">Capital</span>
                </div>
              </Link>

              {/* Search Bar */}
              <div className="flex-1 max-w-2xl mx-8">
                <form onSubmit={handleSearchSubmit}>
                  <div className="flex items-center rounded-full px-6 py-3 border-2 transition-all duration-200 shadow-lg bg-white/10 backdrop-blur-md border-white/30 focus-within:border-white/50">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search for fresh vegetables, fruits, seeds..."
                      className="flex-1 bg-transparent outline-none px-2 min-w-0 text-sm text-white placeholder-white/70"
                    />
                    <button type="submit">
                      <Search className="flex-shrink-0 cursor-pointer transition-colors text-white hover:text-yellow-300" size={20} />
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Side Icons */}
              <div className="flex items-center space-x-6">
                {/* Hotline */}
                <a
  href="https://wa.me/919647624282"
  target="_blank"
  rel="noopener noreferrer"
  className="hidden lg:flex items-center space-x-2 hover:opacity-90 transition-opacity"
>
  <PhoneCall size={18} className="flex-shrink-0 text-yellow-300" />
  <div>
    <div className="font-bold text-white text-sm drop-shadow-lg">
      WhatsApp 24/7
    </div>
    <div className="text-xs text-green-100 drop-shadow-lg">
      (+91) 96476 24282
    </div>
  </div>
</a>


                {/* Wishlist */}
                <Link href="/signup" className="p-2 text-white hover:text-yellow-300 transition-colors drop-shadow-lg">
                  <UserPlus size={24} />
                </Link>

                {/* User Account */}
                <Link href="/login" className="p-2 text-white hover:text-yellow-300 transition-colors drop-shadow-lg">
                  <LogIn size={24} />
                </Link>

               

              </div>
            </div>
          </div>
        </div>

        {/* Banner Content */}
        <div className="relative z-10 h-full w-full">
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

                {/* Image - Only show if image exists */}
                {slides[currentSlide].image && (
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
                      onError={(e) => {
                        // Hide image if it fails to load
                        e.target.style.display = 'none'
                      }}
                    />
                  </motion.div>
                )}

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

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
          <div className="flex items-center justify-around h-16">
            {mobileNavItems.map((item) => (
              <div key={item.id} className="flex flex-col items-center flex-1">
                {item.href ? (
                  <Link 
                    href={item.href}
                    className="relative flex flex-col items-center p-2 w-full active:bg-gray-50 transition-colors"
                    onClick={() => {
                      if (item.id === 'search') {
                        toggleMobileSearch();
                      }
                      setShowMobileMenu(false);
                    }}
                  >
                    <item.icon 
                      className={`text-xl ${item.active ? 'text-green-700' : 'text-green-700'}`}
                    />
                    <span className={`text-xs mt-1 ${item.active ? 'text-green-700 font-semibold' : 'text-green-700 font-medium'}`}>
                      {item.label}
                    </span>
                    
                    {/* Badge for cart */}
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      if (item.action) item.action();
                      setShowMobileMenu(false);
                    }}
                    className="relative flex flex-col items-center p-2 w-full active:bg-gray-50 transition-colors"
                  >
                    <item.icon 
                      className={`text-xl ${item.active ? 'text-green-700' : 'text-green-700'}`}
                    />
                    <span className={`text-xs mt-1 ${item.active ? 'text-green-700 font-semibold' : 'text-green-700 font-medium'}`}>
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