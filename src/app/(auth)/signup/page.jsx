// src/app/signup/page.jsx (FULLY UPDATED - no lines skipped, no removals, only additions/fixes for error handling and phone/aadhaar validation)
"use client";
import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useRegisterMutation } from "@/store/features/authApi";
import {
  ChevronRight,
  ArrowLeft,
  Store,
  User,
  Upload,
  Eye,
  EyeOff,
  X,
  CheckCircle,
  Shield,
  Mail,
  Phone,
  MapPin,
  FileText,
  Camera,
  Building,
  FileCheck,
  Hash,
  Globe,
  Briefcase,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SignUpPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const documentsInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    aadhaar: "",
    storeName: "",
    storeDescription: "",
    gstin: "",
    pan: "",
    businessType: "trader",
    city: "",
    state: "",
    pincode: "",
    district: "",
  });

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [register, { isLoading, error }] = useRegisterMutation();

  // Password strength
  useEffect(() => {
    let strength = 0;
    if (formData.password.length >= 8) strength += 25;
    if (/[A-Z]/.test(formData.password)) strength += 25;
    if (/[0-9]/.test(formData.password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 25;
    setPasswordStrength(strength);
  }, [formData.password]);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((prev) => !prev);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setCurrentStep(2);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // NEW: Sanitized handlers for phone and aadhaar
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: value }));
  };

  const handleAadhaarChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 12);
    setFormData((prev) => ({ ...prev, aadhaar: value }));
  };

  // Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files.length) return;

    if (type === "logo") {
      handleLogoFile(files[0]);
    } else {
      handleDocumentFiles(Array.from(files));
    }
  };

  const handleLogoFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file for logo");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Logo must be under 10 MB");
      return;
    }

    setLogo(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDocumentFiles = (fileArr) => {
    if (fileArr.length === 0) return;

    if (fileArr.length > 5) {
      alert("Maximum 5 documents allowed. Only the first 5 files will be accepted.");
      fileArr = fileArr.slice(0, 5);
    }

    const validFiles = fileArr.filter((f) => f.size <= 10 * 1024 * 1024);
    if (validFiles.length !== fileArr.length) {
      alert("Some documents exceeded 10 MB and were ignored.");
    }

    const newTypes = validFiles.map((f) => {
      const name = f.name.toLowerCase();
      if (name.includes("gst")) return "gstin";
      if (name.includes("pan")) return "pan";
      if (name.includes("aadhaar")) return "aadhaar";
      if (name.includes("cheque")) return "cancelled_cheque";
      if (name.includes("fssai")) return "fssai";
      if (name.includes("msme")) return "msme";
      return "gstin";
    });

    setDocuments((prev) => [...prev, ...validFiles].slice(0, 5));
    setDocumentTypes((prev) => [...prev, ...newTypes].slice(0, 5));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "logo" && files[0]) handleLogoFile(files[0]);
    if (name === "documents") handleDocumentFiles(Array.from(files || []));
  };

  const removeLogo = () => {
    setLogo(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeDocument = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
    setDocumentTypes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    // NEW: Client-side validation for phone and aadhaar (prevents backend validation errors)
    if (formData.phone) {
      if (formData.phone.length !== 10) {
        alert("Phone number must be exactly 10 digits");
        return;
      }
      if (!/^[6-9]/.test(formData.phone)) {
        alert("Indian mobile number must start with 6, 7, 8, or 9");
        return;
      }
    }

    if (formData.aadhaar) {
      if (formData.aadhaar.length !== 12) {
        alert("Aadhaar number must be exactly 12 digits");
        return;
      }
    }

    const roleToSend = selectedRole || "user";

    try {
      const submitData = new FormData();

      // Common fields
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("password", formData.password);
      submitData.append("role", roleToSend);
      if (formData.phone) submitData.append("phone", formData.phone);
      if (formData.address) submitData.append("address", formData.address);
      if (formData.aadhaar) submitData.append("aadhaar", formData.aadhaar);

      if (roleToSend === "seller") {
        if (!formData.storeName || !formData.gstin || !formData.city || !formData.state) {
          alert("Store Name, GSTIN, City, and State are required for seller.");
          return;
        }

        submitData.append("storeName", formData.storeName);
        if (formData.storeDescription) submitData.append("storeDescription", formData.storeDescription);
        submitData.append("gstin", formData.gstin);
        if (formData.pan) submitData.append("pan", formData.pan);
        submitData.append("businessType", formData.businessType);
        submitData.append("city", formData.city);
        submitData.append("state", formData.state);
        if (formData.pincode) submitData.append("pincode", formData.pincode);
        if (formData.district) submitData.append("district", formData.district);

        if (logo) submitData.append("logo", logo);
        documents.forEach((doc) => submitData.append("documents", doc));
        submitData.append("documentTypes", JSON.stringify(documentTypes));
      }

      const result = await register(submitData).unwrap();
      console.log("Registration successful:", result);

      // Redirect to OTP verification page with required params
      const params = new URLSearchParams({
        userId: result.userId,
        email: result.email,
        role: result.role,
      });
      router.push(`/verify-otp?${params.toString()}`);

    } catch (err) {
      console.error("Registration failed:", err);
      // REMOVED alert() here - error is now displayed cleanly via the existing error div below the button
      // The error div handles network errors, server messages, and defaults gracefully
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength < 50) return "bg-red-500";
    if (passwordStrength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <>
      <Head>
        <title>Join Bustard - Start Your Journey</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div
        className="min-h-screen flex items-center justify-center p-4 lg:p-8 relative overflow-hidden"
        style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#0A0A0A", color: "#E0E0E0" }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 max-w-7xl relative z-10">
          {/* Left Section */}
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="w-full lg:w-1/2 p-4 lg:p-8 flex flex-col justify-center">
            <div className="max-w-2xl mx-auto lg:mx-0 space-y-8">
              <div className="space-y-6">
                <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-4xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                  Welcome to{" "}
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient-x">
                    Moh Capital Overseas
                  </span>
                </motion.h1>

                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-xl lg:text-2xl text-gray-300 leading-relaxed">
                  Join the future of import export. Create, connect, and grow with our powerful platform designed for innovators and creators.
                </motion.p>
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {[
                  { number: "10K+", label: "Active Sellers" },
                  { number: "500K+", label: "Happy Customers" },
                  { number: "99.9%", label: "Uptime" },
                  { number: "24/7", label: "Support" },
                  { number: "5 Stars", label: "Rating" },
                  { number: "150+", label: "Countries" },
                ].map((stat, index) => (
                  <div key={index} className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-500/30 transition-all duration-300">
                    <div className="text-2xl lg:text-3xl font-bold text-white mb-1">{stat.number}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative overflow-hidden rounded-2xl transform transition-all duration-500 group-hover:scale-[1.02]">
                  <img
                    alt="Modern e-commerce platform interface"
                    className="w-full h-auto object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0zXk0ekqCfzZUBiXdcUBza1qyB9hsacAjeJPEaeZ3k8v9DOWk0yaaNG16ZRdrszqU0F4VTBW3WVu2tRgAgUhKulU34pnVp3OmL2NQO-mKZfIwywx9EKSRTzWJhqohN2cMk1W6DKlGFaOVcVFzBey1qQIP0rRQ3-XfCfqYgP9i0BaB3rkxaD-rJBE_DASNMrcF0Cv3dGd_6FcAUoThXkX77J_MHvNRTsNnEUGGc9qKUsRyAuBOIbLyoBBglB-_9PDdBrR-yFyAM64"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex -space-x-3">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 border-2 border-gray-900 shadow-lg"></div>
                          ))}
                        </div>
                        <span className="text-white font-medium">Join 10,000+ creators worldwide</span>
                      </div>
                      <div className="bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
                        <span className="text-green-400 text-sm font-medium">Live</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Section */}
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="w-full lg:w-1/2 flex justify-center">
            <div className="w-full max-w-md lg:max-w-2xl">
              <div className="w-full backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl" style={{ background: "linear-gradient(135deg, rgba(30, 28, 36, 0.9) 0%, rgba(42, 39, 51, 0.9) 100%)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
                <div className="p-6 lg:p-10">
                  <AnimatePresence mode="wait">
                    {!selectedRole ? (
                      <motion.div key="role-selection" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.5 }} className="text-center space-y-8">
                        <div className="space-y-4">
                          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-3xl lg:text-4xl font-bold text-white">
                            Start Your Journey
                          </motion.h2>
                          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-gray-400 text-lg">
                            Choose your path and unlock amazing features
                          </motion.p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                          {/* Seller Card */}
                          <motion.button
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRoleSelect("seller")}
                            className="relative p-6 lg:p-8 rounded-2xl text-left group cursor-pointer border-2 border-transparent hover:border-purple-500/50 transition-all duration-500 overflow-hidden"
                            style={{ background: "linear-gradient(135deg, rgba(45, 42, 55, 0.8) 0%, rgba(58, 54, 69, 0.8) 100%)" }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                                  <Store className="w-6 h-6 text-white" />
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-white mb-2">Become a Seller</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                  Launch your store, reach millions of customers, and grow your business with our powerful seller tools.
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="px-2 py-1 bg-yellow-500/20 rounded-full">
                                  <span className="text-xs text-yellow-400 font-medium">Premium</span>
                                </div>
                                <span className="text-xs text-gray-500">Advanced Analytics</span>
                              </div>
                            </div>
                          </motion.button>

                          {/* User Card */}
                          <motion.button
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRoleSelect("user")}
                            className="relative p-6 lg:p-8 rounded-2xl text-left group cursor-pointer border-2 border-transparent hover:border-blue-500/50 transition-all duration-500 overflow-hidden"
                            style={{ background: "linear-gradient(135deg, rgba(45, 42, 55, 0.8) 0%, rgba(58, 54, 69, 0.8) 100%)" }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg">
                                  <User className="w-6 h-6 text-white" />
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-white mb-2">Join as Shopper</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                  Discover amazing products, enjoy exclusive deals, and shop from verified sellers with complete peace of mind.
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="px-2 py-1 bg-blue-500/20 rounded-full">
                                  <span className="text-xs text-blue-400 font-medium">Free</span>
                                </div>
                                <span className="text-xs text-gray-500">Instant Access</span>
                              </div>
                            </div>
                          </motion.button>
                        </div>

                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                          <p className="text-gray-300 text-sm">
                            Tip: <strong>Flexible choice:</strong> You can always upgrade your account later from dashboard settings.
                          </p>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div key="registration-form" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.5 }} className="space-y-6">
                        {/* Header */}
                        <div className="text-center space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <button
                              onClick={() => {
                                setSelectedRole(null);
                                setCurrentStep(1);
                              }}
                              className="flex items-center space-x-2 text-gray-400 hover:text-purple-400 transition-colors duration-300 group"
                              aria-label="Go back to role selection"
                            >
                              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                              <span className="text-sm">Back to roles</span>
                            </button>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${selectedRole === "seller" ? "bg-yellow-400" : "bg-blue-400"}`}></div>
                              <span className="text-xs text-gray-500 uppercase tracking-wide">
                                {selectedRole === "seller" ? "Seller" : "Shopper"}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h2 className="text-2xl lg:text-3xl font-bold text-white">
                              Create Your {selectedRole === "seller" ? "Store" : "Account"}
                            </h2>
                            <p className="text-gray-400">
                              {selectedRole === "seller" ? "Set up your store and start selling in minutes" : "Join our community of savvy shoppers"}
                            </p>
                          </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                          {/* Personal Info */}
                          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <User className="w-4 h-4 text-purple-400" />
                              </div>
                              <span>Personal Information</span>
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {[
                                { label: "Full Name", name: "name", type: "text", icon: User, required: true },
                                { label: "Email Address", name: "email", type: "email", icon: Mail, required: true },
                                { label: "Phone Number", name: "phone", type: "tel", icon: Phone },
                                { label: "Aadhaar", name: "aadhaar", type: "text", icon: Hash },
                                { label: "Address", name: "address", type: "text", icon: MapPin },
                              ].map((field) => (
                                <motion.div key={field.name} variants={itemVariants} className="space-y-2">
                                  <label className="block text-sm font-medium text-gray-300 flex items-center space-x-2">
                                    <field.icon className="w-4 h-4 text-gray-400" />
                                    <span>{field.label}{field.required && " *"}</span>
                                  </label>
                                  <input
                                    className="w-full pl-4 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 border border-gray-600 hover:border-purple-500/50 bg-gray-800/50 backdrop-blur-sm"
                                    name={field.name}
                                    type={field.type}
                                    value={formData[field.name]}
                                    onChange={
                                      field.name === "phone"
                                        ? handlePhoneChange
                                        : field.name === "aadhaar"
                                        ? handleAadhaarChange
                                        : handleInputChange
                                    }
                                    maxLength={
                                      field.name === "phone" ? 10 : field.name === "aadhaar" ? 12 : undefined
                                    }
                                    placeholder={
                                      field.name === "phone"
                                        ? "e.g. 9876543210"
                                        : field.name === "aadhaar"
                                        ? "e.g. 123456789012"
                                        : undefined
                                    }
                                    required={field.required}
                                  />
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>

                          {/* Seller Fields */}
                          {selectedRole === "seller" && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                                  <Store className="w-4 h-4 text-yellow-400" />
                                </div>
                                <span>Store Information</span>
                              </h3>

                              <div className="space-y-4">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  {[
                                    { label: "Store Name *", name: "storeName", icon: Building },
                                    { label: "GSTIN *", name: "gstin", icon: FileCheck },
                                    { label: "PAN", name: "pan", icon: FileText },
                                    { label: "City *", name: "city", icon: MapPin },
                                    { label: "State *", name: "state", icon: Globe },
                                    { label: "Pincode", name: "pincode", icon: Hash },
                                    { label: "District", name: "district", icon: MapPin },
                                  ].map((field) => (
                                    <div key={field.name} className="space-y-2">
                                      <label className="block text-sm font-medium text-gray-300 flex items-center space-x-2">
                                        <field.icon className="w-4 h-4 text-gray-400" />
                                        <span>{field.label}</span>
                                      </label>
                                      <input
                                        className="w-full pl-4 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300 border border-gray-600 hover:border-yellow-500/50 bg-gray-800/50 backdrop-blur-sm"
                                        name={field.name}
                                        value={formData[field.name]}
                                        onChange={handleInputChange}
                                        required={field.label.includes("*")}
                                      />
                                    </div>
                                  ))}
                                  <div className="space-y-2 lg:col-span-2">
                                    <label className="block text-sm font-medium text-gray-300 flex items-center space-x-2">
                                      <Briefcase className="w-4 h-4 text-gray-400" />
                                      <span>Business Type</span>
                                    </label>
                                    <select
                                      className="w-full pl-4 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300 border border-gray-600 hover:border-yellow-500/50 bg-gray-800/50 backdrop-blur-sm"
                                      name="businessType"
                                      value={formData.businessType}
                                      onChange={handleInputChange}
                                    >
                                      {["trader", "individual", "fpo", "cooperative", "mill", "exporter", "processor"].map((t) => (
                                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="space-y-2 lg:col-span-2">
                                    <label className="block text-sm font-medium text-gray-300">Store Description</label>
                                    <textarea
                                      className="w-full pl-4 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300 border border-gray-600 hover:border-yellow-500/50 bg-gray-800/50 backdrop-blur-sm resize-none"
                                      name="storeDescription"
                                      rows="3"
                                      value={formData.storeDescription}
                                      onChange={handleInputChange}
                                    />
                                  </div>
                                </div>

                                {/* File Uploads */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                                  {/* Logo */}
                                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-300 flex items-center space-x-2">
                                      <Camera className="w-4 h-4 text-gray-400" />
                                      <span>Store Logo</span>
                                    </label>
                                    <div
                                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer group ${isDragging ? "border-purple-500 bg-purple-500/10" : "border-gray-600 hover:border-purple-500/50 hover:bg-purple-500/5"}`}
                                      onDragOver={handleDragOver}
                                      onDragLeave={handleDragLeave}
                                      onDrop={(e) => handleDrop(e, "logo")}
                                      onClick={() => fileInputRef.current?.click()}
                                    >
                                      <input ref={fileInputRef} type="file" name="logo" accept="image/*" onChange={handleFileChange} className="hidden" />
                                      <div className="flex flex-col items-center justify-center space-y-3">
                                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                                          <Upload className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div>
                                          <p className="text-white font-medium mb-1">Upload Store Logo</p>
                                          <p className="text-gray-400 text-sm">PNG, JPG, WEBP up to 10MB</p>
                                        </div>
                                      </div>
                                    </div>
                                    {logoPreview && (
                                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center space-y-2 p-3 rounded-lg bg-gray-800/50">
                                        <div className="relative">
                                          <img src={logoPreview} alt="Logo preview" className="w-16 h-16 rounded-lg object-cover shadow-lg" />
                                          <button type="button" onClick={removeLogo} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 transition-colors">
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                        <p className="text-xs text-gray-400 text-center">
                                          {logo.name} ({(logo.size / 1024 / 1024).toFixed(2)} MB)
                                        </p>
                                      </motion.div>
                                    )}
                                  </motion.div>

                                  {/* Documents */}
                                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-300 flex items-center space-x-2">
                                      <FileText className="w-4 h-4 text-gray-400" />
                                      <span>Verification Documents</span>
                                    </label>
                                    <div
                                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer group ${isDragging ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-blue-500/50 hover:bg-blue-500/5"}`}
                                      onDragOver={handleDragOver}
                                      onDragLeave={handleDragLeave}
                                      onDrop={(e) => handleDrop(e, "documents")}
                                      onClick={() => documentsInputRef.current?.click()}
                                    >
                                      <input ref={documentsInputRef} type="file" name="documents" multiple accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                                      <div className="flex flex-col items-center justify-center space-y-3">
                                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                                          <Upload className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                          <p className="text-white font-medium mb-1">Upload Documents</p>
                                          <p className="text-gray-400 text-sm">Max 5 files, 10MB each</p>
                                        </div>
                                      </div>
                                    </div>
                                    {documents.length > 0 && (
                                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-700">
                                        {documents.map((doc, index) => (
                                          <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                                          >
                                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                              <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                              <span className="text-sm text-gray-300 truncate">{doc.name}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <span className="text-xs text-gray-500">{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                                              <button type="button" onClick={() => removeDocument(index)} className="text-red-400 hover:text-red-300 transition-colors">
                                                <X className="w-4 h-4" />
                                              </button>
                                            </div>
                                          </motion.div>
                                        ))}
                                      </motion.div>
                                    )}
                                  </motion.div>
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {/* Security */}
                          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <Shield className="w-4 h-4 text-green-400" />
                              </div>
                              <span>Security</span>
                            </h3>

                            <div className="space-y-4">
                              {[
                                { label: "Password", name: "password", show: showPassword, toggle: togglePasswordVisibility },
                                { label: "Confirm Password", name: "confirmPassword", show: showConfirmPassword, toggle: toggleConfirmPasswordVisibility },
                              ].map((field) => (
                                <motion.div key={field.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="space-y-2">
                                  <label className="block text-sm font-medium text-gray-300">{field.label} *</label>
                                  <div className="relative">
                                    <input
                                      className="w-full pl-4 pr-12 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 border border-gray-600 hover:border-purple-500/50 bg-gray-800/50 backdrop-blur-sm"
                                      name={field.name}
                                      type={field.show ? "text" : "password"}
                                      value={formData[field.name]}
                                      onChange={handleInputChange}
                                      required
                                    />
                                    <button type="button" onClick={field.toggle} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200">
                                      {field.show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                  </div>
                                  {field.name === "password" && formData.password && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-400">Password strength</span>
                                        <span className={`font-medium ${passwordStrength < 50 ? "text-red-400" : passwordStrength < 75 ? "text-yellow-400" : "text-green-400"}`}>
                                          {passwordStrength < 50 ? "Weak" : passwordStrength < 75 ? "Good" : "Strong"}
                                        </span>
                                      </div>
                                      <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div className={`h-2 rounded-full transition-all duration-500 ${getStrengthColor()}`} style={{ width: `${passwordStrength}%` }}></div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
                                        {[
                                          { text: "8+ characters", check: formData.password.length >= 8 },
                                          { text: "Uppercase letter", check: /[A-Z]/.test(formData.password) },
                                          { text: "Number", check: /[0-9]/.test(formData.password) },
                                          { text: "Special character", check: /[^A-Za-z0-9]/.test(formData.password) },
                                        ].map((req, i) => (
                                          <div key={i} className="flex items-center space-x-1">
                                            {req.check ? <CheckCircle className="w-3 h-3 text-green-400" /> : <div className="w-3 h-3 rounded-full border border-gray-500" />}
                                            <span className={req.check ? "text-green-400" : ""}>{req.text}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </motion.div>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>

                          {/* Submit */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                            style={{ background: "linear-gradient(135deg, #8A2BE2, #C462FF, #E879F9)", boxShadow: "0 8px 32px rgba(138, 43, 226, 0.3)" }}
                            type="submit"
                            disabled={isLoading}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10 flex items-center justify-center space-x-3">
                              {isLoading ? (
                                <>
                                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span>Creating Your {selectedRole === "seller" ? "Store" : "Account"}...</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-lg">Get Started with Bustard</span>
                                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                              )}
                            </div>
                          </motion.button>
                        </form>

                        {/* UPDATED ERROR DISPLAY - handles network errors, empty responses, and server messages cleanly */}
                        {error && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                            <div className="flex items-center space-x-2 text-red-400">
                              <Shield className="w-4 h-4" />
                              <span className="text-sm">
                                {error.status === "FETCH_ERROR"
                                  ? "Network error: Unable to reach the server. Please check your internet connection and try again."
                                  : error?.data?.message || "Registration failed. Please try again."}
                              </span>
                            </div>
                          </motion.div>
                        )}

                        <div className="flex items-center my-6">
                          <div className="flex-1 border-t border-gray-600"></div>
                          <span className="px-4 text-gray-400 text-sm">Or continue with</span>
                          <div className="flex-1 border-t border-gray-600"></div>
                        </div>
                        <p className="text-center text-gray-400">
                          Already have an account?{" "}
                          <a className="font-semibold hover:underline transition-all duration-300 hover:text-purple-300 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent" href="/login">
                            Sign in here
                          </a>
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default SignUpPage;