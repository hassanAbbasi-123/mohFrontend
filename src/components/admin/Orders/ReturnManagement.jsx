// components/admin/orders/ReturnManagement.js
import { useState } from 'react';

const ReturnManagement = ({ orders, onUpdateReturnStatus, isLoading }) => {
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [status, setStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');

  // Extract all return requests from orders
  const allReturns = orders.flatMap(order => 
    (order.returnRequests || []).map(returnReq => ({
      ...returnReq,
      orderId: order._id,
      orderNumber: order._id.slice(-8)
    }))
  ).filter(returnReq => 
    ['requested', 'approved', 'received'].includes(returnReq.status)
  );

  const handleUpdateStatus = (returnReq) => {
    if (status) {
      onUpdateReturnStatus(returnReq._id, { status, adminNote });
      setStatus('');
      setAdminNote('');
      setSelectedReturn(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      requested: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      received: 'bg-purple-100 text-purple-800',
      refunded: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6">Return Management</h2>
      
      {allReturns.length === 0 ? (
        <p className="text-gray-500">No return requests found.</p>
      ) : (
        <div className="space-y-4">
          {allReturns.map(returnReq => (
            <div key={returnReq._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium">Return for Order #{returnReq.orderNumber}</h3>
                    {getStatusBadge(returnReq.status)}
                  </div>
                  <p className="text-gray-600">Reason: {returnReq.reason}</p>
                  <p className="text-gray-600">Quantity: {returnReq.quantity}</p>
                  <p className="text-gray-600">
                    Requested by: {returnReq.buyer?.name || 'Unknown'} on{' '}
                    {new Date(returnReq.createdAt).toLocaleDateString()}
                  </p>
                  {returnReq.adminNote && (
                    <p className="text-gray-600 mt-2">
                      <span className="font-medium">Admin Note:</span> {returnReq.adminNote}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedReturn(selectedReturn?._id === returnReq._id ? null : returnReq)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  {selectedReturn?._id === returnReq._id ? 'Cancel' : 'Update'}
                </button>
              </div>

              {selectedReturn?._id === returnReq._id && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h4 className="font-medium mb-2">Update Return Status</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select status</option>
                        <option value="approved">Approve</option>
                        <option value="received">Mark as Received</option>
                        <option value="refunded">Process Refund</option>
                        <option value="rejected">Reject</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Admin Note (Optional)</label>
                      <textarea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows={2}
                        placeholder="Add note about this return..."
                      />
                    </div>
                    <button
                      onClick={() => handleUpdateStatus(returnReq)}
                      disabled={!status || isLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReturnManagement;