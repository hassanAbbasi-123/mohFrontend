// app/(auth)/login/page.js - COMPLETE UPDATED VERSION
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/store/features/authApi";
import toast, { Toaster } from "react-hot-toast";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginId, setLoginId] = useState(""); // Changed from email to loginId
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loginType, setLoginType] = useState("email"); // "email" or "customerId"

  const router = useRouter();
  const [loginUser, { isLoading }] = useLoginMutation();

  const isDev = process.env.NODE_ENV !== "production";

  // 🔹 Extract readable error message
  const getReadableErrorMessage = (err) => {
    if (!err) return "Login failed. Please try again.";

    const status = err?.status ?? err?.originalStatus ?? null;
    const data = err?.data ?? null;

    if (data) {
      if (typeof data === "string" && data.trim()) return data;
      if (typeof data === "object") {
        if (data.message) return String(data.message);
        if (Array.isArray(data.errors) && data.errors.length) {
          const first = data.errors[0];
          if (typeof first === "string") return first;
          if (first?.msg) return first.msg;
          if (first?.message) return first.message;
        }
        const s = JSON.stringify(data);
        if (s && s !== "{}") return s;
      }
    }

    if (err?.error) return String(err.error);
    if (err?.message) return String(err.message);

    if (status === 401) return "Invalid login credentials";
    if (status === 403)
      return "Your account is awaiting admin approval. Please try again later.";

    if (status) return `Request failed with status ${String(status)}`;

    return "Login failed. No error details provided by server.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Prepare login data based on login type
    let loginData = { password };

    if (loginType === "email") {
      loginData.email = loginId;
    } else {
      loginData.customerId = loginId;
    }

    try {
      const action = await loginUser(loginData);

      if (action?.error) {
        const readable = getReadableErrorMessage(action.error);
        const status = action.error?.status ?? action.error?.originalStatus ?? null;

        const isAwaitingApproval =
          status === 403 ||
          /awaiting/i.test(readable) ||
          /not verified/i.test(readable);

        if (isAwaitingApproval) {
          toast.error(
            "You can't login until admin approves and verifies you. It may take 30 minutes."
          );
        } else {
          toast.error(readable);
        }

        setError(readable);
        return;
      }

      // ✅ Success
      const response = action?.data;
      if (isDev) console.log("Login success response:", response);

      if (typeof window !== "undefined") {
        if (response?.token) {
          localStorage.setItem("token", response.token);
        }
        localStorage.setItem("user", JSON.stringify(response));
      }

      // UPDATE THIS REDIRECT LOGIC:
      if (response?.role === "admin") {
        router.push("/admin/dashboard");
      } else if (response?.role === "user") {
        router.push("/user/user-dash");
      } else if (response?.role === "seller") {
        router.push("/seller-dashboard");
      } else if (response?.role === "customer") {
        router.push("/customer/dashboard"); // NEW: Redirect customers to buyer dashboard
      } else {
        const unknownRoleMsg = "Unknown role. Contact support.";
        toast.error(unknownRoleMsg);
        setError(unknownRoleMsg);
      }
    } catch (err) {
      const readable = getReadableErrorMessage(err);
      toast.error(readable);
      setError(readable);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-[#0f0f0f] text-white flex items-center justify-center"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <Toaster position="top-center" reverseOrder={false} />

      <div className="flex flex-col lg:flex-row w-full max-w-7xl p-4 sm:p-8 gap-8 lg:gap-12 h-full">
        {/* Left section */}
        <div className="flex flex-col justify-center items-start space-y-6 lg:space-y-8 w-full lg:w-1/2 lg:min-h-[80vh]">
          <div className="w-full">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-[#A259FF] to-[#6A4CFF] bg-clip-text text-transparent">
                MOH Capital
              </span>
            </h1>
            <p className="mt-3 sm:mt-4 text-gray-400 max-w-md text-sm sm:text-base">
              Access your MOH Capital account, manage your preferences, and unlock
              personalized experiences instantly.
            </p>
          </div>

          <div className="hidden lg:block rounded-xl overflow-hidden shadow-lg w-full max-w-lg">
            <Image
              src="/earbudsgl.jpg"
              alt="Device showcase"
              width={640}
              height={360}
              className="object-cover w-full h-auto"
              priority
            />
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="flex items-center justify-center w-full lg:w-1/2 my-8 lg:my-0">
          <div className="bg-[#1E1E1E] rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Welcome Back</h2>
              <p className="text-gray-400 mt-2 text-sm sm:text-base">
                Access your MOH Capital account, manage your preferences
              </p>
            </div>

            {/* Login Type Toggle */}
            <div className="flex mb-6 bg-gray-800 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setLoginType("email")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  loginType === "email"
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Email Login
              </button>
              <button
                type="button"
                onClick={() => setLoginType("customerId")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  loginType === "customerId"
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Customer ID
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* Login ID Field (Email or Customer ID) */}
              <div>
                <label
                  htmlFor="loginId"
                  className="block text-sm mb-2 text-gray-300"
                >
                  {loginType === "email" ? "Email Address" : "Customer ID"}
                </label>
                <input
                  type={loginType === "email" ? "email" : "text"}
                  id="loginId"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder={
                    loginType === "email" 
                      ? "Enter your email" 
                      : "Enter your Customer ID (e.g., CUST0001)"
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 sm:py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                  required
                />
                {loginType === "customerId" && (
                  <p className="text-xs text-gray-400 mt-1">
                    Your Customer ID was provided when your account was created
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm mb-2 text-gray-300"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 sm:py-3 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && <p className="text-red-500 text-sm">{error}</p>}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 sm:py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-[#A259FF] to-[#6A4CFF] hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                {loginType === "email" 
                  ? "For Admin, Seller, and User accounts" 
                  : "For Customer accounts only"
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;