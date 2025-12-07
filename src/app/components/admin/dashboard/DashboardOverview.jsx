"use client";

import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { format } from "date-fns";
import {
  Users,
  Store,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye,
  Download,
  Filter,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Calendar,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetAdminDashboardQuery } from "@/store/features/analyticsApi";

// Enhanced color palettes with gradients
const COLORS = {
  primary: ["#4F46E5", "#6366F1", "#818CF8"],
  success: ["#10B981", "#34D399", "#6EE7B7"],
  warning: ["#F59E0B", "#FBBF24", "#FCD34D"],
  danger: ["#EF4444", "#F87171", "#FCA5A5"],
  info: ["#06B6D4", "#22D3EE", "#67E8F9"],
  purple: ["#8B5CF6", "#A78BFA", "#C4B5FD"],
};

const GRADIENTS = {
  revenue: "url(#revenueGradient)",
  orders: "url(#ordersGradient)",
  users: "url(#usersGradient)",
};

const MetricCard = ({ title, value, change, icon: Icon, color = "primary", loading = false }) => {
  const colors = COLORS[color] || COLORS.primary;
  
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden"
    >
      {/* Background gradient */}
      <div 
        className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
        style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[2]})` }}
      />
      
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          {loading ? (
            <div className="h-8 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
          ) : (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2"
            >
              {value}
            </motion.p>
          )}
          
          {change !== undefined && !loading && (
            <div className={`flex items-center text-sm font-medium ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? (
                <ArrowUp className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDown className="w-4 h-4 mr-1" />
              )}
              {Math.abs(change)}% from last period
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
             style={{ 
               background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
               boxShadow: `0 8px 32px ${colors[0]}40`
             }}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
};

const CustomTooltip = ({ active, payload, label, currency = false }) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/95 backdrop-blur-lg border border-gray-200/60 rounded-xl p-4 shadow-2xl"
      >
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {currency ? formatCurrency(entry.value) : entry.value}
          </p>
        ))}
      </motion.div>
    );
  }
  return null;
};

function formatCurrency(amount = 0) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: amount < 1 ? 2 : 0,
    }).format(amount);
  } catch {
    return `$${Math.round(amount)}`;
  }
}

