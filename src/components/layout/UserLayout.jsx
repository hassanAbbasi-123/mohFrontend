"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useChat } from "@/context/ChatContext"; // 👈
import ChatLayout from "@/components/chat/ChatLayout";

const UserLayout = ({ children }) => {
  const [user, setUser] = useState(null);
  const { toggleChat, unreadCount } = useChat(); // 👈

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Navbar */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-600">
            MyShop
          </Link>

          <nav className="flex gap-4 items-center">
            <Link href="/user/UserProductsPage" className="text-gray-700 hover:text-blue-600">
              Products
            </Link>
            <Link href="/wishlist" className="text-gray-700 hover:text-blue-600">
              Wishlist
            </Link>
            <Link href="/orders" className="text-gray-700 hover:text-blue-600">
              Orders
            </Link>

            {/* 👇 Chat button */}
            <button
              onClick={toggleChat}
              className="relative p-2 text-gray-600 hover:text-blue-600"
            >
              <MessageCircle className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {user ? (
              <>
                <span className="text-gray-600">Hi, {user.name || "User"}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-100 text-center py-4 text-gray-500 text-sm">
        © {new Date().getFullYear()} MyShop. All rights reserved.
      </footer>

      <ChatLayout />
    </div>
  );
};

export default UserLayout;