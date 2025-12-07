"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children, allowedRoles }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.replace("/login"); // Use replace to avoid history stack issues
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(userData);
      const userRole = user.role?.trim().toLowerCase(); // Normalize role

      if (userRole && allowedRoles.map(role => role.toLowerCase()).includes(userRole)) {
        setAuthorized(true);
      } else {
        router.replace("/login");
      }
    } catch (err) {
      console.error("Auth parse error:", err);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router, allowedRoles]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-900 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mr-4"></div>
        Checking permissions...
      </div>
    );
  }

  return authorized ? children : null;
}