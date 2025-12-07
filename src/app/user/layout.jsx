// /app/pages/user/layout.jsx
"use client";

import { AppSidebar } from "@/components/user/usersidebar";

export default function UserLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 p-4 lg:p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}