'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import Image from 'next/image'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-800 text-white">
        {/* Desktop View */}
        <div className="hidden md:block">
          <div className="px-4 py-2">
            <div className="flex justify-between items-center">
              <div className="flex space-x-6">
                <Link 
                  href="/our-partners" 
                  className="hover:text-green-300 transition-colors duration-200 text-sm font-medium"
                >
                  Our Partners
                </Link>
                <Link 
                  href="/become-seller" 
                  className="hover:text-green-300 transition-colors duration-200 text-sm font-medium"
                >
                  Become a Seller
                </Link>
              </div>
              
              {/* Logo and Name in Center for Desktop */}
              <div className="flex items-center space-x-2 absolute left-1/2 transform -translate-x-1/2">
                <Image
                  src="/bustardlogo.jpeg"
                  alt="MOHCapital Logo"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <div className="text-xl font-bold drop-shadow-lg">
                  MOH<span className="text-yellow-400">Capital</span>
                </div>
              </div>
              
              <div className="flex space-x-6">
                <Link 
                  href="/contact-about" 
                  className="hover:text-green-300 transition-colors duration-200 text-sm font-medium"
                >
                  Contact Us
                </Link>
                <Link 
                  href="/faq" 
                  className="hover:text-green-300 transition-colors duration-200 text-sm font-medium"
                >
                  FAQs
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
          <div className="px-4 py-3">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center space-x-2 text-white hover:text-green-300 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X size={24} />
                ) : (
                  <Menu size={24} />
                )}
                <span className="text-sm font-medium">Menu</span>
              </button>
              
              {/* Mobile Logo and Name in Center */}
              <div className="flex items-center space-x-2">
                <Image
                  src="/bustardlogo.jpeg"
                  alt="MOHCapital Logo"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <div className="text-lg font-bold tracking-tight">
                  MOH<span className="text-yellow-400">Capital</span>
                </div>
              </div>
              
              {/* Empty div for spacing - keeping original structure */}
              <div className="w-20"></div>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
            <div className="bg-emerald-900 border-t border-emerald-800 animate-slideDown">
              <div className="px-4 py-3 space-y-4">
                <div className="space-y-3">
                  <h3 className="text-green-300 text-xs font-semibold uppercase tracking-wider">
                    Quick Links
                  </h3>
                  <Link 
                    href="/our-partners" 
                    className="flex items-center justify-between py-2 text-white hover:text-green-300 transition-colors border-b border-emerald-800"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="font-medium">Our Partners</span>
                    <ChevronDown size={18} className="transform -rotate-90" />
                  </Link>
                  <Link 
                    href="/become-seller" 
                    className="flex items-center justify-between py-2 text-white hover:text-green-300 transition-colors border-b border-emerald-800"
                    onClick={() => setIsMobileMenuOpen(false)}
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
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="font-medium">Contact Us</span>
                    <ChevronDown size={18} className="transform -rotate-90" />
                  </Link>
                  <Link 
                    href="/faq" 
                    className="flex items-center justify-between py-2 text-white hover:text-green-300 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="font-medium">FAQs</span>
                    <ChevronDown size={18} className="transform -rotate-90" />
                  </Link>
                </div>
                
                {/* Additional mobile-only feature */}
                <div className="pt-4 border-t border-emerald-800">
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200">
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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