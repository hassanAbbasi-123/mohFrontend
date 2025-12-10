"use client";
import { useState } from 'react';
const CouponModal = ({ product, onApply, onCancel }) => {
  const [couponId, setCouponId] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (couponId.trim()) {
      onApply(product._id, couponId.trim());
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Apply Coupon to {product.name}</h2>
         
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Coupon ID</label>
              <input
                type="text"
                value={couponId}
                onChange={(e) => setCouponId(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Enter coupon ID"
                required
              />
            </div>
           
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Apply Coupon
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default CouponModal;