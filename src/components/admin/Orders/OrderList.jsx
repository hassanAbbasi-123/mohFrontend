// components/admin/orders/OrderList.js
import { useState } from 'react';
import OrderCard from './OrderCard';
import OrderModal from './OrderModal';

const OrderList = ({ orders, onUpdateStatus, onProcessRefund, onDeleteOrder, isLoading }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">All Orders ({orders.length})</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onViewDetails={handleViewDetails}
              onUpdateStatus={onUpdateStatus}
              onProcessRefund={onProcessRefund}
              onDeleteOrder={onDeleteOrder}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>

      {isModalOpen && selectedOrder && (
        <OrderModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdateStatus={onUpdateStatus}
          onProcessRefund={onProcessRefund}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default OrderList;