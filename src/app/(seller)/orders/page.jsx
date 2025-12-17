'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  User,
  Mail,
} from 'lucide-react';
import { 
  useGetMySalesQuery, 
  useUpdateItemStatusMutation,
  useCancelItemMutation,
  useAddTrackingMutation,
  useConfirmPaymentCollectionMutation 
} from '@/store/features/orderApi';

const OrdersPage = ({ setCurrentPage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrders, setExpandedOrders] = useState({});
  const [trackingInputs, setTrackingInputs] = useState({});
  const [processedOrders, setProcessedOrders] = useState([]);
  const [errorMessages, setErrorMessages] = useState({});
  const [updateStatus] = useUpdateItemStatusMutation();
  const [cancelItem] = useCancelItemMutation();
  const [addTracking] = useAddTrackingMutation();
  const [confirmPayment] = useConfirmPaymentCollectionMutation();

  // Fetch sales/orders from API
  const {
    data: subOrdersResponse,
    isLoading,
    isError,
    error,
    refetch
  } = useGetMySalesQuery(
    statusFilter !== 'all' ? { status: statusFilter } : {}
  );

  // Process suborders data to group by main order and avoid duplicates
  useEffect(() => {
    if (subOrdersResponse && Array.isArray(subOrdersResponse)) {
      // Group suborders by their main order ID
      const ordersMap = new Map();
      
      subOrdersResponse.forEach(subOrder => {
        if (!subOrder || !subOrder.order) return;
        
        // Handle both populated order object and order ID string
        const mainOrder = subOrder.order;
        const mainOrderId = mainOrder._id || mainOrder;
        // If order.user was populated by backend, it will be an object; otherwise an id
        const userObj = (mainOrder && typeof mainOrder === 'object' && mainOrder.user && typeof mainOrder.user === 'object') ? mainOrder.user : null;
        const userId = userObj ? (userObj._id || userObj.id) : (typeof mainOrder.user === 'string' ? mainOrder.user : null);
        
        if (!ordersMap.has(mainOrderId)) {
          // Create a new order entry with proper customer information
          ordersMap.set(mainOrderId, {
            _id: mainOrderId,
            userId: userId,
            customer: userObj ? {
              name: userObj.name,
              email: userObj.email,
              phone: userObj.phone
            } : null,
            createdAt: mainOrder.createdAt || subOrder.createdAt || new Date(),
            orderStatus: typeof mainOrder === 'object' ? (mainOrder.orderStatus || 'pending') : 'pending',
            paymentStatus: typeof mainOrder === 'object' ? (mainOrder.paymentStatus || 'pending') : 'pending',
            totalAmount: typeof mainOrder === 'object' ? (mainOrder.totalAmount || 0) : 0,
            shippingAddress: typeof mainOrder === 'object' ? (mainOrder.shippingAddress || {}) : {},
            trackingNumbers: typeof mainOrder === 'object' ? (mainOrder.trackingNumbers || []) : [],
            subOrders: [], // Store all suborders for this main order
            items: [] // Aggregate all items from all suborders
          });
        }
        
        const order = ordersMap.get(mainOrderId);
        
        // Add this suborder to the order
        order.subOrders.push({
          _id: subOrder._id,
          seller: subOrder.seller,
          subOrderStatus: subOrder.subOrderStatus || 'pending',
          items: subOrder.items || [],
          createdAt: subOrder.createdAt
        });
        
        // Add items from this suborder to the main order items list
        if (subOrder.items && Array.isArray(subOrder.items)) {
          // Add the main order ID to each item for reference
          const itemsWithOrderId = subOrder.items.map(item => ({
            ...item,
            mainOrderId: mainOrderId
          }));
          order.items.push(...itemsWithOrderId);
        }
      });
      
      // Convert the map to an array
      const processedOrdersArray = Array.from(ordersMap.values());
      setProcessedOrders(processedOrdersArray);
    } else {
      setProcessedOrders([]);
    }
  }, [subOrdersResponse]);

  // Toggle order details expansion
  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Handle status update - FIXED: Use "paid" instead of "processing" for order items
  const handleStatusUpdate = async (orderId, itemId, status, trackingNumber = null) => {
    try {
      // Clear any previous errors
      setErrorMessages(prev => ({...prev, [itemId]: ''}));
      
      // Map "processing" to "paid" since the order item schema doesn't include "processing"
      const mappedStatus = status === 'processing' ? 'paid' : status;
      
      await updateStatus({
        orderId,
        itemId,
        status: mappedStatus,
        ...(trackingNumber && { trackingNumber }),
      }).unwrap();

      refetch();
    } catch (error) {
      console.error("❌ Failed to update status:", error);
      const errorMsg = error?.data?.message || "Failed to update status";
      setErrorMessages(prev => ({...prev, [itemId]: errorMsg}));
    }
  };

  // Handle item cancellation
  const handleCancelItem = async (orderId, itemId, cancellationReason) => {
    try {
      // Clear any previous errors
      setErrorMessages(prev => ({...prev, [itemId]: ''}));
      
      await cancelItem({ 
        orderId, 
        itemId, 
        cancellationReason: cancellationReason || "Cancelled by seller" 
      }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to cancel item:', error);
      const errorMsg = error?.data?.message || "Failed to cancel item";
      setErrorMessages(prev => ({...prev, [itemId]: errorMsg}));
    }
  };

  // Handle tracking number addition
  const handleAddTracking = async (orderId, trackingNumber) => {
    if (!trackingNumber || !trackingNumber.trim()) return;
    
    try {
      // Clear any previous errors
      setErrorMessages(prev => ({...prev, [orderId]: ''}));
      
      // Pass orderId in body to match controller
      await addTracking({ 
        orderId, 
        trackingNumber 
      }).unwrap();
      setTrackingInputs(prev => ({ ...prev, [orderId]: '' }));
      refetch();
    } catch (error) {
      console.error('Failed to add tracking:', error);
      const errorMsg = error?.data?.message || "Failed to add tracking";
      setErrorMessages(prev => ({...prev, [orderId]: errorMsg}));
    }
  };

  // Handle payment confirmation - FIXED: Ensure proper parameter structure and error handling
  const handleConfirmPayment = async (orderId, itemId) => {
    try {
      // Clear any previous errors
      setErrorMessages(prev => ({...prev, [itemId]: ''}));
      
      // Pass parameters in the request body as expected by the backend
      await confirmPayment({ 
        orderId, 
        itemId 
      }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to confirm payment:', error);
      const errorMsg = error?.data?.message || "Failed to confirm payment";
      setErrorMessages(prev => ({...prev, [itemId]: errorMsg}));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
      case 'pending':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Search & filter orders
  const filteredOrders = processedOrders.filter((order) => {
    const orderIdMatch = (order._id || '').toString().toLowerCase().includes(searchQuery.toLowerCase());
    const customerNameMatch = (order.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const productNameMatch = order.items?.some(item => 
      (item.product?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const matchesSearch = orderIdMatch || customerNameMatch || productNameMatch;
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl ml-12 font-bold text-gray-900">Orders</h1>
        <p className="mt-2 ml-12 text-sm text-gray-600">
          Manage and track all your customer orders
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white ml-11 p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {processedOrders.filter((o) => o.orderStatus === 'pending').length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Processing</p>
              <p className="text-2xl font-semibold text-gray-900">
                {processedOrders.filter((o) => o.orderStatus === 'processing').length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-9 00">
                {processedOrders.filter((o) => o.orderStatus === 'completed').length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-2xl font-semibold text-gray-900">
                {processedOrders.filter((o) => o.orderStatus === 'cancelled').length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="bg-white ml-12 p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID, customer name, or product..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white ml-11 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Loading orders...</div>
          ) : isError ? (
            <div className="p-6 text-center text-red-500">
              Failed to load orders: {error?.data?.message || error?.message}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No orders found</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <div key={order._id} className="p-6">
                  {/* Order Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Order #{(order._id || '').toString().slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      {order.trackingNumbers && order.trackingNumbers.length > 0 && (
                        <div className="mt-1">
                          <p className="text-sm text-gray-600">
                            Tracking: {order.trackingNumbers.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.orderStatus
                        )}`}
                      >
                        {getStatusIcon(order.orderStatus)}
                        <span className="ml-1 capitalize">
                          {order.orderStatus}
                        </span>
                      </span>
                      <button
                        onClick={() => toggleOrderExpansion(order._id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        {expandedOrders[order._id] ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Customer Information</h4>
                    <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {order.customer?.name || 'Name not available'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {order.customer?.email || order.shippingAddress?.email || 'Email not available'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24"><path fill="currentColor" d="M6.62 10.79a15.53 15.53 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21 11.36 11.36 0 003.54 1.1 1 1 0 01.89 1v3.11a1 1 0 01-1 1A17.94 17.94 0 013 5a1 1 0 011-1h3.11a1 1 0 011 .89 11.36 11.36 0 001.1 3.54 1 1 0 01-.21 1.11l-2.2 2.2z"/></svg>
                        <span className="text-sm text-gray-700">
                          {order.customer?.phone || order.shippingAddress?.phone || 'Phone not available'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Error message display */}
                  {errorMessages[order._id] && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{errorMessages[order._id]}</p>
                    </div>
                  )}

                  {/* Expanded Order Details */}
                  {expandedOrders[order._id] && (
                    <div className="mt-4 space-y-4">
                      {/* Items List */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Items</h4>
                        <div className="space-y-3">
                          {order.items?.map((item, index) => (
                            <div key={item._id || item.product?._id || index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-start">
                                {item.product?.image && (
                                  <img 
                                    src={item.product.image} 
                                    alt={item.product.name} 
                                    className="h-10 w-10 object-cover rounded"
                                  />
                                )}
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</p>
                                  <p className="text-sm text-gray-500">Qty: {item.quantity} × ${item.price?.toFixed(2) || '0.00'}</p>
                                  <p className="text-xs text-gray-500">Status: 
                                    <span className={`ml-1 ${getStatusColor(item.status)} px-2 py-0.5 rounded-full`}>
                                      {item.status || 'pending'}
                                    </span>
                                  </p>
                                  {item.paymentCollectionStatus && (
                                    <p className="text-xs text-gray-500">Payment: 
                                      <span className={`ml-1 ${item.paymentCollectionStatus === 'collected' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} px-2 py-0.5 rounded-full`}>
                                        {item.paymentCollectionStatus}
                                      </span>
                                    </p>
                                  )}
                                  {/* Item-specific error message */}
                                  {errorMessages[item._id] && (
                                    <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-md">
                                      <p className="text-xs text-red-600">{errorMessages[item._id]}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex flex-col items-end space-y-2">
                                {/* Status Update Actions */}
                                {(item.status === 'pending' || !item.status) && (
                                  <button
                                    onClick={() => handleStatusUpdate(item.mainOrderId || order._id, item._id, 'paid')}
                                    className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-md hover:bg-blue-200"
                                  >
                                    Process
                                  </button>
                                )}
                                
                                {item.status === 'paid' && (
                                  <button
                                    onClick={() => handleStatusUpdate(item.mainOrderId || order._id, item._id, 'shipped')}
                                    className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-md hover:bg-green-200"
                                  >
                                    Mark Shipped
                                  </button>
                                )}
                                
                                {item.status === 'shipped' && (
                                  <button
                                    onClick={() => handleStatusUpdate(item.mainOrderId || order._id, item._id, 'delivered')}
                                    className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-md hover:bg-purple-200"
                                  >
                                    Mark Delivered
                                  </button>
                                )}
                                
                                {item.status === 'delivered' && item.paymentCollectionStatus !== 'collected' && (
                                  <button
                                    onClick={() => handleConfirmPayment(item.mainOrderId || order._id, item._id)}
                                    className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-md hover:bg-indigo-200"
                                  >
                                    Confirm Payment
                                  </button>
                                )}
                                
                                {(item.status === 'pending' || item.status === 'paid' || !item.status) && (
                                  <button
                                    onClick={() => handleCancelItem(item.mainOrderId || order._id, item._id)}
                                    className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-md hover:bg-red-200"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Order Summary</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span>${order.items?.reduce((sum, item) => sum + (item.subtotal || 0), 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Shipping:</span>
                              <span>${order.items?.reduce((sum, item) => sum + (item.shippingFee || 0), 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tax:</span>
                              <span>${order.items?.reduce((sum, item) => sum + (item.taxAmount || 0), 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-medium pt-2 border-t">
                              <span>Total:</span>
                              <span>${order.totalAmount?.toFixed(2) || order.items?.reduce((total, item) => total + (item.subtotal || 0) + (item.shippingFee || 0) + (item.taxAmount || 0), 0).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Tracking Number Input */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Add Tracking Number</h4>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              placeholder="Enter tracking number"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                              value={trackingInputs[order._id] || ''}
                              onChange={(e) => setTrackingInputs(prev => ({
                                ...prev,
                                [order._id]: e.target.value
                              }))}
                            />
                            <button
                              onClick={() => handleAddTracking(order._id, trackingInputs[order._id])}
                              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;