"use client"

import { useState, useEffect, useRef } from "react"
import { User, Shield, Star, Edit, Plus, Trash2, Key, Lock } from "lucide-react"

import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useUploadProfilePictureMutation
} from "@/store/features/profileApi"

// Settings icon component
const Settings = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export default function ProfilePage() {
  const { data, error, isLoading, refetch } = useGetProfileQuery()
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation()
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation()
  const [uploadProfilePicture, { isLoading: isUploadingPicture }] = useUploadProfilePictureMutation()

  const [activeTab, setActiveTab] = useState("personal")

  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    phone: "",
    cnic: "",
    address: ""
  })

  const [sellerInfo, setSellerInfo] = useState({
    storeName: "",
    storeDescription: "",
    businessAddress: "",
    logoFile: null,
    documents: []
  })

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const [avatarFile, setAvatarFile] = useState(null)
  const avatarInputRef = useRef(null)

  useEffect(() => {
    if (data) {
      const user = data.user || {}
      setPersonalInfo(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        cnic: user.cnic || ""
      }))

      if (data.sellerProfile) {
        setSellerInfo(prev => ({
          ...prev,
          storeName: data.sellerProfile.storeName || "",
          storeDescription: data.sellerProfile.storeDescription || "",
          businessAddress: data.sellerProfile.businessAddress || ""
        }))
      }
    }
  }, [data])

  const showSuccess = (msg) => alert(msg)
  const showError = (msg) => alert("Error: " + msg)

  const handleSaveProfile = async () => {
    try {
      const payload = {
        name: personalInfo.name,
        phone: personalInfo.phone,
        address: personalInfo.address,
        cnic: personalInfo.cnic,
        storeName: sellerInfo.storeName,
        storeDescription: sellerInfo.storeDescription,
        businessAddress: sellerInfo.businessAddress
      }

      if (sellerInfo.logoFile) payload.logo = sellerInfo.logoFile
      if (sellerInfo.documents && sellerInfo.documents.length) payload.documents = sellerInfo.documents

      const res = await updateProfile(payload).unwrap()
      showSuccess(res?.message || "Profile updated")
      refetch()
    } catch (err) {
      console.error("updateProfile error:", err)
      showError(err?.data?.message || err?.message || "Failed to update profile")
    }
  }

  const handleUploadAvatar = async () => {
    if (!avatarFile) return showError("Please select an image first")
    try {
      const res = await uploadProfilePicture(avatarFile).unwrap()
      showSuccess(res?.message || "Avatar uploaded")
      setAvatarFile(null)
      if (avatarInputRef.current) avatarInputRef.current.value = ""
      refetch()
    } catch (err) {
      console.error("uploadProfilePicture error:", err)
      showError(err?.data?.message || err?.message || "Failed to upload picture")
    }
  }

  const handleChangePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) return showError("Please fill both current and new password")
    if (passwords.newPassword !== passwords.confirmPassword) return showError("New password and confirmation do not match")
    try {
      const res = await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      }).unwrap()
      showSuccess(res?.message || "Password changed")
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err) {
      console.error("changePassword error:", err)
      showError(err?.data?.message || err?.message || "Failed to change password")
    }
  }

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0] || null
    setSellerInfo(prev => ({ ...prev, logoFile: file }))
  }

  const handleDocumentsChange = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    setSellerInfo(prev => ({ ...prev, documents: files }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0] || null
    setAvatarFile(file)
  }

  const userData = {
    name: data?.user?.name || personalInfo.name || "John Doe",
    email: data?.user?.email || personalInfo.email || "john.doe@email.com",
    phone: data?.user?.phone || personalInfo.phone || "+1 (555) 123-4567",
    avatar: data?.user?.avatar || "",
    memberSince: data?.user?.createdAt || new Date(),
    totalOrders: 12,
    totalSpent: 2847.50,
    loyaltyPoints: 2847
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
            {userData.name.split(' ').map(n => n?.[0] || "").join('')}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-blue-900">{userData.name}</h1>
            <p className="text-blue-600">Member since {userData.memberSince ? new Date(userData.memberSince).toLocaleDateString() : "—"}</p>
            <span className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-800 text-white px-3 py-1 rounded-full text-sm font-medium mt-2">
              <Star size={14} className="mr-1" />
              VIP Customer
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-700 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer">
              <Edit size={16} />
              <span>Choose Avatar</span>
              <input ref={avatarInputRef} onChange={handleAvatarChange} type="file" accept="image/*" className="sr-only" />
            </label>
            <button
              onClick={handleUploadAvatar}
              disabled={isUploadingPicture || !avatarFile}
              className="flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-700 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-60"
            >
              Upload Avatar
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center border border-blue-100 shadow-sm">
            <div className="text-2xl font-bold text-blue-900">{userData.totalOrders}</div>
            <div className="text-sm text-blue-600">Total Orders</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-blue-100 shadow-sm">
            <div className="text-2xl font-bold text-blue-900">${userData.totalSpent.toFixed(2)}</div>
            <div className="text-sm text-blue-600">Total Spent</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-blue-100 shadow-sm">
            <div className="text-2xl font-bold text-orange-600">{userData.loyaltyPoints}</div>
            <div className="text-sm text-blue-600">Loyalty Points</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-blue-100 shadow-sm">
            <div className="text-2xl font-bold text-green-600">4.8</div>
            <div className="text-sm text-blue-600">Avg. Rating</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 border-b border-blue-100">
            {[{ id: "personal", label: "Personal Info", icon: User }, { id: "settings", label: "Settings", icon: Settings }].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center justify-center gap-2 py-4 font-medium transition-colors ${activeTab === id
                  ? "text-blue-700 border-b-2 border-blue-700"
                  : "text-blue-600 hover:text-blue-700"
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {isLoading && <p className="text-blue-600">Loading profile...</p>}
            {error && <p className="text-red-600">Failed to load profile. Try refreshing the page.</p>}

            {/* Personal Info */}
            {activeTab === "personal" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
                  <User size={24} /> Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={personalInfo.name}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={personalInfo.email}
                      readOnly
                      className="w-full px-4 py-3 border border-blue-100 bg-blue-50 rounded-xl"
                    />
                    <p className="text-xs text-blue-500 mt-1">Email cannot be changed here.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">Phone Number</label>
                    <input
                      type="text"
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">CNIC</label>
                    <input
                      type="text"
                      value={personalInfo.cnic || ""}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, cnic: e.target.value })}
                      placeholder="xxxxx-xxxxxxx-x"
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={personalInfo.address || ""}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                    className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {data?.sellerProfile && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <h4 className="font-semibold text-blue-900 mb-3">Seller / Store Info</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-2">Store Name</label>
                        <input
                          type="text"
                          value={sellerInfo.storeName}
                          onChange={(e) => setSellerInfo({ ...sellerInfo, storeName: e.target.value })}
                          className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-2">Business Address</label>
                        <input
                          type="text"
                          value={sellerInfo.businessAddress}
                          onChange={(e) => setSellerInfo({ ...sellerInfo, businessAddress: e.target.value })}
                          className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-blue-700 mb-2">Store Description</label>
                        <textarea
                          rows="3"
                          value={sellerInfo.storeDescription}
                          onChange={(e) => setSellerInfo({ ...sellerInfo, storeDescription: e.target.value })}
                          className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-2">Store Logo</label>
                        <input type="file" onChange={handleLogoChange} accept="image/*" className="w-full" />
                        {sellerInfo.logoFile && <p className="text-xs mt-1 text-blue-600">Selected: {sellerInfo.logoFile.name}</p>}
                        <p className="text-xs mt-1 text-blue-500">Uploading a new logo will replace the existing one.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-2">Business Documents</label>
                        <input type="file" onChange={handleDocumentsChange} multiple className="w-full" />
                        {sellerInfo.documents.length > 0 && (
                          <div className="text-xs mt-1 text-blue-600">
                            {sellerInfo.documents.map((f, i) => <div key={i}>{f.name}</div>)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isUpdating}
                    className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-60"
                  >
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => refetch()}
                    className="px-4 py-3 rounded-xl border border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            )}

            {/* Settings */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-xl font-semibold text-blue-900 flex items-center gap-2 mb-4">
                    <Shield size={24} /> Security
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="password"
                        placeholder="Current password"
                        value={passwords.currentPassword}
                        onChange={(e) => setPasswords(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="col-span-1 md:col-span-1 px-4 py-3 border border-blue-200 rounded-xl w-full"
                      />
                      <input
                        type="password"
                        placeholder="New password"
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="col-span-1 md:col-span-1 px-4 py-3 border border-blue-200 rounded-xl w-full"
                      />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="col-span-1 md:col-span-1 px-4 py-3 border border-blue-200 rounded-xl w-full"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleChangePassword}
                        disabled={isChangingPassword}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-blue-200 text-blue-700 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-60"
                      >
                        <Key size={18} />
                        {isChangingPassword ? "Updating..." : "Change Password"}
                      </button>
                      
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
