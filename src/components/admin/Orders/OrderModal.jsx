// components/admin/orders/OrderModal.js
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

const OrderModal = ({ order, isOpen, onClose, onUpdateStatus, onProcessRefund, isLoading }) => {
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
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={onClose}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          </Transition.Child>

          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  Order Details - #{order._id.slice(-8)}
                </Dialog.Title>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium mb-2">Customer Information</h4>
                  <p>Name: {order.user?.name || 'Unknown'}</p>
                  <p>Email: {order.user?.email || 'No email'}</p>
                  <p>Phone: {order.shippingAddress?.phone || 'No phone'}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Order Information</h4>
                  <p>Date: {formatDate(order.createdAt)}</p>
                  <p>Status: <span className="capitalize">{order.orderStatus}</span></p>
                  <p>Payment: {order.paymentMethod} - {order.paymentStatus}</p>
                  <p>Total: {formatCurrency(order.totalAmount)}</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-2">Shipping Address</h4>
                <p>
                  {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                  {order.shippingAddress?.zip}, {order.shippingAddress?.country}
                </p>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-2">Order Items</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Seller
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {item.product?.image && (
                                <img
                                  className="h-10 w-10 rounded-full object-cover mr-3"
                                  src={item.product.image}
                                  alt={item.product.name}
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {item.product?.name || 'Unknown Product'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  SKU: {item.product?._id?.slice(-6) || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.seller?.storeName || 'Unknown Seller'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {order.cancellationReason && (
                <div className="mb-6 p-4 bg-red-50 rounded-md">
                  <h4 className="font-medium text-red-800 mb-2">Cancellation Reason</h4>
                  <p className="text-red-700">{order.cancellationReason}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={onClose}
                >
                  Close
                </button>
                {order.orderStatus === 'pending' && (
                  <button
                    onClick={() => onUpdateStatus(order._id, { orderStatus: 'processing' })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    Mark as Processing
                  </button>
                )}
                {order.orderStatus === 'processing' && (
                  <button
                    onClick={() => onUpdateStatus(order._id, { orderStatus: 'completed' })}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
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
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    disabled={isLoading}
                  >
                    Process Refund
                  </button>
                )}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default OrderModal;