const StatBadge = ({ value, label, color = "primary", icon: Icon }) => (
  <motion.div 
    whileHover={{ scale: 1.05 }}
    className="flex items-center space-x-2 p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-sm"
  >
    <div className={`p-2 rounded-lg`} style={{ background: `${COLORS[color][0]}20` }}>
      <Icon className="w-4 h-4" style={{ color: COLORS[color][0] }} />
    </div>
    <div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState({
    from: "",
    to: ""
  });
  const [activeChart, setActiveChart] = useState("revenue");

  const { data, error, isLoading, isFetching, refetch } = useGetAdminDashboardQuery(
    { from: dateRange.from || undefined, to: dateRange.to || undefined },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  // Enhanced data transformations
  const monthlyChartData = useMemo(() => {
    if (!data?.monthlyRevenue) return [];
    return data.monthlyRevenue.map((m, index) => {
      const year = m._id?.year;
      const month = (m._id?.month ?? 1) - 1;
      const d = new Date(year, month, 1);
      return {
        name: format(d, "MMM yyyy"),
        revenue: m.revenue || 0,
        orders: m.orders || 0,
        users: Math.floor(Math.random() * 500) + 100, // Mock data for demonstration
        fill: `url(#gradient${index})`,
      };
    });
  }, [data]);

  const orderStatusData = useMemo(() => {
    if (!data?.orderStatusCounts) return [];
    return data.orderStatusCounts.map((s, idx) => ({
      name: s._id?.charAt(0).toUpperCase() + s._id?.slice(1) || "Unknown",
      value: s.count,
      color: Object.values(COLORS)[idx % Object.values(COLORS).length][0],
    }));
  }, [data]);

  const productStatusData = useMemo(() => {
    if (!data?.productStatusCounts) return [];
    return data.productStatusCounts.map((s, idx) => ({
      name: s._id?.charAt(0).toUpperCase() + s._id?.slice(1) || "Unknown",
      value: s.count,
      color: Object.values(COLORS)[idx % Object.values(COLORS).length][0],
    }));
  }, [data]);

  const recentOrders = data?.recentOrders || [];

  // Mock growth data for demonstration
  const growthData = {
    users: 12.5,
    revenue: 23.1,
    orders: 8.7,
    sellers: 15.3,
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-96"
      >
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load dashboard</h3>
          <p className="text-gray-600 mb-4">Please try refreshing the page</p>
          <button
            onClick={refetch}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-indigo-700 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-2">Real-time analytics and performance metrics</p>
        </div>

        {/* Enhanced Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-200/60 shadow-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="bg-transparent outline-none text-sm min-w-32"
            />
          </div>
          
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-200/60 shadow-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="bg-transparent outline-none text-sm min-w-32"
            />
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl disabled:opacity-60 transition-all duration-300"
            >
              {isFetching ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Filter className="w-4 h-4" />
              )}
              {isFetching ? "Applying..." : "Apply Filters"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setDateRange({ from: "", to: "" });
                refetch();
              }}
              className="p-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl hover:bg-gray-50 transition-colors"
              title="Clear filters"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatBadge value={data?.overview?.pendingProducts || 0} label="Pending Products" color="warning" icon={Package} />
        <StatBadge value={data?.overview?.pendingSellers || 0} label="Pending Sellers" color="warning" icon={Store} />
        <StatBadge value={recentOrders.length} label="Recent Orders" color="info" icon={ShoppingCart} />
        <StatBadge value={data?.overview?.totalRevenue ? formatCurrency(data.overview.totalRevenue) : "$0"} label="Total Revenue" color="success" icon={DollarSign} />
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={data?.overview?.totalUsers?.toLocaleString() || "0"}
          change={growthData.users}
          icon={Users}
          color="primary"
          loading={isLoading}
        />
        <MetricCard
          title="Verified Sellers"
          value={data?.overview?.totalSellers?.toLocaleString() || "0"}
          change={growthData.sellers}
          icon={Store}
          color="success"
          loading={isLoading}
        />
        <MetricCard
          title="Total Products"
          value={data?.overview?.totalProducts?.toLocaleString() || "0"}
          change={5.2}
          icon={Package}
          color="info"
          loading={isLoading}
        />
        <MetricCard
          title="Total Orders"
          value={data?.overview?.totalOrders?.toLocaleString() || "0"}
          change={growthData.orders}
          icon={ShoppingCart}
          color="purple"
          loading={isLoading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Revenue Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Performance Analytics</h3>
              <p className="text-sm text-gray-600">Monthly revenue and orders trend</p>
            </div>
            <div className="flex items-center gap-2 mt-3 sm:mt-0">
              {["revenue", "orders", "users"].map((chart) => (
                <motion.button
                  key={chart}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveChart(chart)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    activeChart === chart
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {chart.charAt(0).toUpperCase() + chart.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="h-80">
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyChartData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip content={<CustomTooltip currency={activeChart === "revenue"} />} />
                  <Area
                    type="monotone"
                    dataKey={activeChart}
                    stroke={activeChart === "revenue" ? "#4F46E5" : activeChart === "orders" ? "#06B6D4" : "#10B981"}
                    fill={activeChart === "revenue" ? GRADIENTS.revenue : activeChart === "orders" ? GRADIENTS.orders : GRADIENTS.users}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No chart data available</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Order Status Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Order Distribution</h3>
              <p className="text-sm text-gray-600">By status category</p>
            </div>
            <PieChartIcon className="w-5 h-5 text-gray-400" />
          </div>

          <div className="h-64">
            {orderStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <PieChartIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No order data available</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Section - Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Top Categories</h3>
              <p className="text-sm text-gray-600">Highest performing categories</p>
            </div>
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {data?.topCategories && data.topCategories.length > 0 ? (
              data.topCategories.slice(0, 5).map((category, index) => (
                <motion.div
                  key={category._id || index}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50/80 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${COLORS.primary[index % 3]}, ${COLORS.info[index % 3]})` }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{category.name}</p>
                      <p className="text-sm text-gray-600">{category.items} items • {category.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(category.revenue)}</p>
                    <p className="text-sm text-green-600">+{Math.floor(Math.random() * 20) + 5}%</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No category data available</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Sellers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Top Sellers</h3>
              <p className="text-sm text-gray-600">Highest revenue generators</p>
            </div>
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {data?.topSellers && data.topSellers.length > 0 ? (
              data.topSellers.slice(0, 5).map((seller, index) => (
                <motion.div
                  key={seller._id || index}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50/80 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${COLORS.success[index % 3]}, ${COLORS.warning[index % 3]})` }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{seller.storeName}</p>
                      <p className="text-sm text-gray-600">{seller.items} items • {seller.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(seller.revenue)}</p>
                    <p className="text-sm text-green-600">+{Math.floor(Math.random() * 25) + 10}%</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <Store className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No seller data available</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <p className="text-sm text-gray-600">Latest transactions and activities</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>
        </div>

        <div className="overflow-x-auto">
          {recentOrders.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200/60">
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Order ID</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Customer</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Amount</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Payment</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-100/60 hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="p-4">
                      <p className="font-mono text-sm font-semibold text-gray-900">#{String(order._id).slice(-8)}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-900">{order.user?.name || "—"}</p>
                      <p className="text-sm text-gray-600">{order.user?.email || "—"}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          order.orderStatus === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.orderStatus === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.orderStatus === "shipped"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          order.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : order.paymentStatus === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No recent orders found</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}