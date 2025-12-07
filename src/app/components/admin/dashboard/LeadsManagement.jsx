"use client";
import { useState, useEffect } from "react";
import {
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    Package,
    Search,
    Users,
    TrendingUp,
    DollarSign,
    Edit,
    MoreVertical,
    RefreshCw,
    Shield,
    Eye,
    CreditCard,
    MessageCircle,
} from "lucide-react";
import {
    useGetPendingLeadsQuery,
    useGetAllLeadsQuery,
    useGetLeadAnalyticsQuery,
    useApproveLeadMutation,
    useGetPendingPaymentsQuery,
    useVerifyPaymentMutation,
} from "@/store/features/leadsApi";

export default function LeadsManagement() {
    const [activeTab, setActiveTab] = useState("pending");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedLead, setSelectedLead] = useState(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [approveData, setApproveData] = useState({
        lead_price: "",
        max_sellers: 1
    });

    // RTK Query Hooks
    const {
        data: pendingLeadsResponse,
        isLoading: pendingLoading,
        error: pendingError,
        refetch: refetchPending
    } = useGetPendingLeadsQuery();

    const {
        data: allLeadsResponse,
        isLoading: allLeadsLoading,
        error: allLeadsError,
        refetch: refetchAllLeads
    } = useGetAllLeadsQuery();

    const {
        data: analyticsData,
        isLoading: analyticsLoading,
        error: analyticsError,
        refetch: refetchAnalytics
    } = useGetLeadAnalyticsQuery();

    const {
        data: pendingPaymentsResponse,
        isLoading: paymentsLoading,
        error: paymentsError,
        refetch: refetchPendingPayments
    } = useGetPendingPaymentsQuery();

    const [approveLead, { isLoading: approving }] = useApproveLeadMutation();
    const [verifyPayment, { isLoading: verifying }] = useVerifyPaymentMutation();

    // Extract data from responses with proper fallbacks
    const pendingLeads = pendingLeadsResponse?.leads || pendingLeadsResponse || [];
    const allLeads = allLeadsResponse?.leads || allLeadsResponse || [];
    const pendingPayments = pendingPaymentsResponse?.payments || pendingPaymentsResponse || [];

    // Filter leads based on active tab and search
    const getFilteredLeads = () => {
        let leads = [];
        
        if (activeTab === "pending") {
            leads = pendingLeads;
        } else if (activeTab === "payments") {
            return []; // Payments are handled separately
        } else {
            leads = allLeads.filter(lead => {
                if (activeTab === "all") return true;
                return lead.status === activeTab;
            });
        }

        // Apply search filter
        if (searchTerm) {
            leads = leads.filter(lead =>
                lead.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.buyer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.delivery_location?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply category filter
        if (selectedCategory !== "all") {
            leads = leads.filter(lead => lead.category === selectedCategory);
        }

        return leads;
    };

    const filteredLeads = getFilteredLeads();

    // Categories for filtering
    const categories = [
        "Vegetables",
        "Fruits", 
        "Pulses",
        "Grains",
        "Spices",
        "Oil Seeds",
        "Dry Fruits",
    ];

    // Calculate stats with proper fallbacks
    const stats = {
        total: allLeads.length,
        totalRevenue: analyticsData?.totalRevenue || 0,
        conversionRate: analyticsData?.conversionRate || 0,
        leadSales: analyticsData?.totalSoldLeads || analyticsData?.leadsSold || 0,
        pendingPayments: pendingPayments.length,
    };

    // Calculate tab counts
    const tabCounts = {
        pending: pendingLeads.length,
        payments: pendingPayments.length,
        all: allLeads.length,
        approved: allLeads.filter(lead => lead.status === "approved").length,
        rejected: allLeads.filter(lead => lead.status === "rejected").length,
        sold: allLeads.filter(lead => lead.status === "sold").length,
    };

    // Handle approve action
    const handleApproveClick = (lead) => {
        setSelectedLead(lead);
        setApproveData({
            lead_price: lead.lead_price || "",
            max_sellers: lead.max_sellers || 1
        });
        setShowApproveModal(true);
    };

    const handleApproveSubmit = async () => {
        if (!approveData.lead_price || approveData.lead_price < 50) {
            alert("Lead price must be at least ₹50");
            return;
        }

        try {
            await approveLead({
                leadId: selectedLead._id,
                status: "approved",
                lead_price: parseInt(approveData.lead_price),
                max_sellers: approveData.max_sellers
            }).unwrap();

            alert("Lead approved successfully!");
            setShowApproveModal(false);
            setSelectedLead(null);
            refetchPending();
            refetchAllLeads();
            refetchAnalytics();
        } catch (error) {
            console.error("Failed to approve lead:", error);
            alert("Failed to approve lead: " + (error?.data?.message || "Unknown error"));
        }
    };

    // Handle payment verification
    const handleVerifyPayment = async (purchaseId) => {
        try {
            await verifyPayment(purchaseId).unwrap();
            
            alert("Payment verified successfully! Chat created between buyer and seller.");
            setShowPaymentModal(false);
            setSelectedPurchase(null);
            refetchPendingPayments();
            refetchAllLeads();
            refetchAnalytics();
        } catch (error) {
            console.error("Failed to verify payment:", error);
            alert("Failed to verify payment: " + (error?.data?.message || "Unknown error"));
        }
    };

    // View payment proof
    const handleViewPayment = (purchase) => {
        setSelectedPurchase(purchase);
        setShowPaymentModal(true);
    };

    const handleReject = async (leadId) => {
        if (!confirm("Are you sure you want to reject this lead?")) return;

        try {
            await approveLead({
                leadId,
                status: "rejected"
            }).unwrap();

            alert("Lead rejected successfully!");
            refetchPending();
            refetchAllLeads();
            refetchAnalytics();
        } catch (error) {
            console.error("Failed to reject lead:", error);
            if (error?.data?.message) {
                alert("Failed to reject lead: " + error.data.message);
            } else if (error?.status === 500) {
                alert("Failed to reject lead: Server error. Please try again.");
            } else {
                alert("Failed to reject lead. Please try again.");
            }
        }
    };

    const handleRefresh = () => {
        refetchPending();
        refetchAllLeads();
        refetchAnalytics();
        refetchPendingPayments();
    };

    // Handle API errors
    if (pendingError || allLeadsError || analyticsError || paymentsError) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-lg mb-4">
                        Error loading data. Please try again.
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 p-4 sm:p-6">
            {/* Analytics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <AnalyticCard
                    title="Total Leads"
                    value={stats.total}
                    icon={FileText}
                    color="blue"
                    loading={allLeadsLoading}
                />
                <AnalyticCard
                    title="Total Revenue"
                    value={`₹${stats.totalRevenue}`}
                    icon={DollarSign}
                    color="emerald"
                    loading={analyticsLoading}
                />
                <AnalyticCard
                    title="Pending Payments"
                    value={stats.pendingPayments}
                    icon={CreditCard}
                    color="orange"
                    loading={paymentsLoading}
                />
                <AnalyticCard
                    title="Lead Sales"
                    value={stats.leadSales}
                    icon={Package}
                    color="purple"
                    loading={analyticsLoading}
                />
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <div className="flex flex-wrap">
                        {[
                            { id: "pending", name: "Pending Leads", count: tabCounts.pending, icon: Clock },
                            { id: "payments", name: "Pending Payments", count: tabCounts.payments, icon: CreditCard },
                            { id: "all", name: "All Leads", count: tabCounts.all, icon: FileText },
                            { id: "approved", name: "Approved", count: tabCounts.approved, icon: CheckCircle },
                            { id: "rejected", name: "Rejected", count: tabCounts.rejected, icon: XCircle },
                            { id: "sold", name: "Sold", count: tabCounts.sold, icon: Package },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-all duration-200 ${
                                    activeTab === tab.id
                                        ? "border-indigo-600 text-indigo-600 bg-indigo-50"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.name}
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                    activeTab === tab.id
                                        ? "bg-indigo-100 text-indigo-600"
                                        : "bg-gray-100 text-gray-600"
                                }`}>
                                    {tabCounts[tab.id]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder={
                                    activeTab === "payments" 
                                        ? "Search payments by seller, product, or lead..."
                                        : "Search leads by product, buyer, category, or location..."
                                }
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all duration-200 bg-white"
                            />
                        </div>

                        {/* Category Filter - Only show for lead tabs */}
                        {activeTab !== "payments" && (
                            <div className="sm:w-48">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all duration-200 bg-white"
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Refresh Button */}
                        <button
                            onClick={handleRefresh}
                            className="px-4 py-3 bg-white border border-gray-300 hover:border-gray-400 rounded-xl text-gray-700 font-medium transition-all duration-200 flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="overflow-x-auto">
                    {activeTab === "pending" && pendingLoading ? (
                        <LoadingState />
                    ) : activeTab === "payments" && paymentsLoading ? (
                        <LoadingState />
                    ) : activeTab !== "pending" && activeTab !== "payments" && allLeadsLoading ? (
                        <LoadingState />
                    ) : activeTab === "payments" ? (
                        // Payments Table
                        pendingPayments.length === 0 ? (
                            <EmptyState activeTab={activeTab} />
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Seller & Lead Details
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Payment Info
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {pendingPayments.map((payment) => (
                                        <PaymentRow
                                            key={payment._id}
                                            payment={payment}
                                            onViewPayment={handleViewPayment}
                                            onVerifyPayment={handleVerifyPayment}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        )
                    ) : filteredLeads.length === 0 ? (
                        <EmptyState activeTab={activeTab} />
                    ) : (
                        // Leads Table
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Lead Details
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Buyer & Location
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Status & Price
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {filteredLeads.map((lead) => (
                                    <LeadRow
                                        key={lead._id}
                                        lead={lead}
                                        onApprove={handleApproveClick}
                                        onReject={handleReject}
                                        activeTab={activeTab}
                                    />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Approve Modal */}
            {showApproveModal && (
                <ApproveModal
                    lead={selectedLead}
                    data={approveData}
                    setData={setApproveData}
                    onSubmit={handleApproveSubmit}
                    onClose={() => setShowApproveModal(false)}
                    loading={approving}
                />
            )}

            {/* Payment Verification Modal */}
            {showPaymentModal && (
                <PaymentVerificationModal
                    purchase={selectedPurchase}
                    onVerify={handleVerifyPayment}
                    onClose={() => setShowPaymentModal(false)}
                    loading={verifying}
                />
            )}
        </div>
    );
}

// Payment Row Component
function PaymentRow({ payment, onViewPayment, onVerifyPayment }) {
    const lead = payment.lead;
    const seller = payment.seller;

    return (
        <tr className="hover:bg-gray-50 transition-colors duration-150">
            {/* Seller & Lead Details */}
            <td className="px-6 py-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900">
                            {seller?.name || "Unknown Seller"}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {seller?.email}
                        </p>
                        <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-900">
                                {lead?.product}
                            </p>
                            <p className="text-xs text-gray-600">
                                {lead?.category} • {lead?.quantity}
                            </p>
                            <p className="text-xs text-gray-500">
                                Buyer: {lead?.buyer?.name}
                            </p>
                        </div>
                    </div>
                </div>
            </td>

            {/* Payment Info */}
            <td className="px-6 py-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                        <DollarSign className="w-4 h-4" />
                        ₹{lead?.lead_price}
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        Pending Verification
                    </span>
                    <div className="text-xs text-gray-500">
                        Manual Payment
                    </div>
                </div>
            </td>

            {/* Date */}
            <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                    {new Date(payment.createdAt).toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-500">
                    {new Date(payment.createdAt).toLocaleTimeString()}
                </div>
            </td>

            {/* Actions */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onViewPayment(payment)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                    >
                        <Eye className="w-4 h-4" />
                        View Proof
                    </button>
                    <button
                        onClick={() => onVerifyPayment(payment._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Verify
                    </button>
                </div>
            </td>
        </tr>
    );
}

// Lead Row Component
function LeadRow({ lead, onApprove, onReject, activeTab }) {
    const getStatusConfig = (status) => {
        const config = {
            approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
            pending: { color: "bg-orange-100 text-orange-800", icon: Clock },
            rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
            sold: { color: "bg-purple-100 text-purple-800", icon: Package },
        };
        return config[status] || { color: "bg-gray-100 text-gray-800", icon: FileText };
    };

    const statusConfig = getStatusConfig(lead.status);
    const StatusIcon = statusConfig.icon;

    return (
        <tr className="hover:bg-gray-50 transition-colors duration-150">
            {/* Lead Details */}
            <td className="px-6 py-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                            {lead.product}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {lead.category}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {lead.quantity} • {lead.quality_type || "Standard"}
                        </p>
                        {lead.description && (
                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                {lead.description}
                            </p>
                        )}
                    </div>
                </div>
            </td>

            {/* Buyer & Location */}
            <td className="px-6 py-4">
                <div className="space-y-2">
                    <div>
                        <p className="font-medium text-gray-900">
                            {lead.buyer?.name || "Unknown Buyer"}
                        </p>
                        <p className="text-sm text-gray-500">
                            {lead.buyer?.email}
                        </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                        📍
                        {lead.delivery_location}
                    </div>
                    {lead.allow_sellers_contact && (
                        <div className="flex items-center gap-2 text-xs">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                Contact Shared
                            </span>
                        </div>
                    )}
                </div>
            </td>

            {/* Status & Price */}
            <td className="px-6 py-4">
                <div className="space-y-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {lead.status?.charAt(0).toUpperCase() + lead.status?.slice(1)}
                    </span>
                    
                    {(lead.status === "approved" || lead.status === "sold") && lead.lead_price ? (
                        <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                            <DollarSign className="w-4 h-4" />
                            ₹{lead.lead_price}
                            <span className="text-xs text-gray-500 ml-1">(seller price)</span>
                        </div>
                    ) : lead.status === "pending" ? (
                        <div className="text-sm text-gray-500">Awaiting pricing</div>
                    ) : (
                        <div className="text-sm text-gray-500">Not priced</div>
                    )}

                    {lead.max_sellers && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            {lead.sold_count || 0}/{lead.max_sellers} sold
                        </div>
                    )}
                </div>
            </td>

            {/* Date */}
            <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                    {new Date(lead.createdAt).toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-500">
                    {new Date(lead.createdAt).toLocaleTimeString()}
                </div>
            </td>

            {/* Actions */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    {lead.status === "pending" && (
                        <>
                            <button
                                onClick={() => onApprove(lead)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                            </button>
                            <button
                                onClick={() => onReject(lead._id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                            >
                                <XCircle className="w-4 h-4" />
                                Reject
                            </button>
                        </>
                    )}
                    
                    {lead.status === "approved" && (
                        <button
                            onClick={() => onApprove(lead)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                        >
                            <Edit className="w-4 h-4" />
                            Edit Price
                        </button>
                    )}

                    <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}

// Payment Verification Modal Component (UPDATED)
function PaymentVerificationModal({ purchase, onVerify, onClose, loading }) {
    const lead = purchase?.lead;
    const seller = purchase?.seller;
    
    // Fix the image URL if needed
    const getImageUrl = (url) => {
        if (!url) return null;
        
        // If URL doesn't start with http or /, prepend server URL
        if (!url.startsWith('http') && !url.startsWith('/')) {
            return `http://localhost:5000${url}`;
        }
        
        // If URL starts with /uploads but doesn't have full path
        if (url.startsWith('/uploads') && !url.includes('localhost')) {
            return `http://localhost:5000${url}`;
        }
        
        return url;
    };
    
    const imageUrl = getImageUrl(purchase?.payment_proof);
    
    console.log("Payment proof URL:", {
        original: purchase?.payment_proof,
        processed: imageUrl
    });

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full animate-scaleIn max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-green-600" />
                            Verify Payment
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Transaction Details */}
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <h3 className="font-semibold text-gray-800 mb-3">Transaction Details</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Seller:</p>
                                    <p className="font-medium">{seller?.name}</p>
                                    <p className="text-gray-500 text-xs">{seller?.email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Lead:</p>
                                    <p className="font-medium">{lead?.product}</p>
                                    <p className="text-gray-500 text-xs">{lead?.category}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Buyer:</p>
                                    <p className="font-medium">{lead?.buyer?.name}</p>
                                    <p className="text-gray-500 text-xs">{lead?.buyer?.email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Amount:</p>
                                    <p className="font-bold text-green-600">₹{lead?.lead_price}</p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Proof */}
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-3">Payment Proof</h3>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                                {imageUrl ? (
                                    <div className="relative">
                                        <img 
                                            src={imageUrl} 
                                            alt="Payment proof" 
                                            className="w-full h-auto rounded-lg max-h-96 object-contain"
                                            onError={(e) => {
                                                console.error("Failed to load image:", imageUrl);
                                                e.target.onerror = null;
                                                e.target.src = "/api/placeholder/400/300";
                                                e.target.alt = "Image failed to load. Please check the URL.";
                                            }}
                                        />
                                        <div className="mt-2 text-center">
                                            <a 
                                                href={imageUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:text-blue-800 underline"
                                            >
                                                Open in new tab
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                        <p>No payment proof available</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Verification Instructions */}
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                <MessageCircle className="w-4 h-4" />
                                What happens after verification?
                            </h4>
                            <div className="text-sm text-blue-700 space-y-2">
                                <p>✅ Chat will be automatically created between buyer and seller</p>
                                <p>✅ Contact details will be shared (if buyer allowed)</p>
                                <p>✅ Lead sold count will be updated</p>
                                <p>✅ Seller will be notified</p>
                            </div>
                        </div>

                        {/* Contact Sharing Info */}
                        {lead?.allow_sellers_contact && (
                            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                                <h4 className="font-semibold text-green-800 mb-2">
                                    Contact Sharing Enabled
                                </h4>
                                <div className="text-sm text-green-700">
                                    <p>Buyer has allowed contact sharing. After verification, seller will receive:</p>
                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                        <li>Buyer's phone number: {lead.buyer_contact_phone}</li>
                                        <li>Buyer's email: {lead.buyer_contact_email}</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onVerify(purchase._id)}
                            disabled={loading}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Verify Payment & Create Chat
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Approve Modal Component
function ApproveModal({ lead, data, setData, onSubmit, onClose, loading }) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scaleIn">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            {lead?.status === "approved" ? "Update Lead Price" : "Approve Lead"}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <h3 className="font-semibold text-gray-800 mb-2">Lead Details</h3>
                            <p className="text-sm text-gray-600">
                                <strong>Product:</strong> {lead?.product}
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong>Buyer:</strong> {lead?.buyer?.name}
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong>Quantity:</strong> {lead?.quantity}
                            </p>
                            <p className="text-xs text-blue-600 mt-2">
                                💡 This price is only visible to sellers, not the buyer
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Lead Price (₹) *
                            </label>
                            <input
                                type="number"
                                min="50"
                                value={data.lead_price}
                                onChange={(e) => setData({ ...data, lead_price: e.target.value })}
                                placeholder="Minimum ₹50"
                                className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-200"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Price sellers will pay to access this lead (not visible to buyer)
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Maximum Sellers
                            </label>
                            <select
                                value={data.max_sellers}
                                onChange={(e) => setData({ ...data, max_sellers: parseInt(e.target.value) })}
                                className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-200"
                            >
                                <option value={1}>1 Seller</option>
                                <option value={3}>3 Sellers</option>
                                <option value={5}>5 Sellers</option>
                                <option value={10}>10 Sellers</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Number of sellers who can purchase this lead
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSubmit}
                            disabled={loading || !data.lead_price || data.lead_price < 50}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    {lead?.status === "approved" ? "Updating..." : "Approving..."}
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    {lead?.status === "approved" ? "Update Price" : "Approve Lead"}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Analytic Card Component
function AnalyticCard({ title, value, icon: Icon, color, loading = false }) {
    const colors = {
        blue: "from-blue-500 to-blue-600",
        orange: "from-orange-500 to-orange-600",
        green: "from-green-500 to-green-600",
        red: "from-red-500 to-red-600",
        purple: "from-purple-500 to-purple-600",
        emerald: "from-emerald-500 to-emerald-600",
    };

    return (
        <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">{title}</p>
                    {loading ? (
                        <div className="w-16 h-7 bg-gray-200 rounded-lg animate-pulse"></div>
                    ) : (
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                    )}
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${colors[color]} text-white group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
}

// Loading State Component
function LoadingState() {
    return (
        <div className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg">Loading data...</p>
            <p className="text-gray-400 text-sm mt-1">Please wait while we fetch the data</p>
        </div>
    );
}

// Empty State Component
function EmptyState({ activeTab }) {
    const messages = {
        pending: "No pending leads awaiting approval",
        payments: "No pending payments to verify",
        all: "No leads found in the system",
        approved: "No approved leads available",
        rejected: "No rejected leads found",
        sold: "No sold leads yet",
    };

    const icons = {
        pending: Clock,
        payments: CreditCard,
        all: FileText,
        approved: CheckCircle,
        rejected: XCircle,
        sold: Package,
    };

    const IconComponent = icons[activeTab] || FileText;

    return (
        <div className="p-16 text-center">
            <IconComponent className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">{messages[activeTab] || "No data available"}</p>
            <p className="text-gray-400">When new items are available, they will appear here</p>
        </div>
    );
}