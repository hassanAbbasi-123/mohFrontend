"use client";
import { useState, useEffect } from "react";
import { useGetMyOrdersQuery, useCancelOrderMutation, useConfirmDeliveryMutation } from "@/store/features/orderApi";

export default function Orders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  
  // Fetch orders using RTK Query
  const { data: ordersData, isLoading, error, refetch } = useGetMyOrdersQuery({
    status: activeTab !== "all" ? activeTab : undefined
  });
  
  // Mutations
  const [cancelOrder] = useCancelOrderMutation();
  const [confirmDelivery] = useConfirmDeliveryMutation();
  
  const orders = ordersData || [];

  useEffect(() => {
    // Refetch data when tab changes
    refetch();
  }, [activeTab, refetch]);

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered": return "bg-green-100 text-green-800 border-green-200";
      case "shipped": return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      case "pending": return "bg-gray-100 text-gray-800 border-gray-200";
      case "completed": return "bg-purple-100 text-purple-800 border-purple-200";
      case "refunded": return "bg-pink-100 text-pink-800 border-pink-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered": return <CheckCircleIcon size={16} className="text-green-600" />;
      case "shipped": return <TruckIcon size={16} className="text-blue-600" />;
      case "processing": return <RefreshIcon size={16} className="text-yellow-600" />;
      case "cancelled": return <XCircleIcon size={16} className="text-red-600" />;
      case "pending": return <ClockIcon size={16} className="text-gray-600" />;
      case "completed": return <StarIcon size={16} className="text-purple-600" />;
      case "refunded": return <RefreshCwIcon size={16} className="text-pink-600" />;
      default: return <PackageIcon size={16} className="text-gray-600" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items?.some(item => 
        item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && order.orderStatus === activeTab;
  });

  const openCancelModal = (orderId) => {
    setSelectedOrder(orderId);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedOrder(null);
    setCancellationReason("");
  };

  const handleCancelOrder = async () => {
    if (!cancellationReason.trim()) {
      alert("Please provide a reason for cancellation");
      return;
    }

    try {
      await cancelOrder({ id: selectedOrder, cancellationReason }).unwrap();
      alert("Order cancelled successfully");
      refetch();
      closeCancelModal();
    } catch (err) {
      alert(`Failed to cancel order: ${err.data?.message || err.message}`);
    }
  };

  const handleConfirmDelivery = async (orderId) => {
    try {
      await confirmDelivery(orderId).unwrap();
      alert("Delivery confirmed successfully");
      refetch();
    } catch (err) {
      alert(`Failed to confirm delivery: ${err.data?.message || err.message}`);
    }
  };

  const OrderCard = ({ order }) => {
    const statusColor = getStatusColor(order.orderStatus);
    
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 transition-all hover:shadow-xl overflow-hidden">
        {/* Order Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              ORD-{order._id?.slice(-8).toUpperCase()}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base mt-1 flex items-center gap-1">
              <CalendarIcon size={14} className="text-gray-400 flex-shrink-0" />
              <span className="truncate">Ordered on {new Date(order.createdAt).toLocaleDateString()}</span>
            </p>
          </div>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium border ${statusColor} flex-shrink-0 mt-2 sm:mt-0`}>
            {getStatusIcon(order.orderStatus)}
            <span className="hidden sm:inline">
              {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
            </span>
            <span className="sm:hidden">
              {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1, 3)}
            </span>
          </span>
        </div>
        
        {/* Order Items */}
        <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
          {order.items?.map((item, index) => (
            <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100">
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-lg overflow-hidden shrink-0 border border-gray-200">
                <img 
                  src={item.image || item.product?.image || "/placeholder-product.jpg"} 
                  alt={item.product?.name}
                  className="w-full h-full object-cover"
                />
                {item.isHot && (
                  <div className="absolute top-1 left-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-1 py-0.5 rounded flex items-center gap-1">
                    <ZapIcon size={8} className="fill-white" /> HOT
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{item.product?.name}</h4>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Qty: {item.quantity} • ${item.price?.toFixed(2)}
                </p>
                <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                  <StoreIcon size={12} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate">Seller: {item.seller?.storeName || "Unknown Seller"}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Details */}
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          <div className="flex justify-between text-sm sm:text-base">
            <span className="text-gray-700">Total Amount:</span>
            <span className="font-bold text-gray-900">${order.totalAmount?.toFixed(2)}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
            <span className="text-gray-700 text-sm sm:text-base">Delivery Address:</span>
            <span className="text-gray-900 text-xs sm:text-sm text-right max-w-xs break-words">
              {order.shippingAddress ? 
                `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.zip}, ${order.shippingAddress.country}` 
                : "Address not available"}
            </span>
          </div>
          {order.trackingNumbers && order.trackingNumbers.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
              <span className="text-gray-700 text-sm sm:text-base">Tracking Number:</span>
              <span className="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded-md text-xs sm:text-sm break-all">
                {order.trackingNumbers[0]}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-100">
          <button className="flex items-center gap-1 sm:gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors font-medium text-xs sm:text-sm shadow-sm hover:shadow-md flex-1 sm:flex-none justify-center">
            <EyeIcon size={14} />
            <span className="hidden sm:inline">View Details</span>
            <span className="sm:hidden">Details</span>
          </button>
          
          {order.orderStatus === "delivered" && (
            <>
              <button className="flex items-center gap-1 sm:gap-2 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors font-medium text-xs sm:text-sm flex-1 sm:flex-none justify-center">
                <DownloadIcon size={14} />
                <span className="hidden sm:inline">Invoice</span>
                <span className="sm:hidden">Invoice</span>
              </button>
              <button className="flex items-center gap-1 sm:gap-2 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors font-medium text-xs sm:text-sm flex-1 sm:flex-none justify-center">
                <StarIcon size={14} />
                <span className="hidden sm:inline">Review</span>
                <span className="sm:hidden">Review</span>
              </button>
              <button className="flex items-center gap-1 sm:gap-2 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors font-medium text-xs sm:text-sm flex-1 sm:flex-none justify-center">
                <RefreshIcon size={14} />
                <span className="hidden sm:inline">Return</span>
                <span className="sm:hidden">Return</span>
              </button>
            </>
          )}
          
          {order.orderStatus === "processing" && (
            <button 
              onClick={() => handleConfirmDelivery(order._id)}
              className="flex items-center gap-1 sm:gap-2 px-3 py-2 bg-green-600 text-white rounded-lg sm:rounded-xl hover:bg-green-700 transition-colors font-medium text-xs sm:text-sm shadow-sm hover:shadow-md flex-1 sm:flex-none justify-center"
            >
              <CheckIcon size={14} />
              <span className="hidden sm:inline">Confirm Delivery</span>
              <span className="sm:hidden">Confirm</span>
            </button>
          )}
          
          {(order.orderStatus === "pending" || order.orderStatus === "processing") && (
            <button 
              onClick={() => openCancelModal(order._id)}
              className="flex items-center gap-1 sm:gap-2 px-3 py-2 bg-red-600 text-white rounded-lg sm:rounded-xl hover:bg-red-700 transition-colors font-medium text-xs sm:text-sm shadow-sm hover:shadow-md flex-1 sm:flex-none justify-center"
            >
              <XIcon size={14} />
              <span className="hidden sm:inline">Cancel Order</span>
              <span className="sm:hidden">Cancel</span>
            </button>
          )}
          
          {order.trackingNumbers && order.trackingNumbers.length > 0 && (
            <button className="flex items-center gap-1 sm:gap-2 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors font-medium text-xs sm:text-sm flex-1 sm:flex-none justify-center">
              <TruckIcon size={14} />
              <span className="hidden sm:inline">Track Package</span>
              <span className="sm:hidden">Track</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="pt-16 lg:pt-0"> {/* Fixed navbar spacing */}
          <div className="py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 sm:h-12 bg-gray-200 rounded-xl w-2/3 sm:w-1/3 mb-4 sm:mb-6"></div>
                <div className="h-10 bg-gray-200 rounded-xl w-full mb-6 sm:mb-8"></div>
                <div className="space-y-4 sm:space-y-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-48 sm:h-64 bg-gray-200 rounded-xl sm:rounded-2xl"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="pt-16 lg:pt-0"> {/* Fixed navbar spacing */}
          <div className="py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-12 text-center shadow-lg border border-gray-100">
                <AlertCircleIcon size={32} className="text-red-500 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  Error Loading Orders
                </h3>
                <p className="text-gray-700 text-sm sm:text-base mb-4 sm:mb-6">
                  {error.data?.message || "Failed to load your orders. Please try again."}
                </p>
                <button 
                  onClick={refetch}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Fixed navbar spacing - Add top padding for mobile navbar */}
      <div className="pt-16 lg:pt-0"> {/* Mobile: 16px top padding, Desktop: 0 */}
        <div className="py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-200">
                    <PackageIcon size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
                    <p className="text-gray-600 text-sm sm:text-base mt-1">
                      Track and manage your orders
                    </p>
                  </div>
                </div>
                
                <div className="relative max-w-md w-full">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            {/* Tabs Section */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-1 sm:p-2 shadow-lg border border-gray-100 mb-6 sm:mb-8 overflow-x-auto">
              <div className="flex min-w-max sm:grid sm:grid-cols-2 md:grid-cols-5 gap-1 sm:gap-2">
                {["all", "pending", "processing", "delivered", "cancelled"].map((tab) => {
                  const count = tab === "all" 
                    ? orders.length 
                    : orders.filter(o => o.orderStatus === tab).length;
                    
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`relative px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1 min-w-[80px] sm:min-w-0 ${
                        activeTab === tab 
                          ? "text-blue-600 bg-blue-50" 
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4/5 h-0.5 bg-blue-600 rounded-t-full"></div>
                      )}
                      <span className="hidden sm:inline">
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </span>
                      <span className="sm:hidden">
                        {tab === "all" ? "All" : 
                         tab === "pending" ? "Pending" :
                         tab === "processing" ? "Process" :
                         tab === "delivered" ? "Delivered" : "Cancelled"}
                      </span>
                      <span className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 sm:min-w-[1.5rem] sm:h-6 px-1 rounded-full text-xs ${
                        activeTab === tab ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4 sm:space-y-6">
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-12 text-center shadow-lg border border-gray-100">
                  <PackageIcon size={32} className="text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    No orders found
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                    {searchQuery 
                      ? "Try adjusting your search terms" 
                      : activeTab === "all" 
                        ? "You haven't placed any orders yet"
                        : `No ${activeTab} orders`
                    }
                  </p>
                  {activeTab === "all" && !searchQuery && (
                    <button className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md">
                      Start Shopping
                    </button>
                  )}
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <OrderCard key={order._id} order={order} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-xl mx-4">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Cancel Order</h3>
              <button 
                onClick={closeCancelModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon size={18} />
              </button>
            </div>
            
            <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">
              Please provide a reason for cancellation. This helps us improve our service.
            </p>
            
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              className="w-full p-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3 sm:mb-4 text-sm sm:text-base"
              rows={3}
            />
            
            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                onClick={closeCancelModal}
                className="px-3 sm:px-4 py-2 border border-gray-200 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg sm:rounded-xl hover:bg-red-700 transition-colors font-medium text-sm sm:text-base shadow-sm hover:shadow-md"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Icon components (same as before)
const PackageIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
    <path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
  </svg>
);

const SearchIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
);

const EyeIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const DownloadIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const StarIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const RefreshIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
  </svg>
);

const RefreshCwIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
  </svg>
);

const TruckIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M10 17h4V5H2v12h3"/><path d="m20 7 3 3-3 3"/><path d="M17 20l-3-3 3-3"/>
    <circle cx="17.5" cy="17.5" r="2.5"/><circle cx="7.5" cy="17.5" r="2.5"/>
  </svg>
);

const ZapIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const AlertCircleIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
  </svg>
);

const CheckIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const CheckCircleIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const XIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const XCircleIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/>
  </svg>
);

const ClockIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const CalendarIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);

const StoreIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M3 9v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9"/><path d="M3 9V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3"/><path d="M7 13h10"/>
  </svg>
);