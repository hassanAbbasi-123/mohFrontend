"use client";

import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import {
  Package,
  Store,
  ShoppingCart,
  TrendingUp,
  Users,
  Home,
  Search,
  ChevronDown,
  Menu,
  X,
  LogOut,
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Lock,
  XCircle,
  CheckCircle,
  BarChart3,
  FolderOpen,
  Tag,
  Warehouse,
  Layers,
  Palette,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardOverview from "@/app/components/admin/dashboard/DashboardOverview";
import UserManagement from "@/app/components/admin/dashboard/User-Managment";
import SellerManagement from "@/app/components/admin/dashboard/seller-managment";
import ProductControl from "@/app/components/admin/dashboard/ProductManagment";
import OrderTracking from "@/app/components/admin/dashboard/OrderTracking";
import AnalyticsDashboard from "@/app/components/admin/dashboard/AnalyticsDashboard";
import AdminCategoriesPage from "@/app/components/admin/dashboard/CategoryManagement";
import AdminInventory from "@/app/components/admin/dashboard/AdminInventory";
import AdminBannerManagement from "@/app/components/admin/dashboard/AdminBannerManagement";
import LeadsManagement from "@/app/components/admin/dashboard/LeadsManagement";
import AccountsManagement from "@/app/components/admin/dashboard/AccountsManagement";
import { useGetProfileQuery, useUpdateProfileMutation, useChangePasswordMutation, useUploadProfilePictureMutation } from "@/store/features/profileApi";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
const icons = {
  home: <Home className="w-5 h-5" />,
  users: <Users className="w-5 h-5" />,
  store: <Store className="w-5 h-5" />,
  package: <Package className="w-5 h-5" />,
  "shopping-cart": <ShoppingCart className="w-5 h-5" />,
  "trending-up": <TrendingUp className="w-5 h-5" />,
  user: <User className="w-5 h-5" />,
  analytics: <BarChart3 className="w-5 h-5" />,
  categories: <FolderOpen className="w-5 h-5" />,
  brands: <Tag className="w-5 h-5" />,
  inventory: <Warehouse className="w-5 h-5" />,
  products: <Layers className="w-5 h-5" />,
  orders: <ShoppingCart className="w-5 h-5" />,
};

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  // Profile states
  const [profileFormData, setProfileFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Profile API hooks
  const { data: profile, isLoading: profileLoading, error: profileError } = useGetProfileQuery();
  const [updateProfile, { isLoading: updateProfileLoading, error: updateProfileError }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: changePasswordLoading, error: changePasswordError }] = useChangePasswordMutation();
  const [uploadProfilePicture, { isLoading: uploadPictureLoading, error: uploadPictureError }] = useUploadProfilePictureMutation();

  // Initialize profile form with fetched data
  useEffect(() => {
    if (profile) {
      setProfileFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
      });
      if (profile.profilePicture) {
        setProfilePicturePreview(profile.profilePicture);
      }
    }
  }, [profile]);

  // Password strength calculator
  useEffect(() => {
    const calculateStrength = () => {
      let strength = 0;
      if (passwordData.newPassword.length >= 8) strength += 25;
      if (/[A-Z]/.test(passwordData.newPassword)) strength += 25;
      if (/[0-9]/.test(passwordData.newPassword)) strength += 25;
      if (/[^A-Za-z0-9]/.test(passwordData.newPassword)) strength += 25;
      setPasswordStrength(strength);
    };
    calculateStrength();
  }, [passwordData.newPassword]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownOpen && !event.target.closest('.user-dropdown')) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "home", color: "from-blue-500 to-cyan-500" },
    { id: "profile", label: "Profile", icon: "user", color: "from-purple-500 to-pink-500" },
    { id: "users", label: "User Management", icon: "users", color: "from-green-500 to-emerald-500" },
    { id: "sellers", label: "Seller Management", icon: "store", color: "from-orange-500 to-red-500" },
    { id: "leads", label: "Leads Management", icon: "store", color: "from-orange-500 to-red-500" },
    { id: "accounts", label: "Accounts Management", icon: "inventory", color: "from-amber-500 to-yellow-500" },
    { id: "categories", label: "Category Management", icon: "categories", color: "from-indigo-500 to-purple-500" },
    { id: "inventory", label: "Inventory Management", icon: "inventory", color: "from-amber-500 to-yellow-500" },
    { id: "products", label: "Product Management", icon: "products", color: "from-teal-500 to-cyan-500" },
    { id: "orders", label: "Order Management", icon: "orders", color: "from-lime-500 to-green-500" },
    { id: "analytics", label: "Analytics & Reports", icon: "analytics", color: "from-violet-500 to-purple-500" },
    { id: "banners", label: "Banner Management", icon: "banners", color: "from-violet-500 to-purple-500" },
  ];

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    router.push("/login");
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSuccessMessage("Please upload an image file for profile picture");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setSuccessMessage("Profile picture must be under 10 MB");
      return;
    }

    setProfilePicture(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicturePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileFormData.name || !profileFormData.email) {
      setSuccessMessage("Name and email are required");
      return;
    }
    try {
      const formData = new FormData();
      Object.keys(profileFormData).forEach((key) => {
        if (profileFormData[key]) formData.append(key, profileFormData[key]);
      });
      if (profilePicture) formData.append("logo", profilePicture);

      await updateProfile(formData).unwrap();
      setSuccessMessage("Profile updated successfully");
    } catch (err) {
      setSuccessMessage(err?.data?.message || "Failed to update profile");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setSuccessMessage("New passwords don't match");
      return;
    }
    if (passwordStrength < 75) {
      setSuccessMessage("Password must be strong (include uppercase, number, and special character)");
      return;
    }
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }).unwrap();
      setSuccessMessage("Password changed successfully");
      setPasswordData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err) {
      setSuccessMessage(err?.data?.message || "Failed to change password");
    }
  };

  const handleProfilePictureUpload = async () => {
    if (!profilePicture) {
      setSuccessMessage("Please select a profile picture");
      return;
    }
    try {
      await uploadProfilePicture(profilePicture).unwrap();
      setSuccessMessage("Profile picture uploaded successfully");
      setProfilePicture(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setSuccessMessage(err?.data?.message || "Failed to upload profile picture");
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength < 50) return "bg-red-500";
    if (passwordStrength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const renderContent = () => {
    let content;
    switch (activeSection) {
      case "dashboard":
        content = <DashboardOverview />;
        break;
      case "profile":
        content = (
          <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Profile Management
                </h2>
                <p className="text-gray-600 mt-2">Manage your personal information and account settings</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl mb-6 border-l-4 ${successMessage.includes("successfully")
                  ? "bg-green-50 text-green-800 border-green-500"
                  : "bg-red-50 text-red-800 border-red-500"
                  }`}
              >
                <div className="flex items-center">
                  {successMessage.includes("successfully") ? (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  ) : (
                    <XCircle className="w-5 h-5 mr-2" />
                  )}
                  {successMessage}
                </div>
              </motion.div>
            )}

            {profileLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : profileError ? (
              <div className="text-center py-12">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 text-lg">Error loading profile</p>
                <p className="text-gray-600 mt-2">{profileError?.data?.message}</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Profile Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/60 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <User className="w-5 h-5 mr-2 text-indigo-600" />
                    Personal Information
                  </h3>
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {[
                        { label: "Full Name", name: "name", type: "text", icon: User, required: true },
                        { label: "Email Address", name: "email", type: "email", icon: Mail, required: true },
                        { label: "Phone Number", name: "phone", type: "tel", icon: Phone, required: false },
                        { label: "Address", name: "address", type: "text", icon: MapPin, required: false },
                      ].map((field) => (
                        <div key={field.name} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
                            <field.icon className="w-4 h-4 text-gray-500" />
                            <span>{field.label}{field.required && " *"}</span>
                          </label>
                          <input
                            type={field.type}
                            name={field.name}
                            value={profileFormData[field.name]}
                            onChange={handleProfileInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm"
                            placeholder={`Enter your ${field.label.toLowerCase()}`}
                            required={field.required}
                            aria-required={field.required}
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      type="submit"
                      disabled={updateProfileLoading}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      {updateProfileLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </div>
                      ) : (
                        "Update Profile"
                      )}
                    </button>
                    {updateProfileError && (
                      <p className="text-red-600 text-sm mt-2">{updateProfileError?.data?.message || "Failed to update profile"}</p>
                    )}
                  </form>
                </motion.div>

                {/* Profile Picture */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/60 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Camera className="w-5 h-5 mr-2 text-indigo-600" />
                    Profile Picture
                  </h3>
                  <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
                    <div className="relative">
                      {profilePicturePreview ? (
                        <div className="relative">
                          <img
                            src={profilePicturePreview}
                            alt="Profile picture preview"
                            className="w-32 h-32 rounded-2xl object-cover shadow-xl border-4 border-white"
                          />
                          <button
                            onClick={removeProfilePicture}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 transition-all duration-300 shadow-lg"
                            aria-label="Remove profile picture"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                          {profileFormData.name ? profileFormData.name[0].toUpperCase() : "A"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          className="hidden"
                          id="profile-picture-upload"
                        />
                        <label
                          htmlFor="profile-picture-upload"
                          className="inline-flex items-center px-6 py-3 bg-white border-2 border-dashed border-indigo-300 text-indigo-700 rounded-xl hover:bg-indigo-50 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                          <Camera className="w-5 h-5 mr-2" />
                          Choose New Picture
                        </label>
                        <p className="text-sm text-gray-600">JPG, PNG, WEBP up to 10MB</p>
                      </div>
                      <button
                        onClick={handleProfilePictureUpload}
                        disabled={uploadPictureLoading || !profilePicture}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        {uploadPictureLoading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Uploading...
                          </div>
                        ) : (
                          "Upload Picture"
                        )}
                      </button>
                      {uploadPictureError && (
                        <p className="text-red-600 text-sm">{uploadPictureError?.data?.message || "Failed to upload picture"}</p>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Change Password */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/60 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Lock className="w-5 h-5 mr-2 text-indigo-600" />
                    Change Password
                  </h3>
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {[
                        { label: "Current Password", name: "currentPassword" },
                        { label: "New Password", name: "newPassword" },
                        { label: "Confirm New Password", name: "confirmNewPassword" },
                      ].map((field) => (
                        <div key={field.name} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
                            <Lock className="w-4 h-4 text-gray-500" />
                            <span>{field.label} *</span>
                          </label>
                          <input
                            type="password"
                            name={field.name}
                            value={passwordData[field.name]}
                            onChange={handlePasswordInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm"
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            required
                            aria-required="true"
                          />
                          {field.name === "newPassword" && passwordData.newPassword && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="space-y-2 pt-2"
                            >
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Password strength</span>
                                <span
                                  className={`font-medium ${passwordStrength < 50
                                    ? "text-red-500"
                                    : passwordStrength < 75
                                      ? "text-yellow-500"
                                      : "text-green-500"
                                    }`}
                                >
                                  {passwordStrength < 50 ? "Weak" : passwordStrength < 75 ? "Good" : "Strong"}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-500 ${getStrengthColor()}`}
                                  style={{ width: `${passwordStrength}%` }}
                                ></div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                {[
                                  { text: "8+ characters", check: passwordData.newPassword.length >= 8 },
                                  { text: "Uppercase letter", check: /[A-Z]/.test(passwordData.newPassword) },
                                  { text: "Number", check: /[0-9]/.test(passwordData.newPassword) },
                                  { text: "Special character", check: /[^A-Za-z0-9]/.test(passwordData.newPassword) },
                                ].map((req, i) => (
                                  <div key={i} className="flex items-center space-x-2">
                                    {req.check ? (
                                      <CheckCircle className="w-3 h-3 text-green-500" />
                                    ) : (
                                      <div className="w-3 h-3 rounded-full border border-gray-400" />
                                    )}
                                    <span className={req.check ? "text-green-600 font-medium" : ""}>{req.text}</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="submit"
                      disabled={changePasswordLoading}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      {changePasswordLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Changing...
                        </div>
                      ) : (
                        "Change Password"
                      )}
                    </button>
                    {changePasswordError && (
                      <p className="text-red-600 text-sm mt-2">{changePasswordError?.data?.message || "Failed to change password"}</p>
                    )}
                  </form>
                </motion.div>
              </div>
            )}
          </div>
        );
        break;
      case "users":
        content = <UserManagement />;
        break;
      case "sellers":
        content = <SellerManagement />;
        break;
      case "leads":
        content = <LeadsManagement />;
        break;

      case "accounts":
        content = <AccountsManagement />;
        break;
      case "products":
        content = <ProductControl />;
        break;
      case "categories":
        content = <AdminCategoriesPage />;
        break;
      case "inventory":
        content = <AdminInventory />;
        break;
      case "orders":
        content = <OrderTracking />;
        break;
      case "analytics":
        content = <AnalyticsDashboard />;
        break;
      case "banners":
        content = <AdminBannerManagement />;
        break;
      default:
        content = <DashboardOverview />;
    }
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        {content}
      </ProtectedRoute>
    );
  };

  return (
    <>
      <Head>
        <title>Admin Dashboard - MOH Capital</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-sans">
        {/* Mobile sidebar backdrop */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            ></motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar - Fixed for desktop, collapsible for mobile */}
        <motion.aside
          initial={false}
          animate={{
            x: sidebarOpen ? 0 : "-100%",
            transition: { type: "spring", damping: 30, stiffness: 300 }
          }}
          className={`
            fixed lg:relative inset-y-0 left-0 z-50 w-80 transform
            bg-white border-r border-gray-200/60 flex flex-col shadow-2xl lg:shadow-sm
            lg:translate-x-0 backdrop-blur-lg bg-white/95
          `}
          style={{
            position: 'fixed',
            left: '0',
            transform: 'none'
          }}
        >
          {/* Branding */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/60 bg-gradient-to-r from-indigo-600 to-purple-600">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">MOH Capital Admin</h2>
                <p className="text-indigo-100 text-sm">Control Center</p>
              </div>
            </div>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Menu */}
          <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-gray-100">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    flex items-center w-full px-4 py-4 rounded-2xl transition-all duration-300 text-left group relative overflow-hidden
                    ${activeSection === item.id
                      ? 'bg-gradient-to-r shadow-lg text-white'
                      : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 backdrop-blur-sm'
                    }
                    ${activeSection === item.id ? item.color : ''}
                  `}
                  aria-current={activeSection === item.id ? "page" : undefined}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 transition-all duration-300 ${activeSection === item.id
                    ? 'bg-white/20 backdrop-blur-sm'
                    : 'bg-gray-100 group-hover:bg-white'
                    }`}>
                    <span className={activeSection === item.id ? 'text-white' : 'text-gray-600 group-hover:text-indigo-600'}>
                      {icons[item.icon]}
                    </span>
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>

                  {activeSection === item.id && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-4 w-2 h-2 bg-white rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </nav>
          </div>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-gray-200/60 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
              {profilePicturePreview ? (
                <img
                  src={profilePicturePreview}
                  alt="Profile picture"
                  className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                  {profileFormData.name ? profileFormData.name[0].toUpperCase() : "A"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{profileFormData.name || "Administrator"}</p>
                <p className="text-xs text-gray-600 truncate">Super Admin</p>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden flex flex-col w-full min-h-screen lg:ml-0">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 py-4 px-4 sm:px-6 flex items-center justify-between flex-wrap gap-4 sticky top-0 z-30">
            <div className="flex items-center w-full sm:w-auto max-w-3xl flex-1">
              <button
                className="lg:hidden p-2 mr-3 rounded-xl hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div className="relative flex-1 max-w-2xl">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search dashboard..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* User menu */}
              <div className="relative user-dropdown">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-expanded={userDropdownOpen}
                  aria-label="Toggle user menu"
                >
                  {profilePicturePreview ? (
                    <img
                      src={profilePicturePreview}
                      alt="Profile picture"
                      className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                      {profileFormData.name ? profileFormData.name[0].toUpperCase() : "A"}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-900">{profileFormData.name || "Administrator"}</p>
                    <p className="text-xs text-gray-500">Super Admin</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                {/* User dropdown */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200/60 backdrop-blur-lg bg-white/95 z-40"
                    >
                      <div className="p-4 border-b border-gray-200/60">
                        <div className="flex items-center space-x-3">
                          {profilePicturePreview ? (
                            <img
                              src={profilePicturePreview}
                              alt="Profile picture"
                              className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                              {profileFormData.name ? profileFormData.name[0].toUpperCase() : "A"}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{profileFormData.name || "Administrator"}</p>
                            <p className="text-xs text-gray-500 truncate">{profileFormData.email || "admin@bustard.com"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setActiveSection("profile");
                            setUserDropdownOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50/80 transition-colors"
                        >
                          <User className="w-4 h-4 mr-3 text-gray-500" />
                          Profile Settings
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50/80 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3 text-gray-500" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-transparent">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm min-h-[calc(100vh-120px)]"
            >
              <div className="p-6">
                {/* Page title */}
                <div className="mb-8">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent capitalize">
                        {activeSection.replace('-', ' ')}
                      </h1>
                      <p className="text-gray-600 text-sm sm:text-base mt-2 max-w-2xl">
                        {activeSection === 'dashboard'
                          ? 'Comprehensive overview of your platform statistics and performance metrics'
                          : activeSection === 'profile'
                            ? 'Manage your personal information, security settings, and account preferences'
                            : `Manage ${activeSection.replace('-', ' ')} configurations, settings, and operations`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-sm text-gray-500">Live</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                {renderContent()}
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        @media (min-width: 1024px) {
          aside {
            transform: translateX(0) !important;
            position: fixed !important;
            left: 0 !important;
          }
          main {
            margin-left: 320px !important;
          }
        }
      `}</style>
    </>
  );
}