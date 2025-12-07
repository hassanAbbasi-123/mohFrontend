// src/app/admin/order-tracking/page.jsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
  useProcessRefundMutation,
  useDeleteOrderMutation,
  useGetOrderAnalyticsQuery,
  useAddTrackingMutation,
} from '@/store/features/orderApi';
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  Truck,
  DollarSign,
  Trash2,
  AlertTriangle,
  Package,
  TrendingUp,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  ShoppingCart,
  BarChart3,
  User,
  Calendar,
  CreditCard,
  MapPin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_CONFIG = {
  pending: { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  processing: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: RefreshCw },
  shipped: { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Truck },
  delivered: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle },
  completed: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
  refunded: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: DollarSign },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const IconComponent = config.icon;
  
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.color} backdrop-blur-sm`}
    >
      <IconComponent className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </motion.span>
  );
}

function EmptyState({ 
  title = 'No data available', 
  subtitle = 'There are no items to display at the moment',
  icon: Icon = Package 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm">{subtitle}</p>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-20 h-8 bg-gray-200 rounded-lg animate-pulse" />
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function OrderDetailPanel({ order, onClose, onUpdateStatus, onAddTracking, onProcessRefund, onDelete }) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [orderStatusToSet, setOrderStatusToSet] = useState('');
  const [refundReason, setRefundReason] = useState('');

  if (!order) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
          <p className="text-sm text-gray-600 mt-1">#{order._id?.slice(-8).toUpperCase()}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XCircle className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Customer Information */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
          <User className="w-4 h-4" />
          Customer Information
        </h4>
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Name:</span>
            <span className="text-sm font-medium">{order.user?.name || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Email:</span>
            <span className="text-sm font-medium">{order.user?.email || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Phone:</span>
            <span className="text-sm font-medium">{order.user?.phone || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          Order Summary
        </h4>
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Status:</span>
            <StatusBadge status={order.orderStatus} />
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Amount:</span>
            <span className="text-sm font-bold">₨ {order.totalAmount || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Payment Method:</span>
            <span className="text-sm font-medium">{order.paymentMethod || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Order Date:</span>
            <span className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      {order.shippingAddress && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Shipping Address
          </h4>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600">
              {order.shippingAddress.street}, {order.shippingAddress.city}<br />
              {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
              {order.shippingAddress.country}
            </p>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Order Items</h4>
        <div className="space-y-2">
          {order.items?.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity} × ₨{item.price}</p>
              </div>
              <p className="text-sm font-semibold">₨ {item.quantity * item.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Actions */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Admin Actions</h4>
        
        {/* Update Status */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">Update Order Status</label>
          <div className="flex gap-2">
            <select
              value={orderStatusToSet}
              onChange={(e) => setOrderStatusToSet(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
            >
              <option value="">Select status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => orderStatusToSet && onUpdateStatus(order._id, orderStatusToSet)}
              disabled={!orderStatusToSet}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Update
            </motion.button>
          </div>
        </div>

        {/* Add Tracking */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">Add Tracking Number</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => trackingNumber && onAddTracking(order._id, trackingNumber)}
              disabled={!trackingNumber}
              className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Add
            </motion.button>
          </div>
        </div>

        {/* Process Refund */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">Process Refund</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Refund reason"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => refundReason && onProcessRefund(order._id, refundReason)}
              disabled={!refundReason}
              className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Refund
            </motion.button>
          </div>
        </div>

        {/* Delete Order */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onDelete(order._id)}
          className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          Delete Order
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function AdminOrderTrackingPage() {
  const router = useRouter();
  const userInfo = useSelector((state) => state?.auth?.userInfo);

  // State management
  const [activeTab, setActiveTab] = useState('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ 
    from: '', 
    to: '', 
    status: '', 
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Protect route
  useEffect(() => {
    if (userInfo && !userInfo.isAdmin) {
      router.push('/unauthorized');
    }
  }, [userInfo, router]);

  // API calls
  const {
    data: orders = [],
    isLoading: loadingOrders,
    error: ordersError,
    refetch: refetchOrders,
  } = useGetAllOrdersQuery(filters);

  const {
    data: analytics,
    isLoading: loadingAnalytics,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useGetOrderAnalyticsQuery({ from: filters.from, to: filters.to });

  // Mutations
  const [updateOrderStatus, { isLoading: updatingStatus }] = useUpdateOrderStatusMutation();
  const [processRefund, { isLoading: processingRefund }] = useProcessRefundMutation();
  const [deleteOrder, { isLoading: deletingOrder }] = useDeleteOrderMutation();
  const [addTracking, { isLoading: addingTracking }] = useAddTrackingMutation();

  // Enhanced search and filtering
  const filteredOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];
    const query = searchQuery.trim().toLowerCase();
    
    return orders.filter((order) => {
      if (!query) return true;
      
      const orderId = order._id ? order._id.toUpperCase() : '';
      const searchQueryUpper = query.toUpperCase();
      if (orderId.includes(searchQueryUpper)) return true;
      
      const userName = order.user?.name ? order.user.name.toLowerCase() : '';
      const userEmail = order.user?.email ? order.user.email.toLowerCase() : '';
      if (userName.includes(query) || userEmail.includes(query)) return true;
      
      const sellerName = order.items?.[0]?.seller?.storeName ? order.items[0].seller.storeName.toLowerCase() : '';
      if (sellerName.includes(query)) return true;
      
      const hasMatchingProduct = order.items?.some(item => {
        const productName = item.product?.name ? item.product.name.toLowerCase() : '';
        return productName.includes(query);
      });
      if (hasMatchingProduct) return true;
      
      const amount = order.totalAmount ? order.totalAmount.toString() : '';
      if (amount.includes(query)) return true;
      
      const status = order.orderStatus ? order.orderStatus.toLowerCase() : '';
      if (status.includes(query)) return true;
      
      return false;
    });
  }, [orders, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  // Handlers
  const handleRefresh = () => {
    refetchOrders();
    refetchAnalytics();
    setCurrentPage(1);
  };

  const handleSetOrderStatus = async (orderId, status) => {
    try {
      await updateOrderStatus({ 
        id: orderId, 
        orderStatus: status,
        ...(status === 'cancelled' && { cancellationReason: 'Cancelled by admin' })
      }).unwrap();
      setSelectedOrder(null);
      refetchOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const handleAddTracking = async (orderId, trackingNumber) => {
    try {
      await addTracking({ orderId, trackingNumber }).unwrap();
      setSelectedOrder(null);
      refetchOrders();
    } catch (err) {
      console.error('Failed to add tracking:', err);
    }
  };

  const handleProcessRefund = async (orderId, reason) => {
    try {
      await processRefund({ id: orderId, refundReason: reason }).unwrap();
      setSelectedOrder(null);
      refetchOrders();
    } catch (err) {
      console.error('Failed to process refund:', err);
    }
  };

  const handleDelete = async (orderId) => {
    if (!confirm('Are you sure you want to delete this order permanently? This action cannot be undone.')) return;
    try {
      await deleteOrder(orderId).unwrap();
      setSelectedOrder(null);
      refetchOrders();
    } catch (err) {
      console.error('Failed to delete order:', err);
    }
  };

  const formatOrderId = (id) => id ? id.slice(-8).toUpperCase() : '';

  // UI Components
  const FiltersBar = () => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm"
    >
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full lg:w-auto">
          <div className="relative flex-1 min-w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders by ID, customer, seller, product..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))}
            className="px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto">
          <div className="flex gap-2">
            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters((s) => ({ ...s, from: e.target.value }))}
              className="px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300"
            />
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters((s) => ({ ...s, to: e.target.value }))}
              className="px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300"
            />
          </div>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setFilters({ from: '', to: '', status: '' }); setSearchQuery(''); setCurrentPage(1); }}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors"
            >
              Clear All
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRefresh}
              disabled={loadingOrders}
              className="flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const Pagination = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6"
    >
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
        </span>
        
        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300"
        >
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </motion.button>

        {[...Array(Math.min(5, totalPages))].map((_, i) => {
          const pageNum = i + 1;
          return (
            <motion.button
              key={pageNum}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(pageNum)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === pageNum
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {pageNum}
            </motion.button>
          );
        })}

        {totalPages > 5 && (
          <span className="px-2 text-gray-500">...</span>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );

  const OrdersList = () => {
    if (loadingOrders) return <LoadingSkeleton />;
    if (ordersError) return <EmptyState title="Error loading orders" subtitle={ordersError?.data?.message || 'Please try refreshing the page'} icon={AlertTriangle} />;
    if (filteredOrders.length === 0) return <EmptyState title="No orders found" subtitle="Try adjusting your search or filters to find what you're looking for" />;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200/60 text-sm font-medium text-gray-600">
            <div className="col-span-2">Order ID</div>
            <div className="col-span-3">Customer</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-1">Actions</div>
          </div>

          <div className="divide-y divide-gray-200/60">
            {paginatedOrders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50/50 transition-colors"
              >
                <div className="col-span-2">
                  <div className="font-mono font-semibold text-gray-900">#{formatOrderId(order._id)}</div>
                </div>
                
                <div className="col-span-3">
                  <div className="font-medium text-gray-900">{order.user?.name || order.user?.email}</div>
                  <div className="text-sm text-gray-500">{order.user?.phone || 'No phone'}</div>
                </div>
                
                <div className="col-span-2">
                  <div className="font-semibold text-gray-900">₨ {order.totalAmount ?? order.total ?? 0}</div>
                </div>
                
                <div className="col-span-2">
                  <StatusBadge status={order.orderStatus || 'pending'} />
                </div>
                
                <div className="col-span-2">
                  <div className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</div>
                  <div className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</div>
                </div>
                
                <div className="col-span-1">
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(order._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <Pagination />
      </motion.div>
    );
  };

  const AnalyticsPanel = () => {
    if (loadingAnalytics) return <LoadingSkeleton />;
    if (analyticsError) return <EmptyState title="Error loading analytics" subtitle={analyticsError?.data?.message || 'Please try refreshing the page'} icon={AlertTriangle} />;
    if (!analytics) return <EmptyState title="No analytics available" subtitle="Analytics data will appear here once orders are processed" icon={BarChart3} />;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Sales</p>
                <p className="text-2xl font-bold mt-2">₨ {analytics.totalSales ?? analytics.total ?? 0}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Orders</p>
                <p className="text-2xl font-bold mt-2">{analytics.totalOrders ?? orders.length}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Avg Order Value</p>
                <p className="text-2xl font-bold mt-2">
                  ₨ {analytics.totalSales && analytics.totalOrders 
                    ? Math.round(analytics.totalSales / analytics.totalOrders) 
                    : 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Pending Orders</p>
                <p className="text-2xl font-bold mt-2">{analytics.pendingOrders ?? 0}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        {analytics.statusCounts && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Orders by Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analytics.statusCounts.map((status, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-4 bg-gray-50 rounded-xl"
                >
                  <div className="text-2xl font-bold text-gray-900">{status.count}</div>
                  <div className="text-sm text-gray-600 capitalize mt-1">{status.status}</div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.user?.name || 'Customer'} placed an order
                    </p>
                    <p className="text-xs text-gray-500">
                      #{formatOrderId(order._id)} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <StatusBadge status={order.orderStatus} />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-indigo-700 bg-clip-text text-transparent">
              Order Management
            </h1>
            <p className="text-gray-600 mt-2">Monitor and manage all orders with real-time analytics</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 border border-gray-200/60 shadow-sm">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {userInfo?.name?.[0] || 'A'}
            </div>
            <div className="text-sm">
              <div className="font-medium text-gray-900">{userInfo?.name || 'Admin'}</div>
              <div className="text-gray-500">Administrator</div>
            </div>
          </div>
        </motion.header>

        {/* Navigation Tabs */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6"
        >
          {[
            { id: 'orders', label: 'Orders', icon: ShoppingCart },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200/60'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          ))}
        </motion.nav>

        <FiltersBar />

        <div className="grid lg:grid-cols-4 gap-6 mt-6">
          <main className={`${selectedOrder ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'orders' && <OrdersList />}
                {activeTab === 'analytics' && <AnalyticsPanel />}
              </motion.div>
            </AnimatePresence>
          </main>

          {selectedOrder && (
            <div className="lg:col-span-1">
              <OrderDetailPanel
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onUpdateStatus={handleSetOrderStatus}
                onAddTracking={handleAddTracking}
                onProcessRefund={handleProcessRefund}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}