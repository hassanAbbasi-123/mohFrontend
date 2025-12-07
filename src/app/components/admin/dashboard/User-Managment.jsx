'use client';
import { useState, useMemo } from "react";
import { 
  Search, 
  MoreHorizontal, 
  UserCheck, 
  UserX, 
  Mail,
  Calendar,
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useChangeUserStatusMutation
} from "@/store/features/userManagementApi";

// Custom CSS variables for consistent theming
const styles = {
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    danger: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    glass: 'rgba(255, 255, 255, 0.25)',
  },
  shadows: {
    sm: '0 2px 8px rgba(0,0,0,0.08)',
    md: '0 4px 16px rgba(0,0,0,0.12)',
    lg: '0 8px 32px rgba(0,0,0,0.15)',
  },
  animations: {
    hover: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    slide: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  }
};

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch users with role=user
  const { data: usersData, isLoading, refetch } = useGetUsersQuery({
    search: searchTerm,
    status: statusFilter,
    role: "user"
  });

  const [deleteUser] = useDeleteUserMutation();
  const [changeUserStatus] = useChangeUserStatusMutation();

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await deleteUser(id);
      refetch();
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    await changeUserStatus({ id, status: newStatus });
    refetch();
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const getStatusBadge = (status) => {
    const baseStyle = {
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600",
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.2)",
      transition: styles.animations.hover,
    };

    const variants = {
      active: { 
        ...baseStyle, 
        background: 'rgba(34, 197, 94, 0.15)',
        color: '#16a34a',
        borderColor: 'rgba(34, 197, 94, 0.3)'
      },
      suspended: { 
        ...baseStyle, 
        background: 'rgba(239, 68, 68, 0.15)',
        color: '#dc2626',
        borderColor: 'rgba(239, 68, 68, 0.3)'
      },
      pending: { 
        ...baseStyle, 
        background: 'rgba(245, 158, 11, 0.15)',
        color: '#d97706',
        borderColor: 'rgba(245, 158, 11, 0.3)'
      }
    };
    return variants[status] || variants.active;
  };

  // Calculate metrics dynamically from usersData
  const userMetrics = useMemo(() => {
    if (!usersData) return [];
    const totalUsers = usersData.length;
    const newRegistrations = usersData.filter(u => {
      const created = new Date(u.createdAt);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return created >= oneWeekAgo;
    }).length;
    const suspendedUsers = usersData.filter(u => !u.isActive).length;
    const pendingVerification = usersData.filter(u => u.status === "pending").length;

    const weekBefore = usersData.filter(u => {
      const created = new Date(u.createdAt);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return created >= twoWeeksAgo && created < oneWeekAgo;
    }).length;

    const newRegChange = weekBefore > 0 ? ((newRegistrations - weekBefore) / weekBefore * 100).toFixed(1) : 0;

    return [
      { 
        title: "Total Users", 
        value: totalUsers, 
        change: "+2.5%", 
        changeType: "positive", 
        icon: UserCheck, 
        description: "Active accounts",
        gradient: styles.gradients.primary
      },
      { 
        title: "New Registrations", 
        value: newRegistrations, 
        change: `${newRegChange > 0 ? '+' : ''}${newRegChange}%`, 
        changeType: newRegChange >= 0 ? "positive" : "negative", 
        icon: Calendar, 
        description: "This week",
        gradient: styles.gradients.success
      },
      { 
        title: "Suspended Users", 
        value: suspendedUsers, 
        change: "+0.5%", 
        changeType: "negative", 
        icon: UserX, 
        description: "Active suspensions",
        gradient: styles.gradients.danger
      },
      { 
        title: "Pending Verification", 
        value: pendingVerification, 
        change: "-1.2%", 
        changeType: "neutral", 
        icon: AlertTriangle, 
        description: "Email verification",
        gradient: styles.gradients.warning
      }
    ];
  }, [usersData]);

  // Pagination logic
  const paginatedUsers = useMemo(() => {
    if (!usersData) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return usersData.slice(startIndex, startIndex + itemsPerPage);
  }, [usersData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil((usersData?.length || 0) / itemsPerPage);
  const startResult = (currentPage - 1) * itemsPerPage + 1;
  const endResult = Math.min(currentPage * itemsPerPage, usersData?.length || 0);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }
      
      if (start > 2) pages.push('...');
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (end < totalPages - 1) pages.push('...');
      
      if (totalPages > 1) pages.push(totalPages);
    }
    
    return pages;
  };

  const MetricCard = ({ title, value, change, changeType, icon: Icon, description, gradient }) => (
    <div style={{
      background: styles.gradients.glass,
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '20px',
      padding: '20px',
      boxShadow: styles.shadows.sm,
      transition: styles.animations.hover,
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = styles.shadows.md;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = styles.shadows.sm;
    }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: gradient
      }} />
      
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <Icon size={20} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {changeType === "positive" && <TrendingUp size={16} color="#16a34a" />}
          {changeType === "negative" && <TrendingDown size={16} color="#dc2626" />}
          {changeType === "neutral" && <Minus size={16} color="#6b7280" />}
          <span style={{ 
            fontSize: "12px", 
            fontWeight: '600',
            color: changeType === "positive" ? "#16a34a" : changeType === "negative" ? "#dc2626" : "#6b7280" 
          }}>
            {change}
          </span>
        </div>
      </div>
      
      <p style={{ fontSize: "28px", fontWeight: "700", margin: '8px 0', background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {value}
      </p>
      <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: '4px' }}>{title}</h3>
      <p style={{ fontSize: "12px", color: "#6b7280" }}>{description}</p>
    </div>
  );

  const SkeletonLoader = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px',
          background: styles.gradients.glass,
          borderRadius: '12px',
          animation: 'pulse 2s infinite'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#e5e7eb',
            marginRight: '12px'
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: '12px', background: '#e5e7eb', borderRadius: '4px', marginBottom: '8px', width: '60%' }} />
            <div style={{ height: '10px', background: '#e5e7eb', borderRadius: '4px', width: '40%' }} />
          </div>
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div style={{
      textAlign: 'center',
      padding: '60px 20px',
      background: styles.gradients.glass,
      borderRadius: '20px',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.2)'
    }}>
      <div style={{
        width: '120px',
        height: '120px',
        background: 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)',
        borderRadius: '50%',
        margin: '0 auto 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '48px'
      }}>
        👥
      </div>
      <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>No users found</h3>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>Try adjusting your search or filter criteria</p>
      <button 
        onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
        style={{
          background: styles.gradients.primary,
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '10px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: styles.animations.hover
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        Reset Filters
      </button>
    </div>
  );

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      gap: "32px",
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '24px'
    }}>
      {/* Metrics Grid */}
      <div style={{ 
        display: "grid", 
        gap: "24px", 
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" 
      }}>
        {userMetrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* User Management Table */}
      <div style={{ 
        background: styles.gradients.glass,
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: "20px",
        boxShadow: styles.shadows.lg,
        overflow: 'hidden'
      }}>
        <div style={{ 
          padding: "24px", 
          borderBottom: "1px solid rgba(255,255,255,0.2)", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}>
          <div>
            <h2 style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              fontWeight: "700", 
              fontSize: "24px",
              background: styles.gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '4px'
            }}>
              <Shield size={24} /> User Management
            </h2>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>Manage user accounts, permissions, and access controls</p>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              background: styles.gradients.primary,
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: styles.animations.hover
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = styles.shadows.md;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Download size={16} />
            Export Report
          </button>
        </div>

        <div style={{ padding: "24px" }}>
          {/* Filters */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: 'wrap' }}>
            <div style={{ position: "relative", flex: "1", minWidth: '300px' }}>
              <Search size={16} style={{ 
                position: "absolute", 
                top: "50%", 
                left: "16px", 
                transform: "translateY(-50%)", 
                color: "#9ca3af",
                transition: styles.animations.hover
              }} />
              <input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  width: "100%", 
                  padding: "12px 12px 12px 44px", 
                  border: "1px solid rgba(255,255,255,0.3)", 
                  borderRadius: "12px",
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  fontSize: '14px',
                  transition: styles.animations.hover
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.previousSibling.style.color = '#667eea';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                  e.target.previousSibling.style.color = '#9ca3af';
                }}
              />
            </div>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ 
                padding: "12px 16px", 
                border: "1px solid rgba(255,255,255,0.3)", 
                borderRadius: "12px",
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                fontSize: '14px',
                minWidth: '160px'
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Users Table */}
          <div style={{ 
            border: "1px solid rgba(255,255,255,0.2)", 
            borderRadius: "16px", 
            overflow: "hidden",
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            {isLoading ? (
              <div style={{ padding: '24px' }}>
                <SkeletonLoader />
              </div>
            ) : (
              <>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: "rgba(255,255,255,0.15)", textAlign: "left" }}>
                    <tr>
                      <th style={{ padding: "16px", fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase" }}>User</th>
                      <th style={{ padding: "16px", fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase" }}>Status</th>
                      <th style={{ padding: "16px", fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase" }}>Join Date</th>
                      <th style={{ padding: "16px", fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase" }}>Last Login</th>
                      <th style={{ padding: "16px", fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase" }}>Orders</th>
                      <th style={{ padding: "16px", fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase" }}>Total Spent</th>
                      <th style={{ padding: "16px", fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers?.map((user, index) => (
                      <tr key={user._id} style={{ 
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        transition: styles.animations.hover,
                        animation: `${styles.animations.slide} ${index * 0.1}s ease-out`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                      >
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: styles.gradients.primary,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: '600'
                            }}>
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontWeight: "600" }}>{user.name}</p>
                              <p style={{ fontSize: "13px", color: "#6b7280" }}>{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <span style={getStatusBadge(user.isActive ? "active" : "suspended")}>
                            {user.isActive ? "Active" : "Suspended"}
                          </span>
                        </td>
                        <td style={{ padding: "16px", fontSize: "14px", color: "#374151" }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: "16px", fontSize: "14px", color: "#374151" }}>
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}
                        </td>
                        <td style={{ padding: "16px", fontSize: "14px", fontWeight: "600", color: "#374151" }}>{user.orders || 0}</td>
                        <td style={{ padding: "16px", fontWeight: "700", background: styles.gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user.totalSpent || "$0.00"}</td>
                        <td style={{ padding: "16px", display: "flex", gap: "8px", alignItems: 'center' }}>
                          <button 
                            onClick={() => handleStatusChange(user._id, user.isActive ? "active" : "suspended")} 
                            style={{ 
                              padding: "8px 16px", 
                              borderRadius: "8px", 
                              border: "1px solid rgba(255,255,255,0.3)", 
                              background: 'rgba(255,255,255,0.1)',
                              cursor: "pointer",
                              fontSize: '12px',
                              fontWeight: '600',
                              transition: styles.animations.hover
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = user.isActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)';
                              e.currentTarget.style.borderColor = user.isActive ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)';
                              e.currentTarget.style.color = user.isActive ? '#dc2626' : '#16a34a';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                              e.currentTarget.style.color = 'inherit';
                            }}
                          >
                            {user.isActive ? "Suspend" : "Activate"}
                          </button>
                          <button 
                            onClick={() => openUserModal(user)}
                            style={{ 
                              padding: "8px", 
                              borderRadius: "8px", 
                              border: "1px solid rgba(255,255,255,0.3)", 
                              background: 'rgba(255,255,255,0.1)',
                              cursor: "pointer",
                              transition: styles.animations.hover
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                              e.currentTarget.style.color = '#2563eb';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                              e.currentTarget.style.color = 'inherit';
                            }}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {!paginatedUsers?.length && (
                  <div style={{ padding: '40px' }}>
                    <EmptyState />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Enhanced Pagination */}
          {(usersData?.length || 0) > 0 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '24px',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Showing {startResult} to {endResult} of {usersData?.length || 0} results
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <select 
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    fontSize: '14px'
                  }}
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: '8px',
                      border: '1px solid rgba(255,255,255,0.3)',
                      background: currentPage === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      opacity: currentPage === 1 ? 0.5 : 1,
                      transition: styles.animations.hover
                    }}
                  >
                    <ChevronsLeft size={16} />
                  </button>
                  
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: '8px',
                      border: '1px solid rgba(255,255,255,0.3)',
                      background: currentPage === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      opacity: currentPage === 1 ? 0.5 : 1,
                      transition: styles.animations.hover
                    }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' && setCurrentPage(page)}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid rgba(255,255,255,0.3)',
                        background: currentPage === page ? styles.gradients.primary : 'rgba(255,255,255,0.1)',
                        color: currentPage === page ? 'white' : 'inherit',
                        borderRadius: '8px',
                        cursor: page === '...' ? 'default' : 'pointer',
                        fontWeight: currentPage === page ? '600' : 'normal',
                        minWidth: '40px',
                        transition: styles.animations.hover
                      }}
                      disabled={page === '...'}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '8px',
                      border: '1px solid rgba(255,255,255,0.3)',
                      background: currentPage === totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      transition: styles.animations.hover
                    }}
                  >
                    <ChevronRight size={16} />
                  </button>
                  
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '8px',
                      border: '1px solid rgba(255,255,255,0.3)',
                      background: currentPage === totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      transition: styles.animations.hover
                    }}
                  >
                    <ChevronsRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Analytics Modal */}
      {isModalOpen && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}
        onClick={closeModal}
        >
          <div style={{
            background: styles.gradients.glass,
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: styles.shadows.lg,
            animation: `${styles.animations.slide} 0.3s ease-out`
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', background: styles.gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                User Analytics
              </h3>
              <button 
                onClick={closeModal}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  transition: styles.animations.hover
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                ✕
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Orders</p>
                <p style={{ fontSize: '24px', fontWeight: '700' }}>{selectedUser.orders || 0}</p>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Spent</p>
                <p style={{ fontSize: '24px', fontWeight: '700', background: styles.gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {selectedUser.totalSpent || '$0.00'}
                </p>
              </div>
            </div>
            
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.2)',
              marginBottom: '24px'
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>User Information</h4>
              <div style={{ display: 'grid', gap: '8px' }}>
                <p><strong>Name:</strong> {selectedUser.name}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Join Date:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                <p><strong>Last Login:</strong> {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}</p>
                <p><strong>Status:</strong> <span style={getStatusBadge(selectedUser.isActive ? "active" : "suspended")}>
                  {selectedUser.isActive ? "Active" : "Suspended"}
                </span></p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleStatusChange(selectedUser._id, selectedUser.isActive ? "active" : "suspended")}
                style={{
                  padding: '10px 20px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: styles.animations.hover
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = selectedUser.isActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)';
                  e.currentTarget.style.borderColor = selectedUser.isActive ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)';
                  e.currentTarget.style.color = selectedUser.isActive ? '#dc2626' : '#16a34a';
                }}
              >
                {selectedUser.isActive ? "Suspend User" : "Activate User"}
              </button>
              <button
                onClick={() => {
                  handleDelete(selectedUser._id);
                  closeModal();
                }}
                style={{
                  padding: '10px 20px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#dc2626',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: styles.animations.hover
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                }}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}