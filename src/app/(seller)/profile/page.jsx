'use client';
import { useState, useEffect } from 'react';
import { useGetProfileQuery, useUpdateProfileMutation, useChangePasswordMutation, useUploadProfilePictureMutation } from '@/store/features/profileApi';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // RTK Query hooks
  const { data: profileData, isLoading, error, refetch } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [uploadProfilePicture] = useUploadProfilePictureMutation();

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    storeName: '',
    storeDescription: '',
    businessAddress: '',
  });

  // Initialize form data when profile data loads
  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.user?.name || '',
        email: profileData.user?.email || '',
        phone: profileData.user?.phone || '',
        address: profileData.user?.address || '',
        storeName: profileData.sellerProfile?.storeName || '',
        storeDescription: profileData.sellerProfile?.storeDescription || '',
        businessAddress: profileData.sellerProfile?.businessAddress || '',
      });
    }
  }, [profileData]);

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleSave = async () => {
    try {
      const updateData = { ...formData };
      delete updateData.email;
      await updateProfile(updateData).unwrap();
      showMessage('success', 'Profile updated successfully!');
      setIsEditing(false);
      refetch();
    } catch (error) {
      showMessage('error', error.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }).unwrap();
      
      showMessage('success', 'Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      showMessage('error', error.data?.message || 'Failed to update password');
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'Image size must be less than 5MB');
      return;
    }

    try {
      await uploadProfilePicture(file).unwrap();
      showMessage('success', 'Profile picture updated successfully!');
      refetch();
    } catch (error) {
      showMessage('error', error.data?.message || 'Failed to upload profile picture');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-100/50 border border-white/20">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-lg font-semibold text-slate-700">Loading your profile...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-red-100/50 border border-white/20 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Failed to Load Profile</h3>
            <p className="text-slate-600 mb-6">{error.data?.message || 'Please check your connection and try again'}</p>
            <button 
              onClick={refetch}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const user = profileData?.user;
  const sellerProfile = profileData?.sellerProfile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Message Alert */}
        {message.text && (
          <div className={`relative mb-8 p-6 rounded-2xl backdrop-blur-xl border-l-4 ${
            message.type === 'success' 
              ? 'bg-emerald-50/80 border-emerald-400 text-emerald-800' 
              : 'bg-red-50/80 border-red-400 text-red-800'
          } shadow-lg animate-fade-in`}>
            <div className="flex items-center">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
              }`}>
                {message.type === 'success' ? (
                  <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-4 flex-1">
                <p className="font-medium">{message.text}</p>
              </div>
              <button 
                onClick={() => setMessage({ type: '', text: '' })}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-6 lg:mb-0">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 to-blue-900 bg-clip-text text-transparent mb-3">
              Profile Management
            </h1>
            <p className="text-lg text-slate-600 font-light">Manage your personal and business information with ease</p>
          </div>
          <button 
            onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
            disabled={isUpdating}
            className={`group relative overflow-hidden px-8 py-4 rounded-2xl font-semibold shadow-2xl transition-all duration-300 transform hover:scale-105 ${
              isEditing 
                ? 'bg-white text-blue-600 border-2 border-blue-200 hover:border-blue-300' 
                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="relative z-10 flex items-center space-x-2">
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Saving Changes...</span>
                </>
              ) : isEditing ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Cancel Editing</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Profile</span>
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Enhanced Profile Overview Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-100/50 border border-white/20 mb-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            <div className="relative group">
              <div className="relative w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 shadow-lg overflow-hidden">
                {sellerProfile?.logo ? (
                  <img 
                    src={sellerProfile.logo} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center text-3xl font-bold bg-gradient-to-br from-blue-100 to-indigo-100 ${
                  sellerProfile?.logo ? 'hidden' : 'flex'
                }`}>
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </div>
              </div>
              {isEditing && (
                <label className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg shadow-blue-500/50 flex items-center justify-center cursor-pointer transform transition-transform duration-300 hover:scale-110 group">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">{user?.name}</h2>
              {sellerProfile && (
                <>
                  <p className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                    {sellerProfile.storeName}
                  </p>
                  <p className="text-slate-600 mb-4 max-w-2xl">{sellerProfile.storeDescription}</p>
                </>
              )}
              
              <div className="flex flex-col sm:flex-row items-center gap-6 text-slate-600 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="font-medium">{user?.email}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <span className="font-medium">{user.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center lg:text-right">
              {sellerProfile?.isVerified && (
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full shadow-lg shadow-emerald-500/25 mb-4">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">Verified Seller</span>
                </div>
              )}
              <p className="text-sm text-slate-500">
                Member since {new Date(user?.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            { id: 'personal', label: 'Personal Information', icon: '👤' },
            ...(user?.role === 'seller' ? [{ id: 'business', label: 'Business Details', icon: '🏢' }] : []),
            { id: 'security', label: 'Security', icon: '🔒' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative flex items-center space-x-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl shadow-blue-500/25'
                  : 'bg-white/80 text-slate-700 shadow-lg shadow-blue-100/50 hover:shadow-xl hover:shadow-blue-200/50'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
              <div className={`absolute inset-0 rounded-2xl border-2 ${
                activeTab === tab.id ? 'border-blue-500/20' : 'border-transparent group-hover:border-blue-200'
              } transition-colors duration-300`}></div>
            </button>
          ))}
        </div>

        {/* Enhanced Personal Information Tab */}
        {activeTab === 'personal' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-100/50 border border-white/20">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Personal Information</h3>
                <p className="text-slate-600">Update your personal details and contact information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Full Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 transition-all duration-300 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled={true}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                    placeholder="Your email address"
                  />
                  <p className="text-xs text-slate-500 mt-2">Email cannot be changed once registered</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Phone Number</label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 transition-all duration-300 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Address</label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 transition-all duration-300 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                    placeholder="Enter your address"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end pt-6 border-t border-slate-200/50">
                <button 
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-semibold shadow-2xl shadow-blue-500/25 hover:shadow-3xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    {isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Save Personal Information</span>
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Business Details Tab */}
        {activeTab === 'business' && user?.role === 'seller' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-100/50 border border-white/20">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🏢</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Business Details</h3>
                <p className="text-slate-600">Manage your business information and store details</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Business Name</label>
                  <input
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white/50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200/50 transition-all duration-300 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                    placeholder="Your business name"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Business Address</label>
                  <input
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white/50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200/50 transition-all duration-300 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                    placeholder="Business location"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Business Description</label>
                <textarea
                  name="storeDescription"
                  value={formData.storeDescription}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white/50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200/50 transition-all duration-300 outline-none resize-none disabled:bg-slate-100 disabled:text-slate-500"
                  placeholder="Describe your business and services..."
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end pt-6 border-t border-slate-200/50">
                <button 
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl font-semibold shadow-2xl shadow-indigo-500/25 hover:shadow-3xl hover:shadow-indigo-500/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    {isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Save Business Details</span>
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-100/50 border border-white/20">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Security Settings</h3>
                <p className="text-slate-600">Update your password and secure your account</p>
              </div>
            </div>

            <div className="max-w-2xl space-y-8">
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Current Password</label>
                <div className="relative">
                  <input 
                    name="currentPassword"
                    type="password" 
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white/50 focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 transition-all duration-300 outline-none pr-12"
                    placeholder="Enter current password"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">New Password</label>
                  <div className="relative">
                    <input 
                      name="newPassword"
                      type="password" 
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white/50 focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 transition-all duration-300 outline-none pr-12"
                      placeholder="Create new password"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Confirm Password</label>
                  <div className="relative">
                    <input 
                      name="confirmPassword"
                      type="password" 
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white/50 focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 transition-all duration-300 outline-none pr-12"
                      placeholder="Confirm new password"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-200">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-800">Password Requirements</p>
                    <ul className="text-xs text-amber-700 mt-1 space-y-1">
                      <li>• Minimum 6 characters long</li>
                      <li>• Include uppercase and lowercase letters</li>
                      <li>• Consider using numbers and special characters</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button 
                onClick={handlePasswordUpdate}
                disabled={isChangingPassword}
                className="group relative px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-2xl font-semibold shadow-2xl shadow-amber-500/25 hover:shadow-3xl hover:shadow-amber-500/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  {isChangingPassword ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Update Password</span>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;