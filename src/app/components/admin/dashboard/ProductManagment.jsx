"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Trash2,
  TicketPercent,
  Loader2,
  PackageCheck,
  PackageX,
  Hourglass,
  Boxes,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useGetAllProductsAdminQuery,
  useApproveProductMutation,
  useRejectProductMutation,
  useDeleteProductAdminMutation,
  useAssignCouponToProductMutation,
  useRemoveCouponFromAdminProductMutation,
} from "@/store/features/productApi";

const AdminProductsPage = () => {
  const [selectedCoupon, setSelectedCoupon] = useState("");
  const [couponInputVisible, setCouponInputVisible] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ✅ Fetch all products
  const {
    data: products = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAllProductsAdminQuery();

  // ✅ Mutations
  const [approveProduct, { isLoading: approving }] = useApproveProductMutation();
  const [rejectProduct, { isLoading: rejecting }] = useRejectProductMutation();
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductAdminMutation();
  const [assignCoupon, { isLoading: assigning }] = useAssignCouponToProductMutation();
  const [removeCoupon, { isLoading: removing }] =
    useRemoveCouponFromAdminProductMutation();

  // ✅ Filter products based on search and status filter
  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.variety?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.seller?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // ✅ Handlers
  const handleApprove = async (id) => {
    if (!confirm("Approve this product?")) return;
    await approveProduct(id);
    refetch();
  };

  const handleReject = async (id) => {
    if (!confirm("Reject this product?")) return;
    await rejectProduct(id);
    refetch();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product? This cannot be undone!")) return;
    await deleteProduct(id);
    refetch();
  };

  const handleAssignCoupon = async (id) => {
    if (!selectedCoupon) {
      alert("Enter a coupon ID first.");
      return;
    }
    await assignCoupon({ id, couponId: selectedCoupon });
    setSelectedCoupon("");
    setCouponInputVisible(null);
    refetch();
  };

  const handleRemoveCoupon = async (id, couponId) => {
    if (!confirm("Remove this coupon from product?")) return;
    await removeCoupon({ id, couponId });
    refetch();
  };

  // ✅ Status Badge with improved styling
  const statusBadge = (status) => {
    let color = "";
    let icon = null;
    
    switch(status) {
      case "approved":
        color = "bg-green-100 text-green-800 border border-green-200";
        icon = <CheckCircle className="h-3 w-3 mr-1" />;
        break;
      case "pending":
        color = "bg-amber-100 text-amber-800 border border-amber-200";
        icon = <Hourglass className="h-3 w-3 mr-1" />;
        break;
      case "rejected":
        color = "bg-red-100 text-red-800 border border-red-200";
        icon = <XCircle className="h-3 w-3 mr-1" />;
        break;
      case "out-of-season":
        color = "bg-purple-100 text-purple-800 border border-purple-200";
        icon = <Hourglass className="h-3 w-3 mr-1" />;
        break;
      default:
        color = "bg-gray-100 text-gray-800 border border-gray-200";
    }
    
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${color}`}>
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </span>
    );
  };

  // ✅ Pagination logic
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ✅ Stats calculation
  const approvedCount = products.filter((p) => p.status === "approved").length;
  const rejectedCount = products.filter((p) => p.status === "rejected").length;
  const pendingCount = products.filter((p) => p.status === "pending").length;
  const outOfSeasonCount = products.filter((p) => p.status === "out-of-season").length;
  const totalCount = products.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
            <p className="text-gray-600 mt-1">
              Manage, approve, reject, delete and assign coupons to products
            </p>
          </div>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </button>
        </div>

        {/* ✅ Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Boxes className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <PackageCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Approved</p>
              <p className="text-2xl font-bold text-green-700">{approvedCount}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <PackageX className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Rejected</p>
              <p className="text-2xl font-bold text-red-700">{rejectedCount}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-lg">
              <Hourglass className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending</p>
              <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Hourglass className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Out of Season</p>
              <p className="text-2xl font-bold text-purple-700">{outOfSeasonCount}</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products by name, category, variety, or seller..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="out-of-season">Out of Season</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
              </div>
              <p className="mt-2 text-gray-500">Loading products...</p>
            </div>
          ) : isError ? (
            <div className="p-8 text-center">
              <PackageX className="h-10 w-10 text-red-500 mx-auto" />
              <p className="mt-2 text-red-500 font-medium">Failed to load products</p>
              <p className="text-sm text-gray-500 mt-1">{error?.data?.message || error?.message}</p>
              <button 
                onClick={refetch}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center">
              <Boxes className="h-12 w-12 text-gray-300 mx-auto" />
              <p className="mt-2 text-gray-500 font-medium">No products found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchQuery || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria" 
                  : "There are no products in the system yet"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Variety
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Seller
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Coupons
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedProducts.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">ID: {product._id.substring(0, 8)}...</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">
                            {product.category?.name || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">
                            {product.variety || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {product.seller?.user?.name || "—"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {product.seller?.user?.email || "No email"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {statusBadge(product.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            {product.coupons?.length > 0 ? (
                              product.coupons.map((c) => (
                                <div
                                  key={c._id}
                                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-200"
                                >
                                  <div>
                                    <span className="text-xs font-medium text-gray-900 block">
                                      {c.code}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {c.discountType === 'percentage' ? `${c.discountValue}% off` : `₹${c.discountValue} off`}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveCoupon(product._id, c._id)}
                                    disabled={removing}
                                    className="text-red-500 hover:text-red-700 text-xs p-1"
                                    title="Remove coupon"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400 italic">No coupons assigned</span>
                            )}

                            {couponInputVisible === product._id ? (
                              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <input
                                    type="text"
                                    value={selectedCoupon}
                                    onChange={(e) => setSelectedCoupon(e.target.value)}
                                    placeholder="Enter coupon ID"
                                    className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAssignCoupon(product._id)}
                                    disabled={assigning}
                                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700 flex items-center transition-colors"
                                  >
                                    {assigning ? (
                                      <>
                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                        Assigning...
                                      </>
                                    ) : (
                                      "Assign Coupon"
                                    )}
                                  </button>
                                  <button
                                    onClick={() => setCouponInputVisible(null)}
                                    className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-md hover:bg-gray-300 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setCouponInputVisible(product._id)}
                                className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium transition-colors"
                              >
                                <TicketPercent className="h-4 w-4" /> 
                                Assign Coupon
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            {product.status !== "approved" && (
                              <button
                                onClick={() => handleApprove(product._id)}
                                disabled={approving}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Approve"
                              >
                                {approving ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </button>
                            )}
                            {product.status !== "rejected" && (
                              <button
                                onClick={() => handleReject(product._id)}
                                disabled={rejecting}
                                className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                title="Reject"
                              >
                                {rejecting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(product._id)}
                              disabled={deleting}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              {deleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 bg-gray-50 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Show:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-600">
                    of {totalProducts} products
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-100 transition-colors"
                    title="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded text-sm ${currentPage === pageNum ? 'bg-indigo-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    {totalPages > 5 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-100 transition-colors"
                    title="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProductsPage;