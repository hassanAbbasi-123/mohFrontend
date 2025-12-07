// components/admin/orders/OrderFilters.js
import { useState } from 'react';

const OrderFilters = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(localFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      from: '',
      to: '',
      status: '',
      sellerId: '',
      userId: '',
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-lg font-medium mb-4">Filter Orders</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
          <input
            type="date"
            name="from"
            value={localFilters.from}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
          <input
            type="date"
            name="to"
            value={localFilters.to}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            value={localFilters.status}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Seller ID</label>
          <input
            type="text"
            name="sellerId"
            value={localFilters.sellerId}
            onChange={handleChange}
            placeholder="Seller ID"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
          <input
            type="text"
            name="userId"
            value={localFilters.userId}
            onChange={handleChange}
            placeholder="User ID"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="lg:col-span-5 flex justify-end space-x-3 mt-4">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderFilters;