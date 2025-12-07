// app/customer/dashboard/page.js
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useGetMyLedgerQuery, // Added this
  useGetCustomerTransactionsQuery,
  useDownloadLedgerPDFMutation,
} from "@/store/features/accountsApi";

import {
  Users,
  DollarSign,
  ShoppingCart,
  CreditCard,
  Download,
  Calendar,
  Package,
  Receipt,
  LogOut,
  RefreshCw,
  FileText,
  CheckCircle,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("transactions");

  // RTK Query Hooks
  const {
    data: ledgerResponse,
    isLoading: ledgerLoading,
    error: ledgerError,
    refetch: refetchLedger,
  } = useGetMyLedgerQuery();

  const {
    data: transactionsResponse,
    isLoading: transactionsLoading,
  } = useGetCustomerTransactionsQuery();

  const [downloadMyLedgerPDF, { isLoading: downloadingPDF }] = useDownloadLedgerPDFMutation();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        if (parsedUser.role !== 'customer') {
          router.push('/');
        }
      } else {
        router.push('/');
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/");
  };

  const handleDownloadPDF = async () => {
    try {
      // Pass the customer ID for PDF download
      await downloadMyLedgerPDF(user?.customerId || user?._id).unwrap();
    } catch (error) {
      alert("Error downloading PDF");
    }
  };

  const handleRefresh = () => {
    refetchLedger();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  const ledgerData = ledgerResponse?.data;
  const transactions = transactionsResponse?.data?.transactions || [];
  const customer = ledgerData?.customer || user;

  // Calculate additional stats
  const totalPurchases = ledgerData?.summary?.totalPurchases || 0;
  const totalPayments = ledgerData?.summary?.totalPayments || 0;
  const currentBalance = ledgerData?.summary?.currentBalance || 0;
  
  // Filter transactions by type
  const purchaseTransactions = transactions.filter(t => t.type === 'purchase');
  const paymentTransactions = transactions.filter(t => t.type === 'payment');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {customer.name}
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">ID: {customer.customerId}</span>
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Active Account
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={ledgerLoading}
                className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${ledgerLoading ? 'animate-spin' : ''}`} />
                <span className="font-medium">Refresh</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                disabled={downloadingPDF}
                className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-indigo-500/25"
              >
                <Download className="w-4 h-4" />
                <span className="font-medium">
                  {downloadingPDF ? "Downloading..." : "Download PDF"}
                </span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 shadow-lg shadow-red-500/25"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Purchases</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{totalPurchases.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">{purchaseTransactions.length} transactions</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Payments</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{totalPayments.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">{paymentTransactions.length} payments</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Current Balance</p>
                <p className={`text-2xl font-bold ${
                  currentBalance > 0 
                    ? 'text-red-600' 
                    : currentBalance < 0 
                    ? 'text-green-600' 
                    : 'text-gray-900'
                }`}>
                  ₹{Math.abs(currentBalance).toLocaleString()}
                </p>
                <p className={`text-xs font-medium mt-1 ${
                  currentBalance > 0 ? 'text-red-600' : 
                  currentBalance < 0 ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {currentBalance > 0 ? 'Amount Due' : 
                   currentBalance < 0 ? 'Credit Balance' : 'Fully Settled'}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${
                currentBalance > 0 ? 'bg-red-100' : 
                currentBalance < 0 ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <DollarSign className={`w-6 h-6 ${
                  currentBalance > 0 ? 'text-red-600' : 
                  currentBalance < 0 ? 'text-green-600' : 'text-gray-600'
                }`} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Account Since</p>
                <p className="text-lg font-bold text-gray-900">
                  {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Member</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="border-b border-gray-200 bg-gray-50/50">
            <nav className="flex">
              {[
                { id: "transactions", name: "Purchase History", icon: Receipt, count: transactions.length },
                { id: "profile", name: "Account Details", icon: User },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-4 border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? "border-indigo-600 text-indigo-600 bg-white"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-white"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                  {tab.count && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      activeTab === tab.id
                        ? "bg-indigo-100 text-indigo-600"
                        : "bg-gray-200 text-gray-600"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "transactions" && (
              <TransactionHistory 
                transactions={transactions} 
                loading={transactionsLoading}
                customer={customer}
              />
            )}

            {activeTab === "profile" && (
              <ProfileInfo customer={customer} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Transaction History Component
function TransactionHistory({ transactions, loading, customer }) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading your purchase history...</p>
        <p className="text-gray-400 text-sm mt-1">Please wait while we fetch your data</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-xl font-medium mb-2">No transactions yet</p>
        <p className="text-gray-400 max-w-md mx-auto">
          Your purchase history and payment records will appear here once you start shopping with us.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Purchase & Payment History</h3>
          <p className="text-gray-600 mt-1">Complete record of all your transactions</p>
        </div>
        <div className="text-sm text-gray-500">
          Showing {transactions.length} transactions
        </div>
      </div>

      <div className="space-y-4">
        {transactions.map((transaction) => (
          <TransactionCard 
            key={transaction._id} 
            transaction={transaction} 
          />
        ))}
      </div>
    </div>
  );
}

// Transaction Card Component
function TransactionCard({ transaction }) {
  const [showItems, setShowItems] = useState(false);
  
  const isPurchase = transaction.type === 'purchase';
  const paidAmount = isPurchase ? transaction.paidAmount : transaction.amount;
  const remainingAmount = isPurchase ? (transaction.amount - paidAmount) : 0;

  return (
    <div className="border border-gray-200 rounded-2xl p-6 bg-white hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl ${
            isPurchase ? 'bg-blue-50 border border-blue-100' : 'bg-green-50 border border-green-100'
          }`}>
            {isPurchase ? (
              <ShoppingCart className={`w-5 h-5 ${isPurchase ? 'text-blue-600' : 'text-green-600'}`} />
            ) : (
              <CreditCard className="w-5 h-5 text-green-600" />
            )}
          </div>
          
          <div>
            <div className="flex items-center gap-3">
              <h4 className={`text-lg font-bold capitalize ${
                isPurchase ? 'text-blue-700' : 'text-green-700'
              }`}>
                {isPurchase ? 'Purchase' : 'Payment Received'}
              </h4>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                isPurchase 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {isPurchase ? 'PURCHASE' : 'PAYMENT'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className={`text-2xl font-bold ${
            isPurchase ? 'text-blue-600' : 'text-green-600'
          }`}>
            {isPurchase ? '-' : '+'}₹{transaction.amount?.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Balance: ₹{transaction.remainingBalance?.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Amount</p>
          <p className="text-lg font-semibold text-gray-900">₹{transaction.amount?.toLocaleString()}</p>
        </div>
        
        {isPurchase && (
          <>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Paid Amount</p>
              <p className="text-lg font-semibold text-green-600">₹{paidAmount?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Remaining</p>
              <p className={`text-lg font-semibold ${remainingAmount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                ₹{remainingAmount?.toLocaleString()}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Note */}
      {transaction.note && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 flex items-start gap-2">
            <span className="mt-0.5">📝</span>
            <span>{transaction.note}</span>
          </p>
        </div>
      )}

      {/* Purchase Items */}
      {isPurchase && transaction.items && transaction.items.length > 0 && (
        <div>
          <button
            onClick={() => setShowItems(!showItems)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 mb-3"
          >
            <Package className="w-4 h-4" />
            {transaction.items.length} Item{transaction.items.length > 1 ? 's' : ''} Purchased
            <span className={`transform transition-transform ${showItems ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {showItems && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transaction.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-xs text-gray-500 capitalize">{item.category}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{item.quantity}</span>
                        <span className="text-xs text-gray-500 ml-1">{item.unit}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">₹{item.pricePerUnit?.toLocaleString()}</span>
                        <span className="text-xs text-gray-500 ml-1">/{item.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-gray-900">₹{item.total?.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Profile Info Component
function ProfileInfo({ customer }) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Account Information</h3>
        <p className="text-gray-600">Your personal details and account summary</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Personal Details
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500">Full Name</span>
              <span className="text-sm font-semibold text-gray-900">{customer.name}</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500">Customer ID</span>
              <span className="font-mono text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                {customer.customerId}
              </span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone
              </span>
              <span className="text-sm font-semibold text-gray-900">{customer.phone}</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {customer.email || 'Not provided'}
              </span>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-medium text-gray-500">Account Status</span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            Address Details
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-start justify-between py-3">
              <span className="text-sm font-medium text-gray-500">Delivery Address</span>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900 max-w-xs">
                  {customer.address || 'No address provided'}
                </p>
                {!customer.address && (
                  <p className="text-xs text-gray-400 mt-1">
                    Please update your address for delivery
                  </p>
                )}
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Account Created</p>
                  <p className="text-sm text-blue-700 mt-1">
                    {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}