// components/admin/orders/DisputeResolution.js
import { useState } from 'react';

const DisputeResolution = ({ orders, onResolveDispute, isLoading }) => {
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolution, setResolution] = useState('');
  const [outcome, setOutcome] = useState('');

  // Extract all disputes from orders
  const allDisputes = orders
    .flatMap(order =>
      (order.disputes || []).map(dispute => ({
        ...dispute,
        orderId: order._id,
        orderNumber: order._id.slice(-8),
      }))
    )
    .filter(dispute => dispute.status === 'open');

  const handleResolve = (dispute) => {
    if (resolution && outcome) {
      onResolveDispute(dispute._id, { resolution, outcome });
      setResolution('');
      setOutcome('');
      setSelectedDispute(null);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6">Dispute Resolution</h2>

      {allDisputes.length === 0 ? (
        <p className="text-gray-500">No open disputes found.</p>
      ) : (
        <div className="space-y-4">
          {allDisputes.map(dispute => (
            <div
              key={dispute._id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium">
                    Dispute for Order #{dispute.orderNumber}
                  </h3>
                  <p className="text-gray-600">Reason: {dispute.reason}</p>
                  <p className="text-gray-600">
                    Opened by: {dispute.openedBy?.name || 'Unknown'} on{' '}
                    {new Date(dispute.createdAt).toLocaleDateString()}
                  </p>
                  {dispute.attachments && dispute.attachments.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Attachments:</p>
                      <div className="flex space-x-2 mt-1">
                        {dispute.attachments.map((attachment, index) => (
                          <a
                            key={index}
                            href={attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Attachment {index + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() =>
                    setSelectedDispute(
                      selectedDispute?._id === dispute._id ? null : dispute
                    )
                  }
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  {selectedDispute?._id === dispute._id ? 'Cancel' : 'Resolve'}
                </button>
              </div>

              {selectedDispute?._id === dispute._id && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h4 className="font-medium mb-2">Resolve Dispute</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resolution
                      </label>
                      <textarea
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md font-sans"
                        rows={3}
                        placeholder="Enter resolution details..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Outcome
                      </label>
                      <select
                        value={outcome}
                        onChange={(e) => setOutcome(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md font-sans"
                      >
                        <option value="">Select outcome</option>
                        <option value="resolved_buyer">
                          Resolved in favor of buyer
                        </option>
                        <option value="resolved_seller">
                          Resolved in favor of seller
                        </option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <button
                      onClick={() => handleResolve(dispute)}
                      disabled={!resolution || !outcome || isLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-sans"
                    >
                      Submit Resolution
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

export default DisputeResolution;
