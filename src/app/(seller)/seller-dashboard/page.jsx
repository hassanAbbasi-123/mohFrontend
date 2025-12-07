'use client';
import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  Star,
  AlertCircle,
  RefreshCw,
  Calendar
} from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useGetMySalesQuery } from '@/store/features/orderApi';
import { useGetMyProductsQuery } from '@/store/features/productApi';
import { useGetMyInventoryQuery } from '@/store/features/inventoryApi';

// Date utilities
const formatDate = (date) => new Date(date).toLocaleDateString();
const getLastMonthDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date.toISOString().split('T')[0];
};

const getTodayDate = () => new Date().toISOString().split('T')[0];

// Status colors mapping
const statusColors = {
  Processing: 'bg-yellow-100 text-yellow-800',
  Shipped: 'bg-blue-100 text-blue-800',
  Delivered: 'bg-green-100 text-green-800',
  Pending: 'bg-gray-100 text-gray-800',
  Cancelled: 'bg-red-100 text-red-800',
  Refunded: 'bg-purple-100 text-purple-800',
};

export default function Dashboard() {
  const [dateRange, setDateRange] = useState({
    from: getLastMonthDate(),
    to: getTodayDate()
  });
  
  const [stats, setStats] = useState({
    totalRevenue: { value: '$0', change: '0%', trend: 'neutral' },
    totalOrders: { value: '0', change: '0%', trend: 'neutral' },
    activeProducts: { value: '0', change: '0%', trend: 'neutral' },
    customerRating: { value: '0/5', change: '0', trend: 'neutral' }
  });

  // API calls
  const { data: salesData, isLoading: salesLoading, refetch: refetchSales } = useGetMySalesQuery({
    from: dateRange.from,
    to: dateRange.to
  });

  const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = useGetMyProductsQuery();
  const { data: inventoryResponse, isLoading: inventoryLoading, refetch: refetchInventory } = useGetMyInventoryQuery();

  // Extract products array from inventory response
  const inventoryData = inventoryResponse?.products || [];
  const lowStockCount = inventoryResponse?.lowStockCount || 0;
  const totalInventoryProducts = inventoryResponse?.totalProducts || 0;

  // Calculate stats from API data
  useEffect(() => {
    if (salesData && productsData && inventoryResponse) {
      // Calculate total revenue from sales data
      const totalRevenue = salesData.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const previousPeriodRevenue = totalRevenue * 0.8; // Mock previous period data
      const revenueChange = previousPeriodRevenue > 0 ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 : 0;

      // Calculate total orders
      const totalOrders = salesData.length;
      const previousOrders = Math.max(1, totalOrders - 2); // Mock previous data
      const ordersChange = ((totalOrders - previousOrders) / previousOrders) * 100;

      // Calculate active products
      const activeProducts = productsData.filter(product => 
        product.status === 'active' && product.approved
      ).length;
      const totalProducts = productsData.length;
      const productsChange = totalProducts > 0 ? 
        (((activeProducts - (activeProducts * 0.9)) / (activeProducts * 0.9)) * 100).toFixed(1) : '0';

      // Calculate average rating from products (if available)
      const productsWithRatings = productsData.filter(product => product.ratings && product.ratings.length > 0);
      const averageRating = productsWithRatings.length > 0 
        ? (productsWithRatings.reduce((sum, product) => {
            const productRating = product.ratings.reduce((ratingSum, rating) => ratingSum + rating.rating, 0) / product.ratings.length;
            return sum + productRating;
          }, 0) / productsWithRatings.length).toFixed(1)
        : 4.8; // Fallback to mock data

      const ratingChange = 0.3; // Mock change

      setStats({
        totalRevenue: {
          value: `$${totalRevenue.toLocaleString()}`,
          change: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
          trend: revenueChange >= 0 ? 'up' : revenueChange < 0 ? 'down' : 'neutral'
        },
        totalOrders: {
          value: totalOrders.toLocaleString(),
          change: `${ordersChange >= 0 ? '+' : ''}${ordersChange.toFixed(1)}%`,
          trend: ordersChange >= 0 ? 'up' : 'down'
        },
        activeProducts: {
          value: activeProducts.toString(),
          change: `+${productsChange}%`,
          trend: 'up'
        },
        customerRating: {
          value: `${averageRating}/5`,
          change: `+${ratingChange}`,
          trend: 'up'
        }
      });
    }
  }, [salesData, productsData, inventoryResponse]);

  // Generate alerts from inventory and sales data
  const generateAlerts = () => {
    const alerts = [];

    // Inventory alerts
    if (inventoryData && Array.isArray(inventoryData)) {
      inventoryData.forEach(item => {
        if (item.quantity <= (item.lowStockThreshold || 5)) {
          alerts.push({
            type: 'warning',
            message: `Low stock alert: ${item.name || 'Product'} (${item.quantity} left)`
          });
        }
      });
    }

    // Sales alerts
    if (salesData && Array.isArray(salesData)) {
      const pendingOrders = salesData.filter(order => 
        order.status === 'Pending' || order.status === 'Processing'
      ).length;
      
      if (pendingOrders > 5) {
        alerts.push({
          type: 'info',
          message: `You have ${pendingOrders} pending orders needing attention`
        });
      }

      // Recent high-value order alert
      const recentHighValue = salesData.find(order => 
        order.totalAmount > 500 && 
        new Date(order.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );
      
      if (recentHighValue) {
        alerts.push({
          type: 'success',
          message: `High-value order processed: $${recentHighValue.totalAmount}`
        });
      }

      // Low stock count alert from inventory response
      if (lowStockCount > 0) {
        alerts.push({
          type: 'warning',
          message: `${lowStockCount} product${lowStockCount > 1 ? 's' : ''} running low on stock`
        });
      }
    }

    // Product alerts
    if (productsData && Array.isArray(productsData)) {
      const unapprovedProducts = productsData.filter(product => !product.approved);
      if (unapprovedProducts.length > 0) {
        alerts.push({
          type: 'info',
          message: `${unapprovedProducts.length} product${unapprovedProducts.length > 1 ? 's' : ''} awaiting approval`
        });
      }
    }

    return alerts.slice(0, 5); // Limit to 5 most important alerts
  };

  const alerts = generateAlerts();
  const isLoading = salesLoading || productsLoading || inventoryLoading;

  const handleRefresh = () => {
    refetchSales();
    refetchProducts();
    refetchInventory();
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const StatCard = ({ name, value, change, trend, icon: Icon }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{name}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
          <div className="flex items-center">
            {trend !== 'neutral' ? (
              trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )
            ) : (
              <span className="h-4 w-4 mr-1">-</span>
            )}
            <span className={`text-sm font-medium ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {change}
            </span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </div>
  );

  const AlertItem = ({ alert, index }) => (
    <div
      key={index}
      className={`flex items-start space-x-3 p-4 rounded-lg border-l-4 ${
        alert.type === 'warning'
          ? 'bg-amber-50 border-l-amber-400 border border-amber-200'
          : alert.type === 'info'
          ? 'bg-blue-50 border-l-blue-400 border border-blue-200'
          : 'bg-green-50 border-l-green-400 border border-green-200'
      } hover:scale-[1.02] transition-transform duration-200`}
    >
      <AlertCircle
        className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
          alert.type === 'warning'
            ? 'text-amber-600'
            : alert.type === 'info'
            ? 'text-blue-600'
            : 'text-green-600'
        }`}
      />
      <p className="text-sm text-gray-900 leading-relaxed">{alert.message}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <ProtectedRoute allowedRoles={["seller"]}>
        {/* Page Header with Controls */}
        <div className="border-b border-gray-200 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-2 text-sm text-gray-600">
                Welcome back! Here's what's happening with your store today.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => handleDateRangeChange('from', e.target.value)}
                  className="text-sm border-none outline-none bg-transparent"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => handleDateRangeChange('to', e.target.value)}
                  className="text-sm border-none outline-none bg-transparent"
                />
              </div>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
            <span className="ml-2 text-gray-600">Loading dashboard data...</span>
          </div>
        )}

        {/* Stats Grid */}
        {!isLoading && (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                name="Total Revenue"
                value={stats.totalRevenue.value}
                change={stats.totalRevenue.change}
                trend={stats.totalRevenue.trend}
                icon={DollarSign}
              />
              <StatCard
                name="Total Orders"
                value={stats.totalOrders.value}
                change={stats.totalOrders.change}
                trend={stats.totalOrders.trend}
                icon={ShoppingCart}
              />
              <StatCard
                name="Active Products"
                value={stats.activeProducts.value}
                change={stats.activeProducts.change}
                trend={stats.activeProducts.trend}
                icon={Package}
              />
              <StatCard
                name="Customer Rating"
                value={stats.customerRating.value}
                change={stats.customerRating.change}
                trend={stats.customerRating.trend}
                icon={Star}
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Orders */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                  <span className="text-sm text-gray-500">
                    {salesData?.length || 0} orders total
                  </span>
                </div>
                <div className="overflow-x-auto">
                  {salesData && salesData.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {salesData.slice(0, 5).map((order) => (
                          <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                              #{order.orderNumber || order._id?.slice(-8)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {order.customerName || order.user?.name || 'Customer'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              ${order.totalAmount?.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                  statusColors[order.status] || statusColors.Pending
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-12">
                      <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No orders found in the selected date range</p>
                    </div>
                  )}
                </div>
                {salesData && salesData.length > 5 && (
                  <div className="p-4 border-t border-gray-200 text-center">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View all orders →
                    </button>
                  </div>
                )}
              </div>

              {/* Alerts & Inventory Panel */}
              <div className="space-y-6">
                {/* Alerts Panel */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                      Alerts & Notifications
                    </h2>
                  </div>
                  <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                    {alerts.length > 0 ? (
                      alerts.map((alert, index) => (
                        <AlertItem key={index} alert={alert} />
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="bg-green-50 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                          <AlertCircle className="h-6 w-6 text-green-500" />
                        </div>
                        <p className="text-gray-500 text-sm">All good! No alerts at the moment.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Inventory Overview */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Package className="h-5 w-5 text-blue-500 mr-2" />
                      Inventory Summary
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {totalInventoryProducts} products • {lowStockCount} low stock
                    </p>
                  </div>
                  <div className="p-6 space-y-4">
                    {inventoryData.length > 0 ? (
                      <>
                        {inventoryData.slice(0, 3).map((item) => (
                          <div key={item._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                SKU: {item.sku || 'N/A'} • ${item.price}
                              </p>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              item.quantity <= (item.lowStockThreshold || 5) 
                                ? 'bg-red-100 text-red-800' 
                                : item.quantity <= 20 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {item.quantity} in stock
                            </div>
                          </div>
                        ))}
                        {inventoryData.length > 3 && (
                          <button className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium py-2">
                            View all {inventoryData.length} inventory items →
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No inventory items found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Metrics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Products Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Products Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{productsData?.length || 0}</p>
                    <p className="text-sm text-gray-600">Total Products</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {productsData?.filter(p => p.status === 'active' && p.approved).length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Active & Approved</p>
                  </div>
                </div>
              </div>

              {/* Sales Performance */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completed Orders</span>
                    <span className="font-semibold">
                      {salesData?.filter(o => o.status === 'Delivered').length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending Orders</span>
                    <span className="font-semibold text-yellow-600">
                      {salesData?.filter(o => o.status === 'Pending' || o.status === 'Processing').length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Order Value</span>
                    <span className="font-semibold">
                      ${salesData && salesData.length > 0 
                        ? (salesData.reduce((sum, o) => sum + (o.totalAmount || 0), 0) / salesData.length).toFixed(2)
                        : '0.00'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </ProtectedRoute>
    </div>
  );
}