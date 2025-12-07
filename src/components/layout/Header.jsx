
'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <>
      {/* Top Navigation Bar - Only Our Partners, Become Seller, Contact, FAQs */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-800 text-white text-sm py-2">
        <div className="px-4 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4">
            <Link href="/our-partners" className="hover:text-green-300 transition-colors duration-200 text-xs sm:text-sm">Our Partners</Link>
            <Link href="/become-seller" className="hover:text-green-300 transition-colors duration-200 text-xs sm:text-sm">Become a Seller</Link>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4">
            <Link href="/contact-about" className="hover:text-green-300 transition-colors duration-200 text-xs sm:text-sm">Contact Us</Link>
            <Link href="/faq" className="hover:text-green-300 transition-colors duration-200 text-xs sm:text-sm">FAQs</Link>
          </div>
        </div>
      </div>
    </>
  )
}