"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation"; // ✅ usePathname instead of pathname
import Link from "next/link";

const SellerLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname(); // ✅ current path
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  useEffect(() => {
    if (mounted && (!user || user.role !== "seller")) {
      router.push("/login");
    }
  }, [mounted, user, router]);

  if (!mounted || !user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link href="/seller" className="text-xl font-bold">
              Seller Dashboard
            </Link>

            {/* ✅ Navbar Links */}
            <div className="flex space-x-4">
              <Link
                href="/seller/products"
                className={`px-3 py-2 rounded-md ${
                  pathname === "/seller/products"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Products
              </Link>

              <Link
                href="/seller/orders"
                className={`px-3 py-2 rounded-md ${
                  pathname === "/seller/orders"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Orders
              </Link>
            </div>

            {/* ✅ User + Logout */}
            <div className="flex items-center space-x-2">
              <span>{user.name}</span>
              <button
                onClick={() => {
                  localStorage.removeItem("user");
                  localStorage.removeItem("token");
                  router.push("/login");
                }}
                className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ✅ Content */}
      <main>{children}</main>
    </div>
  );
};

export default SellerLayout;

