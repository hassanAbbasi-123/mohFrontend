import React, { useState, useMemo } from 'react';
import {
  useGetAdminDashboardQuery,
  useGetSalesReportQuery,
  useGetProductPerformanceQuery,
  useGetCustomerAnalyticsQuery,
  useGetFinancialReportQuery
} from '@/store/features/analyticsApi';

const AdminAnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [reportParams, setReportParams] = useState({ groupBy: 'day', category: '', status: '' });

  // API Queries
  const { data: dashboardData, isLoading: dashboardLoading } = useGetAdminDashboardQuery({ 
    from: dateRange.from, to: dateRange.to 
  });
  const { data: salesData, isLoading: salesLoading } = useGetSalesReportQuery({ 
    from: dateRange.from, to: dateRange.to, groupBy: reportParams.groupBy 
  });
  const { data: productData, isLoading: productLoading } = useGetProductPerformanceQuery({ 
    from: dateRange.from, to: dateRange.to, category: reportParams.category, status: reportParams.status
  });
  const { data: customerData, isLoading: customerLoading } = useGetCustomerAnalyticsQuery({ 
    from: dateRange.from, to: dateRange.to 
  });
  const { data: financialData, isLoading: financialLoading } = useGetFinancialReportQuery({ 
    from: dateRange.from, to: dateRange.to 
  });

  // Utility Functions
  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2
  }).format(amount || 0);

  const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num || 0);
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  }) : 'N/A';

  const getSafeMax = (dataArray, accessor = (item) => item) => {
    if (!dataArray?.length) return 1;
    const values = dataArray.map(accessor).filter(v => v > 0);
    return values.length ? Math.max(...values) : 1;
  };

  // Components
  const StatusBadge = ({ status }) => {
    const config = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-800' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800' },
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
      cancelled: { bg: 'bg-rose-100', text: 'text-rose-800' },
      approved: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
      rejected: { bg: 'bg-rose-100', text: 'text-rose-800' }
    }[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
      </span>
    );
  };

  const MetricCard = ({ title, value, icon, trend, loading = false }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg">
              {icon}
            </div>
            {trend && (
              <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                trend > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </div>
            )}
          </div>
          <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wide">{title}</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </>
      )}
    </div>
  );

  const DataTable = ({ columns, data, loading, emptyMessage = "No data available" }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col, index) => (
                <th key={index} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? [...Array(5)].map((_, i) => (
              <tr key={i}>
                {columns.map((_, j) => (
                  <td key={j} className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                ))}
              </tr>
            )) : data?.length ? data.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                {columns.map((col, j) => (
                  <td key={j} className="px-6 py-4 text-sm text-gray-900">
                    {col.accessor ? col.accessor(row, i) : col.render(row)}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const BarChart = ({ data, accessor, labelAccessor, loading, height = 200 }) => {
    const maxValue = getSafeMax(data, accessor);
    
    return (
      <div className="space-y-4">
        {loading ? (
          <div className="h-48 bg-gray-100 rounded-2xl animate-pulse"></div>
        ) : data?.length ? (
          <div className="flex items-end justify-between gap-3" style={{ height: `${height}px` }}>
            {data.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center space-y-2">
                <div className="text-xs text-gray-500 font-medium text-center min-h-[32px] flex items-end">
                  {labelAccessor(item)}
                </div>
                <div className="w-full bg-gray-100 rounded-full overflow-hidden flex-1 max-h-32">
                  <div 
                    className="bg-gradient-to-t from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                    style={{ height: `${(accessor(item) / maxValue) * 80}%` }}
                  ></div>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {typeof accessor(item) === 'number' ? formatNumber(accessor(item)) : accessor(item)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-500">
            No data available
          </div>
        )}
      </div>
    );
  };

  // Tab Renderers
  const renderDashboardTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Revenue" value={formatCurrency(dashboardData?.overview?.totalRevenue)} icon="💰" trend={12.5} loading={dashboardLoading} />
        <MetricCard title="Total Orders" value={formatNumber(dashboardData?.overview?.totalOrders)} icon="📦" trend={8.2} loading={dashboardLoading} />
        <MetricCard title="Total Users" value={formatNumber(dashboardData?.overview?.totalUsers)} icon="👥" trend={15.3} loading={dashboardLoading} />
        <MetricCard title="Pending Products" value={formatNumber(dashboardData?.overview?.pendingProducts)} icon="⏳" trend={-2.1} loading={dashboardLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <button className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors">
              View Details
            </button>
          </div>
          <BarChart 
            data={dashboardData?.monthlyRevenue} 
            accessor={item => item.revenue}
            labelAccessor={item => `${item._id.month}/${item._id.year}`}
            loading={dashboardLoading}
          />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Categories</h3>
            <button className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {dashboardLoading ? [...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            )) : dashboardData?.topCategories?.slice(0, 5).map((category, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    {i + 1}
                  </div>
                  <span className="font-medium text-gray-900">{category.name}</span>
                </div>
                <span className="font-semibold text-emerald-600">{formatCurrency(category.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        </div>
        <DataTable
          loading={dashboardLoading}
          columns={[
            { header: 'Order ID', accessor: (order) => `#${order._id?.substring(0, 8)}` },
            { header: 'Customer', accessor: (order) => order.user?.name },
            { header: 'Amount', accessor: (order) => formatCurrency(order.totalAmount) },
            { header: 'Status', accessor: (order) => <StatusBadge status={order.orderStatus} /> },
            { header: 'Date', accessor: (order) => formatDate(order.createdAt) },
            { header: 'Actions', accessor: () => (
              <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors">
                View
              </button>
            )}
          ]}
          data={dashboardData?.recentOrders?.slice(0, 8)}
        />
      </div>
    </div>
  );

  const renderSalesReportTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Report Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Group By</label>
            <select 
              value={reportParams.groupBy}
              onChange={(e) => setReportParams({...reportParams, groupBy: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <div className="flex space-x-2">
              <input 
                type="date" 
                value={dateRange.from}
                onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <input 
                type="date" 
                value={dateRange.to}
                onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
              Generate Report
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Total Revenue" value={formatCurrency(salesData?.totalRevenue)} icon="💰" loading={salesLoading} />
        <MetricCard title="Total Orders" value={formatNumber(salesData?.totalOrders)} icon="📦" loading={salesLoading} />
        <MetricCard title="Avg Order Value" value={formatCurrency(salesData?.averageOrderValue)} icon="📊" loading={salesLoading} />
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Sales Data</h3>
          <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
            Export CSV
          </button>
        </div>
        <DataTable
          loading={salesLoading}
          columns={[
            { header: 'Period', accessor: (item) => {
              if (item._id.day) return `${item._id.month}/${item._id.day}/${item._id.year}`;
              if (item._id.week) return `Week ${item._id.week}, ${item._id.year}`;
              return `${item._id.month}/${item._id.year}`;
            }},
            { header: 'Revenue', accessor: (item) => formatCurrency(item.revenue) },
            { header: 'Orders', accessor: (item) => formatNumber(item.orders) },
            { header: 'Avg Order', accessor: (item) => formatCurrency(item.averageOrderValue) }
          ]}
          data={salesData?.salesData}
        />
      </div>
    </div>
  );

  const renderProductPerformanceTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Total Products" value={formatNumber(productData?.totalProducts)} icon="🛒" loading={productLoading} />
        <MetricCard title="Active Products" value={formatNumber(productData?.activeProducts)} icon="✅" loading={productLoading} />
        <MetricCard title="Low Stock" value={formatNumber(productData?.lowStockCount)} icon="⚠️" loading={productLoading} />
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
        </div>
        <DataTable
          loading={productLoading}
          columns={[
            { header: 'Product', accessor: (product) => product.name },
            { header: 'Category', accessor: (product) => product.categoryName },
            { header: 'Price', accessor: (product) => formatCurrency(product.price) },
            { header: 'Revenue', accessor: (product) => formatCurrency(product.revenue) },
            { header: 'Orders', accessor: (product) => formatNumber(product.orders) }
          ]}
          data={productData?.topProducts?.slice(0, 10)}
        />
      </div>
    </div>
  );

  const renderCustomerAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard title="Total Customers" value={formatNumber(customerData?.totalCustomers)} icon="👥" loading={customerLoading} />
        <MetricCard title="New Customers" value={formatNumber(customerData?.newCustomers)} icon="🆕" loading={customerLoading} />
        <MetricCard title="Repeat Rate" value={`${(customerData?.repeatCustomerRate || 0).toFixed(1)}%`} icon="🔁" loading={customerLoading} />
        <MetricCard title="Avg Order Value" value={formatCurrency(customerData?.avgOrderValue)} icon="💰" loading={customerLoading} />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Customer Acquisition</h3>
          <button className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors">
            View Details
          </button>
        </div>
        <BarChart 
          data={customerData?.customerAcquisition} 
          accessor={item => item.count}
          labelAccessor={item => `${item._id.month}/${item._id.year}`}
          loading={customerLoading}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Customers</h3>
        </div>
        <DataTable
          loading={customerLoading}
          columns={[
            { header: 'Customer', accessor: (customer) => customer.name },
            { header: 'Email', accessor: (customer) => customer.email },
            { header: 'Total Spent', accessor: (customer) => formatCurrency(customer.totalSpent) },
            { header: 'Orders', accessor: (customer) => formatNumber(customer.orders) }
          ]}
          data={customerData?.topCustomers?.slice(0, 8)}
        />
      </div>
    </div>
  );

  const renderFinancialReportTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard title="Total Revenue" value={formatCurrency(financialData?.totalRevenue)} icon="💰" loading={financialLoading} />
        <MetricCard title="Net Profit" value={formatCurrency(financialData?.netProfit)} icon="📈" loading={financialLoading} />
        <MetricCard title="Total Refunds" value={formatCurrency(financialData?.totalRefunds)} icon="↩️" loading={financialLoading} />
        <MetricCard title="Commission" value={formatCurrency(financialData?.totalCommission)} icon="🏦" loading={financialLoading} />
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Revenue by Seller</h3>
        </div>
        <DataTable
          loading={financialLoading}
          columns={[
            { header: 'Seller', accessor: (seller) => seller.storeName },
            { header: 'Revenue', accessor: (seller) => formatCurrency(seller.revenue) },
            { header: 'Orders', accessor: (seller) => formatNumber(seller.orders) },
            { header: 'Commission', accessor: (seller) => formatCurrency(seller.commission) }
          ]}
          data={financialData?.revenueBySeller?.slice(0, 10)}
        />
      </div>
    </div>
  );

  const tabs = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard' },
    { key: 'sales', icon: '💰', label: 'Sales' },
    { key: 'products', icon: '🛒', label: 'Products' },
    { key: 'customers', icon: '👥', label: 'Customers' },
    { key: 'financial', icon: '💳', label: 'Financial' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600">Comprehensive overview of your business performance</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex gap-3">
                <input 
                  type="date" 
                  value={dateRange.from}
                  onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <input 
                  type="date" 
                  value={dateRange.to}
                  onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 whitespace-nowrap">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.key 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        {activeTab === 'dashboard' && renderDashboardTab()}
        {activeTab === 'sales' && renderSalesReportTab()}
        {activeTab === 'products' && renderProductPerformanceTab()}
        {activeTab === 'customers' && renderCustomerAnalyticsTab()}
        {activeTab === 'financial' && renderFinancialReportTab()}
      </div>
    </div>
  );
};

export default AdminAnalyticsDashboard;