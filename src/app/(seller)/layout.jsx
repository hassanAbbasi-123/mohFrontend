'use client';
import { useState } from 'react';
import SellerHeader from '@/components/seller/sellerheader.jsx';
import SellerSidebar from '@/components/seller/sellerslider.jsx';

export default function SellerLayout({ children }) {
  const [currentPage, setCurrentPage] = useState('dashboard'); // lowercase for consistency
  const [isOpen, setIsOpen] = useState(false); // ✅ add sidebar state

  return (
    <div className="bg-gray-50 flex min-h-screen">
      {/* Sidebar */}
      <SellerSidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        {/* Header with button to open sidebar on mobile */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 flex items-center justify-between px-4 h-16">
          <SellerHeader currentPage={currentPage} />
          <button
            onClick={() => setIsOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            Open
          </button>
        </div>

        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
