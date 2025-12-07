// components/admin/orders/OrderCard.js
import { useState } from 'react';
import StatusBadge from '@/components/admin/common/StatusBadge';

const OrderCard = ({ order, onViewDetails, onUpdateStatus, onProcessRefund, onDeleteOrder, isLoading }) => {
  const [showActions, setShowActions] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="p-6 hover:bg-gray-50">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-medium">Order #{order._id.slice(-8)}</h3>
            <StatusBadge status={order.orderStatus} />
          </div>
          <p className="text-gray-600">
            Customer: {order.user?.name || 'Unknown'} ({order.user?.email || 'No email'})
          </p>
          <p className="text-gray-600">Date: {formatDate(order.createdAt)}</p>
          <p className="text-gray-600">Items: {order.items.length}</p>
          <p className="text-gray-600 font-medium">Total: {formatCurrency(order.totalAmount)}</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <button
            onClick={() => onViewDetails(order)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View Details
          </button>
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              Actions ▼
            </button>
            {showActions && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                {order.orderStatus === 'pending' && (
                  <button
                    onClick={() => onUpdateStatus(order._id, { orderStatus: 'processing' })}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    disabled={isLoading}
                  >
                    Mark as Processing
                  </button>
                )}
                {order.orderStatus === 'processing' && (
                  <button
                    onClick={() => onUpdateStatus(order._id, { orderStatus: 'completed' })}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    disabled={isLoading}
                  >
                    Mark as Completed
                  </button>
                )}
                {(order.orderStatus === 'pending' || order.orderStatus === 'processing') && (
                  <button
                    onClick={() => {
                      const reason = prompt('Please enter cancellation reason:');
                      if (reason) {
                        onUpdateStatus(order._id, { 
                          orderStatus: 'cancelled', 
                          cancellationReason: reason 
                        });
                      }
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    disabled={isLoading}
                  >
                    Cancel Order
                  </button>
                )}
                {(order.orderStatus === 'completed' || order.orderStatus === 'processing') && (
                  <button
                    onClick={() => {
                      const reason = prompt('Please enter refund reason:');
                      if (reason) {
                        onProcessRefund(order._id, { refundReason: reason });
                      }
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-gray-100"
                    disabled={isLoading}
                  >
                    Process Refund
                  </button>
                )}
                <button
                  onClick={() => onDeleteOrder(order._id)}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  disabled={isLoading}
                >
                  Delete Order
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;