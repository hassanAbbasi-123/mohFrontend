// components/admin/orders/OrderAnalytics.js
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const OrderAnalytics = ({ data }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Status chart data
  const statusChartData = {
    labels: data.statusCounts.map(item => item.status),
    datasets: [
      {
        label: 'Number of Orders',
        data: data.statusCounts.map(item => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Top sellers chart data
  const topSellersData = {
    labels: data.topSellers.map(seller => seller.storeName),
    datasets: [
      {
        label: 'Sales Revenue',
        data: data.topSellers.map(seller => seller.total),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Top products chart data
  const topProductsData = {
    labels: data.topProducts.map(product => product.name),
    datasets: [
      {
        label: 'Quantity Sold',
        data: data.topProducts.map(product => product.totalQuantity),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6">Order Analytics</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800">Total Orders</h3>
          <p className="text-3xl font-bold text-blue-600">{data.totalOrders}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800">Total Sales</h3>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(data.totalSales)}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-800">Average Order Value</h3>
          <p className="text-3xl font-bold text-purple-600">
            {formatCurrency(data.totalSales / (data.totalOrders || 1))}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Status Chart */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Orders by Status</h3>
          <div className="h-64">
            <Pie 
              data={statusChartData} 
              options={{ 
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }} 
            />
          </div>
        </div>

        {/* Top Sellers Chart */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Top Sellers by Revenue</h3>
          <div className="h-64">
            <Bar 
              data={topSellersData} 
              options={{ 
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return formatCurrency(value);
                      },
                    },
                  },
                },
              }} 
            />
          </div>
        </div>

        {/* Top Products Chart */}
        <div className="bg-gray-50 p-4 rounded-lg lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Top Products by Quantity Sold</h3>
          <div className="h-64">
            <Bar 
              data={topProductsData} 
              options={{ 
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }} 
            />
          </div>
        </div>
      </div>

      {/* Status Counts Table */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Order Status Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.statusCounts.map((status, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                    {status.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {status.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {((status.count / data.totalOrders) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderAnalytics;