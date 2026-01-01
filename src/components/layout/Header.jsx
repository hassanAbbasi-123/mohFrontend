// components/Header.jsx
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, ChevronDown, Search, ShoppingCart, PhoneCall, Heart, User, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'
// import { useGetCartCountQuery } from '@/store/features/cartApi'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()
  
  // Add error handling for cart count API
  // const { data: cartCount, error, isLoading } = useGetCartCountQuery(undefined, {
  //   // Skip API call on initial load to prevent 401 error
  //   skip: typeof window === 'undefined'
  // })

  // Handle cart data safely - default to 0 if error or no data
  // const totalItems = (error || !cartCount) ? 0 : (cartCount?.totalItems || 0)
  // const cartTotal = (error || !cartCount) ? 0 : (cartCount?.cartTotal || 0)

  // Detect mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (search.trim()) {
      setShowMobileSearch(false)
      router.push(`/search?query=${encodeURIComponent(search.trim())}`)
    }
  }

  return (
    <>
      {/* Top Navigation Bar - Only Our Partners, Become Seller, Contact, FAQs - HIDDEN ON MOBILE */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-800 text-white text-sm py-2 hidden md:block">
        <div className="px-4 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4">
            <Link 
              href="/our-partners" 
              className="hover:text-green-300 transition-colors duration-200 text-xs sm:text-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Our Partners
            </Link>
            <Link 
              href="/become-seller" 
              className="hover:text-green-300 transition-colors duration-200 text-xs sm:text-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Become a Seller
            </Link>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4">
            <Link 
              href="/contact-about" 
              className="hover:text-green-300 transition-colors duration-200 text-xs sm:text-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact Us
            </Link>
            <Link 
              href="/faq" 
              className="hover:text-green-300 transition-colors duration-200 text-xs sm:text-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              FAQs
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
          <div className="flex items-center justify-around h-16">
            {/* Home */}
            <Link 
              href="/" 
              className="flex flex-col items-center justify-center w-full h-full active:bg-gray-50 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Home size={22} className="text-green-700" />
              <span className="text-xs mt-1 text-green-700 font-medium">Home</span>
            </Link>

            {/* Store/Categories */}
            <Link 
              href="/categories" 
              className="flex flex-col items-center justify-center w-full h-full active:bg-gray-50 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                MOH
              </div>
              <span className="text-xs mt-1 text-green-700 font-medium">Store</span>
            </Link>

            {/* Favorites */}
            <Link 
              href="/wishlist" 
              className="flex flex-col items-center justify-center w-full h-full active:bg-gray-50 transition-colors relative"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Heart size={22} className="text-green-700" />
              <span className="text-xs mt-1 text-green-700 font-medium">Favorites</span>
            </Link>

            {/* Cart */}
            {/* <button 
              onClick={() => {
                router.push('/cart')
                setIsMobileMenuOpen(false)
              }}
              className="flex flex-col items-center justify-center w-full h-full active:bg-gray-50 transition-colors relative"
            >
              <div className="relative">
                <ShoppingCart size={22} className="text-green-700" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 text-green-700 font-medium">Cart</span>
              {cartTotal > 0 && (
                <span className="text-[10px] text-green-600 font-bold absolute top-1 right-4">
                  Rs.{cartTotal > 999 ? (cartTotal/1000).toFixed(0)+'k' : cartTotal}
                </span>
              )}
            </button> */}

            {/* Account */}
            <Link 
              href="/login" 
              className="flex flex-col items-center justify-center w-full h-full active:bg-gray-50 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User size={22} className="text-green-700" />
              <span className="text-xs mt-1 text-green-700 font-medium">Account</span>
            </Link>
          </div>
        </div>
      )}


      {/* Add this CSS for animation */}
      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </>
  )
}