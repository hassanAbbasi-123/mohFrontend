'use client';
import { useState, useEffect } from "react";
import {
  Shield,
  CheckCircle,
  XCircle,
  Users,
  DollarSign,
  Box,
  Clock,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Star,
  Package,
  AlertCircle,
  Zap,
  Crown,
  Target,
  FileText,
  ChevronDown,
  ChevronUp,
  MapPin,
  Building,
  FileCheck,
  BadgeCheck,
  Calendar,
  Store,
  User,
  Mail,
  Phone,
  Globe,
  IdCard,
  Briefcase,
  Home,
  Map,
  Pin,
  FileText as FileTextIcon,
} from "lucide-react";
import {
  useGetSellersQuery,
  useApproveOrDisapproveSellerMutation,
  useGetSellerPerformanceQuery,
} from "@/store/features/sellerManagementApi";

export default function SellerManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // ── FETCH SELLERS ───────────────────────────────────────
  const {
    data: sellersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetSellersQuery(
    {
      search: searchTerm,
      status: statusFilter === "all" ? undefined : statusFilter,
      page: currentPage,
      limit: itemsPerPage,
    },
    {
      skip: !currentPage || !itemsPerPage,
    }
  );

  const [approveOrDisapproveSeller] = useApproveOrDisapproveSellerMutation();

  // ── ACTION HANDLER ───────────────────────────────────────
  const handleAction = async (sellerId, action) => {
    if (!confirm(`Are you sure you want to ${action} this seller?`)) return;
    try {
      await approveOrDisapproveSeller({ sellerId, action }).unwrap();
      refetch();
    } catch (e) {
      alert(e?.data?.message || "Action failed");
    }
  };

  // ── TOGGLE EXPAND ───────────────────────────────────────
  const toggleExpand = (sellerId) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(sellerId)) {
      newSet.delete(sellerId);
    } else {
      newSet.add(sellerId);
    }
    setExpandedRows(newSet);
  };

  // ── RESET PAGE ON FILTER CHANGE ───────────────────────
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

  // ── SAFE DATA ACCESS ───────────────────────────────────
  const sellers = sellersData?.sellers || [];
  const totalCount = sellersData?.totalCount || 0;
  const activeCount = sellersData?.activeCount || 0;
  const pendingCount = sellersData?.pendingCount || 0;
  const rejectedCount = sellersData?.rejectedCount || 0;

  // ── PAGINATION ───────────────────────────────────────
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  // ── FILE URL HELPER ───────────────────────────────────
  const getFileUrl = (path) => {
    if (!path) return "/placeholder-logo.png";
    if (path.startsWith("http")) return path;
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const clean = path.replace(/\\/g, "/").replace(/^\/+/, "");
    return `${base.replace(/\/+$/, "")}/${clean}`;
  };
  const getFileName = (path) => (path ? path.split(/[/\\]/).pop() : "");

  // ── SAFE ERROR MESSAGE ─────────────────────────────────
  const getErrorMessage = () => {
    if (!error) return "Unknown error occurred. Check console.";
    if (error?.data?.message) return error.data.message;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    if (typeof error === "string") return error;
    return "Failed to connect to server. Please try again.";
  };

  // ── RENDER ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500/10 rounded-xl">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
            Seller Management
          </h1>
        </div>
        <p className="text-gray-600 text-sm sm:text-base">
          Manage and monitor seller accounts and performance
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <MetricCard title="Total Sellers" value={totalCount} icon={Users} color="blue" />
        <MetricCard title="Active Sellers" value={activeCount} icon={Zap} color="green" />
        <MetricCard title="Pending Approval" value={pendingCount} icon={AlertCircle} color="orange" />
        <MetricCard title="Rejected" value={rejectedCount} icon={XCircle} color="red" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <div
              className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-200 ${
                isSearchFocused ? "text-blue-500" : "text-gray-400"
              }`}
            >
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search sellers by store name, owner, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="pl-10 pr-4 py-3 w-full bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 outline-none text-sm sm:text-base"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Filter className="h-4 w-4" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 outline-none appearance-none text-sm sm:text-base"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 outline-none text-sm sm:text-base"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {isError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm space-y-2">
          <p className="font-semibold">Failed to load sellers</p>
          <p>{getErrorMessage()}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-4 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-gray-600 text-sm sm:text-base">Loading sellers...</span>
            </div>
          </div>
        ) : sellers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No sellers found</p>
            <p className="text-sm">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Store Info
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Owner Details
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Joined Date
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Documents
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {sellers.map((seller, idx) => {
                    const isExpanded = expandedRows.has(seller._id);
                    return (
                      <>
                        {/* Main Row */}
                        <tr
                          key={seller._id}
                          className="hover:bg-gray-50/50 transition-colors duration-150 group cursor-pointer"
                          onClick={() => toggleExpand(seller._id)}
                        >
                          {/* Store Info */}
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-3">
                              {seller.seller?.logo ? (
                                <img
                                  src={getFileUrl(seller.seller.logo)}
                                  alt={seller.seller.storeName}
                                  className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                                  onError={(e) => (e.target.src = "/placeholder-logo.png")}
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-gray-600 text-lg font-medium">
                                  {seller.seller?.storeName?.[0] ?? "S"}
                                </div>
                              )}
                              <div>
                                <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
                                  {seller.seller?.storeName || "Unnamed Store"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {seller._id.slice(-8)}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Owner */}
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900 text-sm sm:text-base">{seller.name}</div>
                            <div className="text-xs text-gray-500">{seller.email}</div>
                          </td>

                          {/* Status */}
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                seller.seller?.kycStatus === "approved"
                                  ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                                  : seller.seller?.kycStatus === "rejected"
                                  ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                                  : "bg-orange-50 text-orange-700 ring-1 ring-orange-200"
                              }`}
                            >
                              {seller.seller?.kycStatus === "approved" ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approved
                                </>
                              ) : seller.seller?.kycStatus === "rejected" ? (
                                <>
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Rejected
                                </>
                              ) : (
                                <>
                                  <Clock className="w-4 h-4 mr-1" />
                                  Pending
                                </>
                              )}
                            </span>
                          </td>

                          {/* Joined */}
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {seller.createdAt
                              ? new Date(seller.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "-"}
                          </td>

                          {/* Documents Count */}
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {seller.seller?.documents?.length || 0} files
                          </td>

                          {/* Actions */}
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              {seller.seller?.kycStatus === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleAction(seller._id, "approve")}
                                    className="px-3 py-1.5 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleAction(seller._id, "reject")}
                                    className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => setSelectedSeller(seller)}
                                className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                              >
                                Performance
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Row */}
                        {isExpanded && (
                          <tr>
                            <td colSpan="6" className="px-4 sm:px-6 py-6 bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-200">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-sm">
                                {/* Left Column - Business & Identity */}
                                <div>
                                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Store className="w-5 h-5 text-blue-600" />
                                    Business Information
                                  </h4>
                                  <div className="space-y-3">
                                    <DetailRow icon={Building} label="Store Name" value={seller.seller?.storeName} />
                                    <DetailRow icon={FileTextIcon} label="Description" value={seller.seller?.storeDescription} multiline />
                                    <DetailRow icon={Briefcase} label="Business Type" value={seller.seller?.businessType} />
                                    <DetailRow icon={IdCard} label="GSTIN" value={seller.seller?.gstin} />
                                    <DetailRow icon={BadgeCheck} label="PAN" value={seller.seller?.pan} />
                                  </div>
                                </div>

                                {/* Right Column - Location */}
                                <div>
                                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                    Business Address
                                  </h4>
                                  <div className="space-y-3">
                                    <DetailRow icon={Home} label="Address" value={seller.seller?.address} multiline />
                                    <DetailRow icon={Map} label="City" value={seller.seller?.city} />
                                    <DetailRow icon={Globe} label="District" value={seller.seller?.district} />
                                    <DetailRow icon={Globe} label="State" value={seller.seller?.state} />
                                    <DetailRow icon={Pin} label="Pincode" value={seller.seller?.pincode} />
                                  </div>
                                </div>
                              </div>

                              {/* Documents Section */}
                              {seller.seller?.documents?.length > 0 && (
                                <div className="mt-8">
                                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileCheck className="w-5 h-5 text-blue-600" />
                                    Uploaded Documents
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {seller.seller.documents.map((doc, i) => {
                                      const url = typeof doc === "string" ? doc : doc.url;
                                      const type = typeof doc === "string" ? "Document" : (doc.type || "Unknown");
                                      return (
                                        <a
                                          key={i}
                                          href={getFileUrl(url)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all"
                                        >
                                          <FileTextIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{type}</p>
                                            <p className="text-xs text-gray-500 truncate">{getFileName(url)}</p>
                                          </div>
                                        </a>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Expand/Collapse Button */}
                              <div className="mt-6 text-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpand(seller._id);
                                  }}
                                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  Show Less
                                  <ChevronUp className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {sellers.length > 0 && (
              <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startItem}</span> to{" "}
                    <span className="font-medium">{endItem}</span> of{" "}
                    <span className="font-medium">{totalCount}</span> results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const n = i + 1;
                      return (
                        <button
                          key={n}
                          onClick={() => setCurrentPage(n)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                            currentPage === n ? "bg-blue-500 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {n}
                        </button>
                      );
                    })}

                    {totalPages > 5 && <span className="px-2 text-gray-500">...</span>}

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Performance Modal */}
      {selectedSeller && <SellerPerformanceModal seller={selectedSeller} onClose={() => setSelectedSeller(null)} />}
    </div>
  );
}

/* ────────────────────────────────────── COMPONENTS ────────────────────────────────────── */
function MetricCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: { bg: "bg-blue-50 border-blue-100", grad: "from-blue-500 to-blue-600" },
    green: { bg: "bg-green-50 border-green-100", grad: "from-green-500 to-green-600" },
    orange: { bg: "bg-orange-50 border-orange-100", grad: "from-orange-500 to-orange-600" },
    red: { bg: "bg-red-50 border-red-100", grad: "from-red-500 to-red-600" },
  };
  const c = colors[color];
  return (
    <div className={`p-4 sm:p-6 rounded-2xl border-2 ${c.bg} transition-all duration-300 hover:scale-105 hover:shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-r ${c.grad} shadow-sm`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, multiline = false }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="p-1.5 bg-blue-50 rounded-lg flex-shrink-0">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-600">{label}</p>
        {multiline ? (
          <p className="text-sm text-gray-900 mt-0.5">{value}</p>
        ) : (
          <p className="text-sm font-medium text-gray-900">{value}</p>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────── PERFORMANCE MODAL ────────────────────────────────────── */
function SellerPerformanceModal({ seller, onClose }) {
  const { data: metrics, isLoading } = useGetSellerPerformanceQuery(seller._id);

  const getFileUrl = (p) => {
    if (!p) return "/placeholder-logo.png";
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000";
    const clean = p.replace(/\\/g, "/").replace(/^\/+/, "");
    return `${base}/${clean}`;
  };
  const getFileName = (p) => (p ? p.split(/[/\\]/).pop() : "");

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {seller.seller?.logo ? (
                <img
                  src={getFileUrl(seller.seller.logo)}
                  alt={seller.seller.storeName}
                  className="w-12 h-12 rounded-2xl object-cover border border-white/30"
                  onError={(e) => (e.target.src = "/placeholder-logo.png")}
                />
              ) : (
                <div className="p-3 bg-white/20 rounded-2xl">
                  <TrendingUp className="w-8 h-8" />
                </div>
              )}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">{seller.seller?.storeName}</h2>
                <p className="text-blue-100 text-sm">Performance Analytics</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Metric title="Total Orders" value={metrics?.metrics.totalOrders ?? 0} icon={Package} description="All-time" />
                <Metric title="Revenue" value={`$${(metrics?.metrics.totalRevenue ?? 0).toLocaleString()}`} icon={DollarSign} description="Gross" />
                <Metric title="Commission" value={`$${(metrics?.metrics.totalCommission ?? 0).toLocaleString()}`} icon={CheckCircle} description="Platform fee" />
                <Metric title="Pending" value={metrics?.metrics.pendingDeliveries ?? 0} icon={Clock} description="In transit" />
                <Metric title="Completed" value={metrics?.metrics.completedOrders ?? 0} icon={CheckCircle} description="Delivered" />
                <Metric title="Cancelled" value={metrics?.metrics.cancelledOrders ?? 0} icon={XCircle} description="Returned" />
              </div>

              {/* Seller Details */}
              <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Store className="w-5 h-5 text-blue-600" />
                  Seller Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <DetailRow icon={Building} label="Store Name" value={seller.seller?.storeName} />
                    <DetailRow icon={Briefcase} label="Business Type" value={seller.seller?.businessType} />
                    <DetailRow icon={IdCard} label="GSTIN" value={seller.seller?.gstin} />
                    <DetailRow icon={BadgeCheck} label="PAN" value={seller.seller?.pan} />
                  </div>
                  <div className="space-y-3">
                    <DetailRow icon={Home} label="Address" value={seller.seller?.address} multiline />
                    <DetailRow icon={MapPin} label="City" value={seller.seller?.city} />
                    <DetailRow icon={Globe} label="State" value={seller.seller?.state} />
                    <DetailRow icon={Pin} label="Pincode" value={seller.seller?.pincode} />
                  </div>
                </div>
              </div>

              {/* Documents */}
              {seller.seller?.documents?.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Documents</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {seller.seller.documents.map((doc, i) => {
                      const url = typeof doc === "string" ? doc : doc.url;
                      const type = typeof doc === "string" ? "Document" : (doc.type || "File");
                      return (
                        <a
                          key={i}
                          href={getFileUrl(url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 bg-white rounded-lg border hover:border-blue-400 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{type}</p>
                            <p className="text-xs text-gray-500">{getFileName(url)}</p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 text-gray-700 hover:bg-white rounded-xl transition-colors">
            Close
          </button>
          <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors">
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
}

function Metric({ title, value, icon: Icon, description }) {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition-all hover:border-blue-200">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-50 rounded-xl">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}