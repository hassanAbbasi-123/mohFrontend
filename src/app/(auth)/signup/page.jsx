// src/app/signup/page.jsx (AGRICULTURAL THEME)
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
  Sprout,
  Truck,
  Wheat,
  Leaf,
  TreesIcon,
  Sun,
  Droplets,
  Home,
  HomeIcon
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

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: value }));
  };

  const handleAadhaarChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 12);
    setFormData((prev) => ({ ...prev, aadhaar: value }));
  };

  const handleGstinChange = (e) => {
    const value = e.target.value.toUpperCase();
    setFormData((prev) => ({ ...prev, gstin: value }));
  };

  const handlePanChange = (e) => {
    const value = e.target.value.toUpperCase();
    setFormData((prev) => ({ ...prev, pan: value }));
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
      return "other";
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

    if (formData.phone && formData.phone.length !== 10) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    if (formData.aadhaar && formData.aadhaar.length !== 12) {
      alert("Aadhaar number must be exactly 12 digits");
      return;
    }

    const roleToSend = selectedRole || "user";

    try {
      const submitData = new FormData();

      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("password", formData.password);
      submitData.append("role", roleToSend);
      if (formData.phone) submitData.append("phone", formData.phone);
      if (formData.address) submitData.append("address", formData.address);
      if (formData.aadhaar) submitData.append("aadhaar", formData.aadhaar);

      if (roleToSend === "seller") {
        if (!formData.storeName || !formData.city || !formData.state) {
          alert("Store Name, City, and State are required for seller.");
          return;
        }

        submitData.append("storeName", formData.storeName);
        if (formData.storeDescription) submitData.append("storeDescription", formData.storeDescription);
        if (formData.gstin) submitData.append("gstin", formData.gstin);
        if (formData.pan) submitData.append("pan", formData.pan);
        submitData.append("businessType", formData.businessType);
        submitData.append("city", formData.city);
        submitData.append("state", formData.state);
        if (formData.pincode) submitData.append("pincode", formData.pincode);
        if (formData.district) submitData.append("district", formData.district);

        if (logo) submitData.append("logo", logo);
        documents.forEach((doc) => submitData.append("documents", doc));
        if (documentTypes.length > 0) {
          submitData.append("documentTypes", JSON.stringify(documentTypes));
        }
      }

      const result = await register(submitData).unwrap();
      console.log("Registration successful:", result);

      if (result.token) {
        localStorage.setItem("token", result.token);
      }

      router.push("/login");
    } catch (err) {
      console.error("Registration failed:", err);
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
        <title>Join Moh Capital - Cultivate Your Success</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div
        className="min-h-screen flex items-center justify-center p-4 lg:p-8 relative overflow-hidden"
        style={{ 
          fontFamily: "'Poppins', sans-serif",
          background: "linear-gradient(135deg, #0C3B2E 0%, #1A5D3A 30%, #2E8B57 70%, #3CB371 100%)",
          color: "#F0FFF0"
        }}
      >
        {/* Animated Agricultural Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Sun */}
          <motion.div 
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-10 right-10 lg:top-20 lg:right-20 w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full shadow-2xl"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <Sun className="w-12 h-12 lg:w-16 lg:h-16 text-yellow-500" />
            </div>
          </motion.div>

          {/* Floating Homes */}
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                x: ["0%", "100%", "0%"],
                y: ["0%", "20%", "0%"]
              }}
              transition={{
                duration: 15 + i * 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={`absolute w-40 h-20 lg:w-64 lg:h-32 bg-gradient-to-r from-white/20 to-white/10 rounded-full blur-xl`}
              style={{
                top: `${15 + i * 20}%`,
                left: `${i * -20}%`
              }}
            >
              <Home className="w-full h-full text-white/30" />
            </motion.div>
          ))}

          {/* Animated TreesIcon */}
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-0"
              style={{ 
                left: `${10 + i * 20}%`,
                width: "80px",
                height: "120px"
              }}
            >
              <TreesIcon className="w-full h-full text-green-900/40" />
            </motion.div>
          ))}

          {/* Floating Wheat */}
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                rotate: [0, 5, -5, 0],
                y: [0, -20, 0]
              }}
              transition={{ 
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute"
              style={{
                bottom: "10%",
                left: `${5 + i * 15}%`,
                width: "60px",
                height: "60px"
              }}
            >
              <Wheat className="w-full h-full text-yellow-600/30" />
            </motion.div>
          ))}

          {/* Animated Droplets */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                y: [0, 100, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2 + Math.random(),
                delay: i * 0.3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-0"
              style={{ 
                left: `${10 + i * 15}%`,
                width: "4px",
                height: "20px"
              }}
            >
              <Droplets className="w-full h-full text-blue-300/40" />
            </motion.div>
          ))}

          {/* Grain Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25px 25px, #D4A017 2px, transparent 2px)`,
              backgroundSize: '50px 50px'
            }}></div>
          </div>
        </div>

        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 max-w-7xl relative z-10">
          {/* Left Section */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }} 
            className="w-full lg:w-1/2 p-4 lg:p-8 flex flex-col justify-center"
          >
            <div className="max-w-2xl mx-auto lg:mx-0 space-y-8">
              <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, y: 30 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.8, delay: 0.2 }} 
                  className="relative"
                >
                  <div className="absolute -top-6 -left-6 w-16 h-16">
                    <Leaf className="w-full h-full text-green-300/30" />
                  </div>
                  <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                    Cultivate Your{" "}
                    <span className="relative">
                      <span className="bg-gradient-to-r from-green-300 via-yellow-300 to-green-400 bg-clip-text text-transparent animate-gradient-x">
                        Success
                      </span>
                      <motion.span
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute -right-12 top-1/2 transform -translate-y-1/2"
                      >
                        <Sprout className="w-10 h-10 text-green-300" />
                      </motion.span>
                    </span>
                  </h1>
                </motion.div>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.8, delay: 0.4 }} 
                  className="text-xl lg:text-2xl text-green-100 leading-relaxed"
                >
                  Join India's premier agricultural marketplace. Grow your business with verified farmers, traders, and agri-enthusiasts.
                </motion.p>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8, delay: 0.6 }} 
                className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
              >
                {[
                  { number: "50K+", label: "Verified Farmers", icon: "👨‍🌾" },
                  { number: "200+", label: "Crop Varieties", icon: "🌾" },
                  { number: "98%", label: "Satisfaction", icon: "⭐" },
                  { number: "24/7", label: "Agri Support", icon: "📞" },
                  { number: "500+", label: "Districts", icon: "🗺️" },
                  { number: "₹100Cr+", label: "Annual Trade", icon: "💰" },
                ].map((stat, index) => (
                  <motion.div 
                    key={index}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="text-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-green-400/50 transition-all duration-300"
                  >
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div className="text-2xl lg:text-3xl font-bold text-white mb-1">{stat.number}</div>
                    <div className="text-sm text-green-200">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8, delay: 0.8 }} 
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-yellow-600 rounded-3xl blur-2xl opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative overflow-hidden rounded-2xl transform transition-all duration-500 group-hover:scale-[1.02]">
                  <div className="aspect-video bg-gradient-to-br from-green-900/30 to-yellow-900/20 flex items-center justify-center">
                    <div className="text-center p-8">
                      <Truck className="w-24 h-24 text-green-300 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-white mb-2">Digital Farming Revolution</h3>
                      <p className="text-green-200">Join thousands who have transformed their agricultural business</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-green-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex -space-x-3">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-yellow-400 border-2 border-green-900 shadow-lg"></div>
                          ))}
                        </div>
                        <span className="text-white font-medium">Join 50,000+ farmers nationwide</span>
                      </div>
                      <div className="bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
                        <span className="text-green-400 text-sm font-medium">Growing</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Section */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }} 
            className="w-full lg:w-1/2 flex justify-center"
          >
            <div className="w-full max-w-md lg:max-w-2xl">
              <div className="w-full backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl" style={{ 
                background: "linear-gradient(135deg, rgba(20, 83, 45, 0.95) 0%, rgba(12, 59, 46, 0.95) 100%)",
                boxShadow: "0 25px 50px -12px rgba(0, 100, 0, 0.5)",
                border: "1px solid rgba(144, 238, 144, 0.2)"
              }}>
                <div className="p-4 sm:p-6 lg:p-8">
                  <AnimatePresence mode="wait">
                    {!selectedRole ? (
                      <motion.div 
                        key="role-selection" 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.9 }} 
                        transition={{ duration: 0.5 }} 
                        className="text-center space-y-6 sm:space-y-8"
                      >
                        <div className="space-y-4">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="relative inline-block"
                          >
                            <div className="absolute -top-4 -right-4">
                              <Sprout className="w-8 h-8 text-green-300 animate-pulse" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                              Choose Your Path
                            </h2>
                          </motion.div>
                          <motion.p 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: 0.3 }} 
                            className="text-green-200 text-base sm:text-lg"
                          >
                            Sow the seeds of your agricultural journey
                          </motion.p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                          {/* Farmer/Trader Card */}
                          <motion.button
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRoleSelect("seller")}
                            className="relative p-5 sm:p-6 lg:p-8 rounded-2xl text-left group cursor-pointer border-2 border-transparent hover:border-green-400/50 transition-all duration-500 overflow-hidden"
                            style={{ 
                              background: "linear-gradient(135deg, rgba(32, 99, 65, 0.9) 0%, rgba(20, 83, 45, 0.9) 100%)"
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <motion.div 
                              animate={{ rotate: [0, 5, -5, 0] }}
                              transition={{ duration: 4, repeat: Infinity }}
                              className="absolute top-4 right-4"
                            >
                              <Truck className="w-6 h-6 text-green-300/50" />
                            </motion.div>
                            <div className="relative z-10 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg">
                                  <Store className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-green-300 group-hover:text-green-400 group-hover:translate-x-1 transition-all duration-300" />
                              </div>
                              <div>
                                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Farmers & Traders</h3>
                                <p className="text-green-200 text-xs sm:text-sm leading-relaxed">
                                  Sell your produce, manage inventory, and connect with buyers across India.
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="px-2 py-1 bg-green-500/20 rounded-full">
                                  <span className="text-xs text-green-300 font-medium">Premium Tools</span>
                                </div>
                                <span className="text-xs text-green-300/70">Market Insights</span>
                              </div>
                            </div>
                          </motion.button>

                          {/* Buyer Card */}
                          <motion.button
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRoleSelect("user")}
                            className="relative p-5 sm:p-6 lg:p-8 rounded-2xl text-left group cursor-pointer border-2 border-transparent hover:border-yellow-400/50 transition-all duration-500 overflow-hidden"
                            style={{ 
                              background: "linear-gradient(135deg, rgba(32, 99, 65, 0.9) 0%, rgba(20, 83, 45, 0.9) 100%)"
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <motion.div 
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 3, repeat: Infinity }}
                              className="absolute top-4 right-4"
                            >
                              <Wheat className="w-6 h-6 text-yellow-300/50" />
                            </motion.div>
                            <div className="relative z-10 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg">
                                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all duration-300" />
                              </div>
                              <div>
                                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Buyers & Processors</h3>
                                <p className="text-green-200 text-xs sm:text-sm leading-relaxed">
                                  Source quality produce directly from verified farmers at competitive prices.
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="px-2 py-1 bg-yellow-500/20 rounded-full">
                                  <span className="text-xs text-yellow-300 font-medium">Verified Quality</span>
                                </div>
                                <span className="text-xs text-yellow-300/70">Direct Connect</span>
                              </div>
                            </div>
                          </motion.button>
                        </div>

                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          transition={{ delay: 0.8 }} 
                          className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20"
                        >
                          <p className="text-green-200 text-xs sm:text-sm">
                            💡 <strong>Flexible Growth:</strong> Start as a buyer and expand to selling later from your dashboard.
                          </p>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="registration-form" 
                        initial={{ opacity: 0, x: 50 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, x: -50 }} 
                        transition={{ duration: 0.5 }} 
                        className="space-y-4 sm:space-y-6"
                      >
                        {/* Header */}
                        <div className="text-center space-y-3 sm:space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <button
                              onClick={() => {
                                setSelectedRole(null);
                                setCurrentStep(1);
                              }}
                              className="flex items-center space-x-1 sm:space-x-2 text-green-300 hover:text-green-400 transition-colors duration-300 group"
                              aria-label="Go back to role selection"
                            >
                              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
                              <span className="text-xs sm:text-sm">Back to roles</span>
                            </button>
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <motion.div 
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className={`w-2 h-2 rounded-full ${selectedRole === "seller" ? "bg-green-400" : "bg-yellow-400"}`}
                              ></motion.div>
                              <span className="text-xs text-green-300 uppercase tracking-wide">
                                {selectedRole === "seller" ? "Farmer/Trader" : "Buyer"}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1 sm:space-y-2">
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                              Grow Your {selectedRole === "seller" ? "Farm Business" : "Network"}
                            </h2>
                            <p className="text-green-200 text-sm sm:text-base">
                              {selectedRole === "seller" ? "Cultivate trust with verified buyers" : "Harvest the best deals from trusted farmers"}
                            </p>
                          </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                          {/* Personal Info */}
                          <motion.div 
                            variants={containerVariants} 
                            initial="hidden" 
                            animate="visible" 
                            className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20"
                          >
                            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center space-x-2 sm:space-x-3">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <User className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                              </div>
                              <span>Personal Information</span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              {[
                                { label: "Full Name", name: "name", type: "text", icon: User, required: true },
                                { label: "Email Address", name: "email", type: "email", icon: Mail, required: true },
                                { label: "Phone Number", name: "phone", type: "tel", icon: Phone },
                                { label: "Aadhaar (Optional)", name: "aadhaar", type: "text", icon: Hash },
                                { label: "Address", name: "address", type: "text", icon: MapPin },
                              ].map((field) => (
                                <motion.div key={field.name} variants={itemVariants} className="space-y-1 sm:space-y-2">
                                  <label className="block text-xs sm:text-sm font-medium text-green-200 flex items-center space-x-1 sm:space-x-2">
                                    <field.icon className="w-3 h-3 sm:w-4 sm:h-4 text-green-300" />
                                    <span>{field.label}{field.required && " *"}</span>
                                  </label>
                                  <input
                                    className="w-full pl-3 pr-3 sm:pl-4 sm:pr-4 py-2.5 sm:py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 border border-green-600/30 hover:border-green-500/50 bg-green-900/30 backdrop-blur-sm text-sm sm:text-base"
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
                                        ? "e.g. 9876543210 (Optional)"
                                        : field.name === "aadhaar"
                                        ? "e.g. 123456789012 (Optional)"
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
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }} 
                              animate={{ opacity: 1, y: 0 }} 
                              transition={{ duration: 0.6 }} 
                              className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20"
                            >
                              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center space-x-2 sm:space-x-3">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                                  <HomeIcon className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                                </div>
                                <span>Farm/Trade Information</span>
                              </h3>

                              <div className="space-y-3 sm:space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                  {[
                                    { label: "Farm/Business Name *", name: "storeName", icon: Building },
                                    { label: "GSTIN (Optional)", name: "gstin", icon: FileCheck },
                                    { label: "PAN (Optional)", name: "pan", icon: FileText },
                                    { label: "City *", name: "city", icon: MapPin },
                                    { label: "State *", name: "state", icon: Globe },
                                    { label: "Pincode", name: "pincode", icon: Hash },
                                    { label: "District", name: "district", icon: MapPin },
                                  ].map((field) => (
                                    <div key={field.name} className="space-y-1 sm:space-y-2">
                                      <label className="block text-xs sm:text-sm font-medium text-green-200 flex items-center space-x-1 sm:space-x-2">
                                        <field.icon className="w-3 h-3 sm:w-4 sm:h-4 text-green-300" />
                                        <span>{field.label}</span>
                                      </label>
                                      <input
                                        className="w-full pl-3 pr-3 sm:pl-4 sm:pr-4 py-2.5 sm:py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300 border border-yellow-600/30 hover:border-yellow-500/50 bg-green-900/30 backdrop-blur-sm text-sm sm:text-base"
                                        name={field.name}
                                        value={formData[field.name]}
                                        onChange={
                                          field.name === "gstin"
                                            ? handleGstinChange
                                            : field.name === "pan"
                                            ? handlePanChange
                                            : handleInputChange
                                        }
                                        required={field.label.includes("*")}
                                        placeholder={
                                          field.name === "gstin"
                                            ? "e.g. 22AAAAA0000A1Z5 (Optional)"
                                            : field.name === "pan"
                                            ? "e.g. ABCDE1234F (Optional)"
                                            : undefined
                                        }
                                      />
                                    </div>
                                  ))}
                                  <div className="space-y-1 sm:space-y-2 sm:col-span-2">
                                    <label className="block text-xs sm:text-sm font-medium text-green-200 flex items-center space-x-1 sm:space-x-2">
                                      <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 text-green-300" />
                                      <span>Business Type</span>
                                    </label>
                                    <select
                                      className="w-full pl-3 pr-3 sm:pl-4 sm:pr-4 py-2.5 sm:py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300 border border-yellow-600/30 hover:border-yellow-500/50 bg-green-900/30 backdrop-blur-sm text-sm sm:text-base"
                                      name="businessType"
                                      value={formData.businessType}
                                      onChange={handleInputChange}
                                    >
                                      {["farmer", "trader", "fpo", "cooperative", "mill", "exporter", "processor"].map((t) => (
                                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="space-y-1 sm:space-y-2 sm:col-span-2">
                                    <label className="block text-xs sm:text-sm font-medium text-green-200">Farm/Business Description</label>
                                    <textarea
                                      className="w-full pl-3 pr-3 sm:pl-4 sm:pr-4 py-2.5 sm:py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300 border border-yellow-600/30 hover:border-yellow-500/50 bg-green-900/30 backdrop-blur-sm resize-none text-sm sm:text-base"
                                      name="storeDescription"
                                      rows="3"
                                      value={formData.storeDescription}
                                      onChange={handleInputChange}
                                    />
                                  </div>
                                </div>

                                {/* File Uploads */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                                  {/* Logo */}
                                  <motion.div 
                                    initial={{ opacity: 0, x: -20 }} 
                                    animate={{ opacity: 1, x: 0 }} 
                                    transition={{ duration: 0.6 }} 
                                    className="space-y-2 sm:space-y-3"
                                  >
                                    <label className="block text-xs sm:text-sm font-medium text-green-200 flex items-center space-x-1 sm:space-x-2">
                                      <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-green-300" />
                                      <span>Farm/Business Logo</span>
                                    </label>
                                    <div
                                      className={`border-2 border-dashed rounded-xl p-4 sm:p-6 text-center transition-all duration-300 cursor-pointer group ${isDragging ? "border-green-500 bg-green-500/10" : "border-green-600/30 hover:border-green-500/50 hover:bg-green-500/5"}`}
                                      onDragOver={handleDragOver}
                                      onDragLeave={handleDragLeave}
                                      onDrop={(e) => handleDrop(e, "logo")}
                                      onClick={() => fileInputRef.current?.click()}
                                    >
                                      <input ref={fileInputRef} type="file" name="logo" accept="image/*" onChange={handleFileChange} className="hidden" />
                                      <div className="flex flex-col items-center justify-center space-y-2 sm:space-y-3">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                                          <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                                        </div>
                                        <div>
                                          <p className="text-white font-medium mb-1 text-sm sm:text-base">Upload Logo</p>
                                          <p className="text-green-300 text-xs sm:text-sm">PNG, JPG, WEBP up to 10MB</p>
                                        </div>
                                      </div>
                                    </div>
                                    {logoPreview && (
                                      <motion.div 
                                        initial={{ opacity: 0, scale: 0.8 }} 
                                        animate={{ opacity: 1, scale: 1 }} 
                                        className="flex flex-col items-center space-y-1 sm:space-y-2 p-2 sm:p-3 rounded-lg bg-green-900/30"
                                      >
                                        <div className="relative">
                                          <img src={logoPreview} alt="Logo preview" className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover shadow-lg" />
                                          <button type="button" onClick={removeLogo} className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 transition-colors">
                                            <X className="w-2 h-2 sm:w-3 sm:h-3" />
                                          </button>
                                        </div>
                                        <p className="text-xs text-green-300 text-center">
                                          {logo.name} ({(logo.size / 1024 / 1024).toFixed(2)} MB)
                                        </p>
                                      </motion.div>
                                    )}
                                  </motion.div>

                                  {/* Documents */}
                                  <motion.div 
                                    initial={{ opacity: 0, x: 20 }} 
                                    animate={{ opacity: 1, x: 0 }} 
                                    transition={{ duration: 0.6 }} 
                                    className="space-y-2 sm:space-y-3"
                                  >
                                    <label className="block text-xs sm:text-sm font-medium text-green-200 flex items-center space-x-1 sm:space-x-2">
                                      <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-green-300" />
                                      <span>Verification Documents (Optional)</span>
                                    </label>
                                    <div
                                      className={`border-2 border-dashed rounded-xl p-4 sm:p-6 text-center transition-all duration-300 cursor-pointer group ${isDragging ? "border-yellow-500 bg-yellow-500/10" : "border-yellow-600/30 hover:border-yellow-500/50 hover:bg-yellow-500/5"}`}
                                      onDragOver={handleDragOver}
                                      onDragLeave={handleDragLeave}
                                      onDrop={(e) => handleDrop(e, "documents")}
                                      onClick={() => documentsInputRef.current?.click()}
                                    >
                                      <input ref={documentsInputRef} type="file" name="documents" multiple accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                                      <div className="flex flex-col items-center justify-center space-y-2 sm:space-y-3">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-500/20 flex items-center justify-center group-hover:bg-yellow-500/30 transition-colors">
                                          <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                                        </div>
                                        <div>
                                          <p className="text-white font-medium mb-1 text-sm sm:text-base">Upload Documents</p>
                                          <p className="text-green-300 text-xs sm:text-sm">Max 5 files, 10MB each</p>
                                        </div>
                                      </div>
                                    </div>
                                    {documents.length > 0 && (
                                      <motion.div 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        className="space-y-1 sm:space-y-2 max-h-32 sm:max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-green-900/30"
                                      >
                                        {documents.map((doc, index) => (
                                          <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-green-900/30 hover:bg-green-800/30 transition-colors"
                                          >
                                            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                                              <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 flex-shrink-0" />
                                              <span className="text-xs sm:text-sm text-green-200 truncate">{doc.name}</span>
                                            </div>
                                            <div className="flex items-center space-x-1 sm:space-x-2">
                                              <span className="text-xs text-green-300/70">{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                                              <button type="button" onClick={() => removeDocument(index)} className="text-red-400 hover:text-red-300 transition-colors">
                                                <X className="w-3 h-3 sm:w-4 sm:h-4" />
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
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ duration: 0.6 }} 
                            className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20"
                          >
                            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center space-x-2 sm:space-x-3">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                              </div>
                              <span>Security</span>
                            </h3>

                            <div className="space-y-3 sm:space-y-4">
                              {[
                                { label: "Password", name: "password", show: showPassword, toggle: togglePasswordVisibility },
                                { label: "Confirm Password", name: "confirmPassword", show: showConfirmPassword, toggle: toggleConfirmPasswordVisibility },
                              ].map((field) => (
                                <motion.div 
                                  key={field.name} 
                                  initial={{ opacity: 0, y: 20 }} 
                                  animate={{ opacity: 1, y: 0 }} 
                                  transition={{ duration: 0.6, delay: 0.1 }} 
                                  className="space-y-1 sm:space-y-2"
                                >
                                  <label className="block text-xs sm:text-sm font-medium text-green-200">{field.label} *</label>
                                  <div className="relative">
                                    <input
                                      className="w-full pl-3 pr-10 sm:pl-4 sm:pr-12 py-2.5 sm:py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 border border-green-600/30 hover:border-green-500/50 bg-green-900/30 backdrop-blur-sm text-sm sm:text-base"
                                      name={field.name}
                                      type={field.show ? "text" : "password"}
                                      value={formData[field.name]}
                                      onChange={handleInputChange}
                                      required
                                    />
                                    <button type="button" onClick={field.toggle} className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-green-300 hover:text-green-100 transition-colors duration-200">
                                      {field.show ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                                    </button>
                                  </div>
                                  {field.name === "password" && formData.password && (
                                    <motion.div 
                                      initial={{ opacity: 0, height: 0 }} 
                                      animate={{ opacity: 1, height: "auto" }} 
                                      className="space-y-1 sm:space-y-2"
                                    >
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-green-300">Password strength</span>
                                        <span className={`font-medium ${passwordStrength < 50 ? "text-red-400" : passwordStrength < 75 ? "text-yellow-400" : "text-green-400"}`}>
                                          {passwordStrength < 50 ? "Weak" : passwordStrength < 75 ? "Good" : "Strong"}
                                        </span>
                                      </div>
                                      <div className="w-full bg-green-900/50 rounded-full h-1.5 sm:h-2">
                                        <div className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 ${getStrengthColor()}`} style={{ width: `${passwordStrength}%` }}></div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-1 text-xs text-green-300/70">
                                        {[
                                          { text: "8+ characters", check: formData.password.length >= 8 },
                                          { text: "Uppercase letter", check: /[A-Z]/.test(formData.password) },
                                          { text: "Number", check: /[0-9]/.test(formData.password) },
                                          { text: "Special character", check: /[^A-Za-z0-9]/.test(formData.password) },
                                        ].map((req, i) => (
                                          <div key={i} className="flex items-center space-x-1">
                                            {req.check ? <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 text-green-400" /> : <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full border border-green-600" />}
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
                            className="w-full text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-300 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                            style={{ 
                              background: "linear-gradient(135deg, #2E8B57, #3CB371, #90EE90)",
                              boxShadow: "0 8px 32px rgba(46, 139, 87, 0.4)"
                            }}
                            type="submit"
                            disabled={isLoading}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10 flex items-center justify-center space-x-2 sm:space-x-3">
                              {isLoading ? (
                                <>
                                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span className="text-sm sm:text-base">Cultivating Your {selectedRole === "seller" ? "Farm Profile" : "Account"}...</span>
                                </>
                              ) : (
                                <>
                                  <Sprout className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" />
                                  <span className="text-sm sm:text-lg">Grow with Moh Capital</span>
                                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                              )}
                            </div>
                          </motion.button>
                        </form>

                        {/* Error Display */}
                        {error && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className="p-3 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/20"
                          >
                            <div className="flex items-center space-x-1 sm:space-x-2 text-red-400">
                              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="text-xs sm:text-sm">
                                {error.status === "FETCH_ERROR"
                                  ? "Network error: Unable to reach the server. Please check your internet connection and try again."
                                  : error?.data?.message || "Registration failed. Please try again."}
                              </span>
                            </div>
                          </motion.div>
                        )}

                        <div className="flex items-center my-4 sm:my-6">
                          <div className="flex-1 border-t border-green-600/30"></div>
                          <span className="px-3 sm:px-4 text-green-300 text-xs sm:text-sm">Or continue with</span>
                          <div className="flex-1 border-t border-green-600/30"></div>
                        </div>
                        <p className="text-center text-green-200 text-xs sm:text-sm">
                          Already have an account?{" "}
                          <a className="font-semibold hover:underline transition-all duration-300 hover:text-green-300 bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent" href="/login">
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