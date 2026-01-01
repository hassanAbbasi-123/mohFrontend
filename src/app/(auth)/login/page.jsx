// app/(auth)/login/page.js - AGRICULTURAL THEME
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/store/features/authApi";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { 
  Sprout, 
  Tractor, 
  Wheat, 
  Leaf, 
  Sun, 
  LucideHome,
  Shield,
  Eye,
  EyeOff,
  LogIn
} from "lucide-react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loginType, setLoginType] = useState("email");

  const router = useRouter();
  const [loginUser, { isLoading }] = useLoginMutation();

  const isDev = process.env.NODE_ENV !== "production";

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

      const response = action?.data;
      if (isDev) console.log("Login success response:", response);

      if (typeof window !== "undefined") {
        if (response?.token) {
          localStorage.setItem("token", response.token);
        }
        localStorage.setItem("user", JSON.stringify(response));
      }

      if (response?.role === "admin") {
        router.push("/admin/dashboard");
      } else if (response?.role === "user") {
        router.push("/user/user-dash");
      } else if (response?.role === "seller") {
        router.push("/seller-dashboard");
      } else if (response?.role === "customer") {
        router.push("/customer/dashboard");
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
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        fontFamily: "'Poppins', sans-serif",
        background: "linear-gradient(135deg, #0C3B2E 0%, #1A5D3A 30%, #2E8B57 70%, #3CB371 100%)",
      }}
    >
      <Toaster position="top-center" reverseOrder={false} />

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Sun */}
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-10 right-10 lg:top-20 lg:right-20 w-20 h-20 lg:w-28 lg:h-28 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full shadow-2xl"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Sun className="w-10 h-10 lg:w-14 lg:h-14 text-yellow-500" />
          </div>
        </motion.div>

        {/* Floating Wheat */}
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            animate={{ 
              rotate: [0, 5, -5, 0],
              y: [0, -15, 0]
            }}
            transition={{ 
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute"
            style={{
              bottom: "10%",
              left: `${5 + i * 20}%`,
              width: "50px",
              height: "50px"
            }}
          >
            <Wheat className="w-full h-full text-yellow-600/20" />
          </motion.div>
        ))}

        {/* Animated Leaves */}
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{ 
              x: ["0%", "100%", "0%"],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute opacity-20"
            style={{
              top: `${10 + i * 25}%`,
              left: `${i * -10}%`,
              width: "100px",
              height: "100px"
            }}
          >
            <Leaf className="w-full h-full text-green-300" />
          </motion.div>
        ))}

        {/* Grain Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, #D4A017 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row w-full max-w-7xl p-4 sm:p-8 gap-6 lg:gap-12 h-full relative z-10">
        {/* Left section */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col justify-center items-start space-y-6 lg:space-y-8 w-full lg:w-1/2 lg:min-h-[80vh]"
        >
          <div className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -top-4 -left-4">
                <Sprout className="w-8 h-8 text-green-300 animate-pulse" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-green-300 via-yellow-300 to-emerald-400 bg-clip-text text-transparent">
                  Moh Capital
                </span>
              </h1>
              <p className="mt-3 sm:mt-4 text-green-100 max-w-md text-sm sm:text-base lg:text-lg">
                Access India's premier agricultural marketplace. Connect with verified farmers, 
                traders, and grow your agricultural business.
              </p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:block rounded-2xl overflow-hidden shadow-2xl w-full max-w-lg"
          >
            <div className="aspect-video bg-gradient-to-br from-green-900/40 to-yellow-900/30 flex items-center justify-center">
              <div className="text-center p-8">
                <Tractor className="w-24 h-24 text-green-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Digital Farming Hub</h3>
                <p className="text-green-200">Where tradition meets technology</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-lg"
          >
            {[
              { icon: "🌾", label: "50K+ Farmers" },
              { icon: "🚜", label: "Smart Tools" },
              { icon: "📊", label: "Live Markets" },
              { icon: "🛡️", label: "Verified" },
              { icon: "💰", label: "Best Prices" },
              { icon: "📞", label: "24/7 Support" },
            ].map((feature, index) => (
              <div key={index} className="text-center p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="text-2xl mb-1">{feature.icon}</div>
                <div className="text-xs sm:text-sm text-green-200">{feature.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: Login Form */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-center w-full lg:w-1/2 my-8 lg:my-0"
        >
          <div className="relative w-full max-w-md">
            {/* Decorative Elements */}
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-6 -right-6"
            >
              <Leaf className="w-12 h-12 text-green-300/20" />
            </motion.div>
            
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6"
            >
              <Sprout className="w-12 h-12 text-yellow-300/20" />
            </motion.div>

            <div 
              className="bg-gradient-to-br from-green-900/90 to-emerald-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-green-300/20"
              style={{
                boxShadow: "0 20px 60px rgba(0, 100, 0, 0.3)",
              }}
            >
              <div className="text-center mb-6 sm:mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="inline-block mb-3"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg mx-auto">
                    <LucideHome className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Harvest Returns</h2>
                <p className="text-green-200 mt-2 text-sm sm:text-base">
                  Access your agricultural marketplace
                </p>
              </div>

              {/* Login Type Toggle */}
              <div className="flex mb-6 bg-green-800/50 backdrop-blur-sm rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setLoginType("email")}
                  className={`flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-2 ${
                    loginType === "email"
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                      : "text-green-300 hover:text-white hover:bg-green-700/30"
                  }`}
                >
                  <span>📧</span>
                  <span>Email Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLoginType("customerId")}
                  className={`flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-2 ${
                    loginType === "customerId"
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                      : "text-green-300 hover:text-white hover:bg-green-700/30"
                  }`}
                >
                  <span>👤</span>
                  <span>Customer ID</span>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Login ID Field */}
                <div>
                  <label
                    htmlFor="loginId"
                    className="block text-xs sm:text-sm mb-2 text-green-200 flex items-center space-x-1 sm:space-x-2"
                  >
                    <span>📝</span>
                    <span>{loginType === "email" ? "Email Address" : "Customer ID"}</span>
                  </label>
                  <div className="relative">
                    <input
                      type={loginType === "email" ? "email" : "text"}
                      id="loginId"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      placeholder={
                        loginType === "email" 
                          ? "Enter your email" 
                          : "Enter your Customer ID"
                      }
                      className="w-full bg-green-900/50 border border-green-600/30 rounded-xl py-2.5 sm:py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 placeholder-green-300/50 text-white"
                      required
                    />
                  </div>
                  {loginType === "customerId" && (
                    <p className="text-xs text-green-300/70 mt-1">
                      Your Customer ID was provided during registration
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs sm:text-sm mb-2 text-green-200 flex items-center space-x-1 sm:space-x-2"
                  >
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-green-900/50 border border-green-600/30 rounded-xl py-2.5 sm:py-3 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 placeholder-green-300/50 text-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-green-300 hover:text-green-100 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                  >
                    <p className="text-red-300 text-xs sm:text-sm flex items-center space-x-2">
                      <span>⚠️</span>
                      <span>{error}</span>
                    </p>
                  </motion.div>
                )}

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 sm:py-3.5 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                  style={{ 
                    background: "linear-gradient(135deg, #2E8B57, #3CB371, #90EE90)",
                    boxShadow: "0 8px 32px rgba(46, 139, 87, 0.4)"
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex items-center justify-center space-x-2 sm:space-x-3">
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm sm:text-base">Harvesting Access...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                        <span className="text-sm sm:text-base">Sign In to Farm Network</span>
                      </>
                    )}
                  </div>
                </motion.button>
              </form>

              {/* Help Text */}
              <div className="mt-6 text-center">
                <p className="text-xs text-green-300/70">
                  {loginType === "email" 
                    ? "For Farmers, Traders, and Admin accounts" 
                    : "For Customer accounts only"
                  }
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-green-600/30"></div>
                <span className="px-4 text-green-300 text-xs">New to our fields?</span>
                <div className="flex-1 border-t border-green-600/30"></div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <a 
                  href="/signup" 
                  className="inline-flex items-center space-x-2 text-green-300 hover:text-green-100 transition-colors group"
                >
                  <span className="text-sm">Start cultivating your success</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-green-400 group-hover:text-green-300"
                  >
                    →
                  </motion.span>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;