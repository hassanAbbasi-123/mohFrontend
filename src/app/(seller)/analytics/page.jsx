'use client';
import React, { useState, useEffect } from 'react';
import {
  useGetSellerDashboardQuery,
  useGetSellerSalesReportQuery,
  useGetSellerProductPerformanceQuery,
  useGetSellerOrderAnalyticsQuery,
  useGetSellerCustomerInsightsQuery,
} from '@/store/features/analyticsApi';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme,
  useMediaQuery,
  Divider,
  IconButton,
  Tooltip,
  alpha,
  Avatar,
  LinearProgress,
  styled,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  AttachMoney,
  People,
  Inventory,
  Refresh,
  Download,
  CalendarToday,
  ArrowForward,
  Analytics,
  Store,
  LocalShipping,
  PersonAdd,
} from '@mui/icons-material';

// Styled components for enhanced UI
const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.1)} 100%)`,
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  position: 'relative',
  overflow: 'visible',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
  },
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 12px 30px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

const MetricIconWrapper = styled(Box)(({ theme, color }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '50px',
  height: '50px',
  borderRadius: '12px',
  background: `linear-gradient(135deg, ${alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.05)} 100%)`,
  color: theme.palette[color]?.main || theme.palette.primary.main,
}));

const StyledDatePicker = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    background: alpha(theme.palette.background.paper, 0.7),
    '&:hover fieldset': {
      borderColor: alpha(theme.palette.primary.main, 0.5),
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
}));

const AnimatedProgress = styled(LinearProgress)(({ theme, value }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    backgroundColor: value > 70 ? theme.palette.success.main : 
                    value > 40 ? theme.palette.warning.main : 
                    theme.palette.error.main,
    transition: 'width 0.5s ease-in-out',
  },
}));

// Generate mock data for development
const generateMockData = () => {
  const mockDashboard = {
    overview: {
      totalRevenue: 15250,
      totalOrders: 245,
      averageOrderValue: 62.24,
      conversionRate: 3.2
    },
    salesData: Array.from({ length: 30 }, (_, i) => ({
      _id: { day: i + 1, month: 12, year: 2024 },
      revenue: Math.floor(Math.random() * 1000) + 500,
      orders: Math.floor(Math.random() * 20) + 5
    }))
  };

  const mockSalesReport = Array.from({ length: 15 }, (_, i) => ({
    _id: { day: i + 1, month: 12, year: 2024 },
    revenue: Math.floor(Math.random() * 2000) + 1000,
    orders: Math.floor(Math.random() * 30) + 10
  }));

  const mockProducts = [
    { name: 'Premium Wireless Headphones', revenue: 4250, quantity: 85, orders: 65 },
    { name: 'Smart Watch Series 5', revenue: 3850, quantity: 55, orders: 50 },
    { name: 'Laptop Backpack', revenue: 2250, quantity: 150, orders: 145 },
    { name: 'USB-C Charging Cable', revenue: 1850, quantity: 370, orders: 365 },
    { name: 'Wireless Mouse', revenue: 1650, quantity: 110, orders: 105 }
  ];

  const mockOrders = [
    { _id: 'pending', count: 15 },
    { _id: 'processing', count: 25 },
    { _id: 'shipped', count: 35 },
    { _id: 'delivered', count: 120 },
    { _id: 'cancelled', count: 5 }
  ];

  const mockCustomers = {
    totalCustomers: 185,
    repeatPurchaseRate: 42,
    topCustomers: [
      { name: 'John Smith', orders: 12, totalSpent: 1250 },
      { name: 'Emma Wilson', orders: 8, totalSpent: 980 },
      { name: 'Robert Johnson', orders: 6, totalSpent: 750 }
    ]
  };

  return {
    dashboard: mockDashboard,
    sales: mockSalesReport,
    products: mockProducts,
    orders: mockOrders,
    customers: mockCustomers
  };
};

// Custom Date Range Selector Component
const DateRangeSelector = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => {
  const theme = useTheme();
  
  return (
    <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" mb={3}>
      <Box>
        <Typography variant="body2" gutterBottom color="textSecondary" fontWeight="500">
          Start Date
        </Typography>
        <DatePicker
          selected={startDate}
          onChange={onStartDateChange}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          customInput={
            <StyledDatePicker 
              size="small" 
              variant="outlined" 
              fullWidth
              InputProps={{
                startAdornment: <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />,
              }}
              sx={{ minWidth: 200 }}
            />
          }
        />
      </Box>
      <Box>
        <Typography variant="body2" gutterBottom color="textSecondary" fontWeight="500">
          End Date
        </Typography>
        <DatePicker
          selected={endDate}
          onChange={onEndDateChange}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          customInput={
            <StyledDatePicker 
              size="small" 
              variant="outlined" 
              fullWidth
              InputProps={{
                startAdornment: <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />,
              }}
              sx={{ minWidth: 200 }}
            />
          }
        />
      </Box>
    </Box>
  );
};

// Custom Card Component for Metrics
const MetricCard = ({ title, value, change, isPositive, isLoading, icon, color = 'primary', subtitle }) => {
  const theme = useTheme();
  
  return (
    <GradientCard sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3, position: 'relative', height: '100%' }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" height="100%">
          <Box flex="1">
            <Typography color="textSecondary" gutterBottom variant="body2" fontWeight="500">
              {title}
            </Typography>
            {isLoading ? (
              <CircularProgress size={24} />
            ) : (
              <>
                <Typography variant="h4" component="div" fontWeight="700" color="text.primary" sx={{ mb: 0.5 }}>
                  {value}
                </Typography>
                {subtitle && (
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    {subtitle}
                  </Typography>
                )}
                {change !== undefined && (
                  <Box display="flex" alignItems="center" mt={1}>
                    <Chip
                      icon={isPositive ? <TrendingUp /> : <TrendingDown />}
                      label={`${isPositive ? '+' : ''}${change}%`}
                      size="small"
                      color={isPositive ? 'success' : 'error'}
                      variant="outlined"
                      sx={{ fontWeight: 600, borderRadius: 1 }}
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
          <MetricIconWrapper color={color}>
            {React.cloneElement(icon, { sx: { fontSize: 24 } })}
          </MetricIconWrapper>
        </Box>
      </CardContent>
    </GradientCard>
  );
};

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label, formatter }) => {
  const theme = useTheme();
  
  if (active && payload && payload.length) {
    return (
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          background: alpha(theme.palette.background.paper, 0.95),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          borderRadius: 2,
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
        }}
      >
        <Typography variant="body2" fontWeight="600" gutterBottom color="primary">
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography key={index} variant="body2" sx={{ color: entry.color, mt: 0.5 }} fontWeight="500">
            {entry.name}: {formatter ? formatter(entry.value) : entry.value}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

// Main Dashboard Component
const SellerAnalyticsDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  
  // State for date filters
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(),
  });
  
  // State for sales report grouping
  const [salesGroupBy, setSalesGroupBy] = useState('day');
  
  // Mock data for development
  const mockData = generateMockData();
  
  // Format dates for API
  const formatDateForAPI = (date) => {
    return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
  };

  // Fetch all analytics data
  const {
    data: dashboardData,
    error: dashboardError,
    isLoading: dashboardLoading,
    refetch: refetchDashboard,
  } = useGetSellerDashboardQuery({
    from: formatDateForAPI(dateRange.startDate),
    to: formatDateForAPI(dateRange.endDate),
  });
  
  const {
    data: salesData,
    error: salesError,
    isLoading: salesLoading,
    refetch: refetchSales,
  } = useGetSellerSalesReportQuery({
    from: formatDateForAPI(dateRange.startDate),
    to: formatDateForAPI(dateRange.endDate),
    groupBy: salesGroupBy,
  });
  
  const {
    data: productData,
    error: productError,
    isLoading: productLoading,
    refetch: refetchProduct,
  } = useGetSellerProductPerformanceQuery({
    from: formatDateForAPI(dateRange.startDate),
    to: formatDateForAPI(dateRange.endDate),
  });
  
  const {
    data: orderData,
    error: orderError,
    isLoading: orderLoading,
    refetch: refetchOrder,
  } = useGetSellerOrderAnalyticsQuery({
    from: formatDateForAPI(dateRange.startDate),
    to: formatDateForAPI(dateRange.endDate),
  });
  
  const {
    data: customerData,
    error: customerError,
    isLoading: customerLoading,
    refetch: refetchCustomer,
  } = useGetSellerCustomerInsightsQuery({
    from: formatDateForAPI(dateRange.startDate),
    to: formatDateForAPI(dateRange.endDate),
  });
  
  // Check for errors and fallback to mock data if needed
  useEffect(() => {
    const hasApiError = dashboardError || salesError || productError || orderError || customerError;
    if (hasApiError && !isUsingMockData) {
      console.warn('API endpoints not available, switching to mock data');
      setIsUsingMockData(true);
    }
  }, [dashboardError, salesError, productError, orderError, customerError, isUsingMockData]);

  // Use mock data if API calls fail
  const dashboard = isUsingMockData || dashboardError ? mockData.dashboard : dashboardData;
  const sales = isUsingMockData || salesError ? mockData.sales : salesData;
  const products = isUsingMockData || productError ? mockData.products : productData?.topProducts;
  const orders = isUsingMockData || orderError ? mockData.orders : orderData?.orderStatusDistribution;
  const customers = isUsingMockData || customerError ? mockData.customers : customerData;

  // Handle date changes
  const handleStartDateChange = (date) => {
    setDateRange({ ...dateRange, startDate: date });
  };
  
  const handleEndDateChange = (date) => {
    setDateRange({ ...dateRange, endDate: date });
  };
  
  // Handle refetching all data
  const handleApplyFilters = () => {
    if (isUsingMockData) {
      // Generate new mock data on refresh
      const newMockData = generateMockData();
      Object.assign(mockData, newMockData);
    } else {
      refetchDashboard();
      refetchSales();
      refetchProduct();
      refetchOrder();
      refetchCustomer();
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Prepare data for charts
  const salesChartData = sales?.map(item => ({
    period: salesGroupBy === 'day' 
      ? `${item._id?.month || 12}/${item._id?.day || 1}` 
      : salesGroupBy === 'week' 
        ? `Week ${item._id?.week || 1}` 
        : `${item._id?.year || 2024}-${item._id?.month || 12}`,
    sales: item.revenue || 0,
    orders: item.orders || 0
  })) || [];

  const topProductsData = products?.slice(0, 5) || [];
  const orderStatusData = orders?.map(item => ({
    status: item._id,
    count: item.count
  })) || [];

  const customerLocationData = customers?.customerLocation?.slice(0, 5) || [];
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];
  const STATUS_COLORS = {
    'pending': '#FFB74D',
    'processing': '#4FC3F7',
    'completed': '#81C784',
    'cancelled': '#E57373',
    'shipped': '#64B5F6',
    'delivered': '#4DB6AC'
  };
  
  // Customer acquisition data for radial chart
  const customerAcquisitionData = [
    { name: 'New', value: 65, fill: theme.palette.primary.main },
    { name: 'Returning', value: 35, fill: theme.palette.secondary.main },
  ];
  
  // Render loading state
  if (!isUsingMockData && dashboardLoading && salesLoading && productLoading && orderLoading && customerLoading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" style={{ minHeight: '60vh', marginLeft: '12px' }}>
        <CircularProgress size={60} thickness={4} sx={{ color: 'primary.main' }} />
        <Typography variant="h6" color="textSecondary" sx={{ mt: 2 }}>
          Loading analytics data...
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ 
      p: isSmallMobile ? 2 : 3, 
      background: theme.palette.background.default, 
      minHeight: '100vh',
      marginLeft: '12px'
    }}>
      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" mb={4}>
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Analytics sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h4" fontWeight="800" gutterBottom color="primary">
              Analytics Dashboard
            </Typography>
            {isUsingMockData && (
              <Chip 
                label="Demo Mode" 
                color="warning" 
                size="small" 
                variant="outlined"
                sx={{ ml: 2 }}
              />
            )}
          </Box>
          <Typography variant="body1" color="textSecondary" sx={{ maxWidth: '600px', marginLeft: '4px' }}>
            Track your business performance and make data-driven decisions with real-time insights
          </Typography>
        </Box>
        <Box display="flex" gap={1} mt={isSmallMobile ? 2 : 0}>
          <Tooltip title="Refresh data">
            <IconButton 
              onClick={handleApplyFilters} 
              sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
                borderRadius: 2,
                '&:hover': {
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.3)} 0%, ${alpha(theme.palette.secondary.main, 0.3)} 100%)`,
                }
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<Download />}
            sx={{ 
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            Export Report
          </Button>
        </Box>
      </Box>
      
      {/* Show warning if using mock data */}
      {isUsingMockData && (
        <Alert 
          severity="info" 
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => setIsUsingMockData(false)}>
              Try API Again
            </Button>
          }
        >
          Using demo data. Connect to your backend API to see real analytics.
        </Alert>
      )}
      
      {/* Date Range Selector */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          boxShadow: `0 5px 15px ${alpha(theme.palette.primary.main, 0.05)}`,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" mb={2}>
          <Typography variant="h6" fontWeight="600" color="primary">
            Filter Data
          </Typography>
          <Chip 
            label={`Last ${Math.floor((dateRange.endDate - dateRange.startDate) / (1000 * 60 * 60 * 24))} days`} 
            variant="outlined" 
            size="small" 
            color="primary"
          />
        </Box>
        <DateRangeSelector
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
        />
        <Button 
          variant="contained" 
          onClick={handleApplyFilters}
          sx={{ 
            borderRadius: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
          }}
        >
          Apply Filters
        </Button>
      </Paper>
      
      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(dashboard?.overview?.totalRevenue || 0)}
            change={10}
            isPositive={true}
            isLoading={dashboardLoading && !isUsingMockData}
            icon={<AttachMoney />}
            color="primary"
            subtitle="All-time earnings"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Orders"
            value={dashboard?.overview?.totalOrders || 0}
            change={5}
            isPositive={true}
            isLoading={dashboardLoading && !isUsingMockData}
            icon={<ShoppingCart />}
            color="secondary"
            subtitle="Completed orders"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Avg Order Value"
            value={formatCurrency(dashboard?.overview?.averageOrderValue || 0)}
            change={2}
            isPositive={true}
            isLoading={dashboardLoading && !isUsingMockData}
            icon={<Store />}
            color="success"
            subtitle="Per transaction"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Conversion Rate"
            value={`${dashboard?.overview?.conversionRate || 3.2}%`}
            change={8}
            isPositive={true}
            isLoading={dashboardLoading && !isUsingMockData}
            icon={<TrendingUp />}
            color="info"
            subtitle="Visitor to customer"
          />
        </Grid>
      </Grid>
      
      {/* Sales Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <GradientCard>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" mb={3}>
                <Typography variant="h6" fontWeight="600" color="primary">
                  Sales Trend
                </Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Group By</InputLabel>
                  <Select
                    value={salesGroupBy}
                    label="Group By"
                    onChange={(e) => setSalesGroupBy(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="day">Daily</MenuItem>
                    <MenuItem value="week">Weekly</MenuItem>
                    <MenuItem value="month">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
                    <XAxis dataKey="period" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <RechartsTooltip content={<CustomTooltip formatter={formatCurrency} />} />
                    <Area type="monotone" dataKey="sales" stroke={theme.palette.primary.main} fillOpacity={1} fill="url(#colorSales)" />
                    <Area type="monotone" dataKey="orders" stroke={theme.palette.secondary.main} fillOpacity={1} fill="url(#colorOrders)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </GradientCard>
        </Grid>
        
        {/* Customer Acquisition Chart */}
        <Grid item xs={12} lg={4}>
          <GradientCard sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight="600" color="primary">
                  Customer Acquisition
                </Typography>
                <IconButton size="small">
                  <ArrowForward />
                </IconButton>
              </Box>
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="40%" outerRadius="100%" barSize={16} data={customerAcquisitionData}>
                    <RadialBar minAngle={15} background clockWise dataKey="value" />
                    <RechartsTooltip />
                    <Legend 
                      iconSize={10} 
                      layout="vertical" 
                      verticalAlign="middle" 
                      wrapperStyle={{ right: 0, fontSize: '12px' }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </Box>
              <Box textAlign="center" mt={2}>
                <Typography variant="h6" fontWeight="700">
                  {customers?.totalCustomers || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Customers
                </Typography>
              </Box>
            </CardContent>
          </GradientCard>
        </Grid>
      </Grid>
      
      {/* Order Status and Customer Insights */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Order Status Distribution */}
        <Grid item xs={12} md={6}>
          <GradientCard sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <LocalShipping sx={{ color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="600" color="primary">
                  Order Status Distribution
                </Typography>
              </Box>
              <Box sx={{ height: 300, mt: 2, flex: 1 }}>
                {orderStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={orderStatusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
                      <XAxis dataKey="status" stroke={theme.palette.text.secondary} />
                      <YAxis stroke={theme.palette.text.secondary} />
                      <RechartsTooltip />
                      <Bar 
                        dataKey="count" 
                        radius={[4, 4, 0, 0]}
                        fill={theme.palette.primary.main}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100%">
                    <ShoppingCart sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" color="textSecondary" align="center">
                      No order data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </GradientCard>
        </Grid>
        
        {/* Customer Insights */}
        <Grid item xs={12} md={6}>
          <GradientCard sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <People sx={{ color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="600" color="primary">
                  Customer Insights
                </Typography>
              </Box>
              {customerLoading && !isUsingMockData ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={300} flex={1}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, background: alpha(theme.palette.primary.main, 0.1), borderRadius: 3 }}>
                        <PersonAdd sx={{ color: 'primary.main', mb: 1, fontSize: 32 }} />
                        <Typography variant="h4" fontWeight="700">
                          {customers?.totalCustomers || 0}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Total Customers
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, background: alpha(theme.palette.success.main, 0.1), borderRadius: 3 }}>
                        <TrendingUp sx={{ color: 'success.main', mb: 1, fontSize: 32 }} />
                        <Typography variant="h4" fontWeight="700">
                          {customers?.repeatPurchaseRate || 0}%
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Repeat Rate
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  {customers?.topCustomers && customers.topCustomers.length > 0 && (
                    <>
                      <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                        Top Customers
                      </Typography>
                      <TableContainer sx={{ flex: 1 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Customer</TableCell>
                              <TableCell align="right">Orders</TableCell>
                              <TableCell align="right">Value</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {customers.topCustomers.slice(0, 3).map((customer, index) => (
                              <TableRow key={index} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell>
                                  <Box display="flex" alignItems="center">
                                    <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: COLORS[index % COLORS.length] }}>
                                      {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
                                    </Avatar>
                                    {customer.name || 'Unknown Customer'}
                                  </Box>
                                </TableCell>
                                <TableCell align="right">{customer.orders}</TableCell>
                                <TableCell align="right">{formatCurrency(customer.totalSpent)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </GradientCard>
        </Grid>
      </Grid>
      
      {/* Product Performance Table */}
      <GradientCard>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Inventory sx={{ color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="600" color="primary">
                Product Performance
              </Typography>
            </Box>
            <Button variant="outlined" size="small" endIcon={<ArrowForward />} sx={{ borderRadius: 2 }}>
              View All
            </Button>
          </Box>
          {productLoading && !isUsingMockData ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
              <CircularProgress />
            </Box>
          ) : topProductsData && topProductsData.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Units Sold</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">Orders</TableCell>
                    <TableCell align="center">Performance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topProductsData.map((product, index) => {
                    const performance = Math.min(100, (product.revenue / (topProductsData[0]?.revenue || 1)) * 100);
                    return (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Typography fontWeight="600">{product.name}</Typography>
                        </TableCell>
                        <TableCell align="right">{product.quantity || 0}</TableCell>
                        <TableCell align="right">{formatCurrency(product.revenue || 0)}</TableCell>
                        <TableCell align="right">{product.orders || 0}</TableCell>
                        <TableCell align="center" sx={{ width: 100 }}>
                          <Box display="flex" alignItems="center">
                            <AnimatedProgress 
                              variant="determinate" 
                              value={performance} 
                              sx={{ flexGrow: 1, mr: 1 }} 
                            />
                            <Typography variant="body2" color="textSecondary">
                              {Math.round(performance)}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" py={6}>
              <Inventory sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No products found
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center">
                There are no product performance data available for the selected period.
              </Typography>
            </Box>
          )}
        </CardContent>
      </GradientCard>
    </Box>
  );
};

// Wrapped component with ProtectedRoute
const ProtectedSellerAnalyticsDashboard = () => {
  return (
    <ProtectedRoute allowedRoles={["seller"]}>
      <SellerAnalyticsDashboard />
    </ProtectedRoute>
  );
};

export default ProtectedSellerAnalyticsDashboard;