"use client";
import { useState, useEffect } from "react";
import {
    Users, TrendingUp, DollarSign, Package, Search, Plus, MoreVertical,
    Eye, Download, CreditCard, ShoppingCart, CheckCircle, XCircle,
    RefreshCw, FileText, UserPlus, Phone, Mail, ShoppingBag, Tag,
    Scale, Receipt, IndianRupee, Warehouse, AlertTriangle, BarChart3,
    Trash2, Edit, Calendar, Truck, ShieldAlert, Gift, FileCheck,
    ArrowUp, ArrowDown, PieChart, Percent, User, Briefcase
} from "lucide-react";
import {
    useGetCustomersQuery,
    useCreateCustomerMutation,
    useDeleteCustomerMutation,
    useToggleCustomerStatusMutation,
    useDownloadLedgerPDFMutation,
    useCreatePurchaseMutation,
    useUpdatePurchaseMutation,
    useMakePaymentMutation,
    useGetInventoryQuery,
    useAddInventoryMutation,
    useAddStockPurchaseMutation,
    useAddExpenseMutation,
    useAddCommissionMutation,
    useAddDamagedGoodsMutation,
    useAddBullyPurchaseMutation,
    useAddReminderMutation,
    useGetProfitLossReportQuery,
    useGetLowStockAlertsQuery,
    useGetCustomerTransactionsQuery,
    useGetCommissionCandidatesQuery,
    useCreateCommissionCandidateMutation,
} from "../../../../store/features/accountsApi";

// Mock categories for products
const categories = [
    { id: 'vegetables', name: 'Vegetables', icon: '🥦' },
    { id: 'fruits', name: 'Fruits', icon: '🍎' },
    { id: 'grains', name: 'Grains', icon: '🌾' },
    { id: 'spices', name: 'Spices', icon: '🌶️' },
    { id: 'dairy', name: 'Dairy', icon: '🥛' },
    { id: 'other', name: 'Other', icon: '📦' },
];

// Commission candidate types
const commissionTypes = [
    { id: 'exporter', name: 'Exporter' },
    { id: 'delivery', name: 'Delivery Person' },
    { id: 'agent', name: 'Agent' },
    { id: 'broker', name: 'Broker' },
    { id: 'other', name: 'Other' },
];

// Commission calculation methods
const commissionMethods = [
    { id: 'percentage', name: '%' },
    { id: 'fixed', name: 'INR' }
];

// Utility function to format currency
const formatCurrency = (amount) => {
    return `₹${typeof amount === 'number' ? amount.toLocaleString('en-IN') : '0'}`;
};

export default function AccountManagement() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [analyticsPeriod, setAnalyticsPeriod] = useState("all");

    // Modal states
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showInventoryModal, setShowInventoryModal] = useState(false);
    const [showStockPurchaseModal, setShowStockPurchaseModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showCommissionModal, setShowCommissionModal] = useState(false);
    const [showDamagedGoodsModal, setShowDamagedGoodsModal] = useState(false);
    const [showBullyPurchaseModal, setShowBullyPurchaseModal] = useState(false);
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [showCustomerTransactionsModal, setShowCustomerTransactionsModal] = useState(false);
    const [showCommissionCandidateModal, setShowCommissionCandidateModal] = useState(false);

    // RTK Query Hooks
    const {
        data: customersResponse,
        isLoading: customersLoading,
        error: customersError,
        refetch: refetchCustomers,
    } = useGetCustomersQuery({ page: 1, limit: 1000, search: searchTerm });

    const {
        data: inventoryResponse,
        isLoading: inventoryLoading,
        refetch: refetchInventory,
    } = useGetInventoryQuery({ page: 1, limit: 1000 });

    const {
        data: profitLossData,
        refetch: refetchProfitLoss,
    } = useGetProfitLossReportQuery({ period: analyticsPeriod });

    const {
        data: lowStockData,
        refetch: refetchLowStock,
    } = useGetLowStockAlertsQuery();

    const {
        data: customerTransactionsData,
        refetch: refetchCustomerTransactions,
    } = useGetCustomerTransactionsQuery(selectedCustomer?._id, {
        skip: !selectedCustomer?._id,
    });

    const {
        data: commissionCandidatesData,
        refetch: refetchCommissionCandidates,
    } = useGetCommissionCandidatesQuery();

    // Mutation hooks
    const [createCustomer, { isLoading: creatingCustomer }] = useCreateCustomerMutation();
    const [deleteCustomer] = useDeleteCustomerMutation();
    const [toggleCustomerStatus] = useToggleCustomerStatusMutation();
    const [downloadLedgerPDF] = useDownloadLedgerPDFMutation();
    const [createPurchase, { isLoading: creatingPurchase }] = useCreatePurchaseMutation();
    const [updatePurchase, { isLoading: updatingPurchase }] = useUpdatePurchaseMutation();
    const [makePayment, { isLoading: makingPayment }] = useMakePaymentMutation();
    const [addInventory] = useAddInventoryMutation();
    const [addStockPurchase] = useAddStockPurchaseMutation();
    const [addExpense] = useAddExpenseMutation();
    const [addCommission] = useAddCommissionMutation();
    const [addDamagedGoods] = useAddDamagedGoodsMutation();
    const [addBullyPurchase] = useAddBullyPurchaseMutation();
    const [addReminder] = useAddReminderMutation();
    const [createCommissionCandidate] = useCreateCommissionCandidateMutation();

    // Extract data
    const customers = customersResponse?.data?.customers || [];
    const inventory = inventoryResponse?.data?.inventory || [];
    const lowStockItems = lowStockData?.data?.lowStockItems || [];
    const profitLossReport = profitLossData?.data?.report || {};
    const customerTransactions = customerTransactionsData?.data?.transactions || [];
    const commissionCandidates = commissionCandidatesData?.data?.candidates || [];

    // Form states
    const [customerForm, setCustomerForm] = useState({
        name: "", phone: "", email: "", address: ""
    });

    const [purchaseForm, setPurchaseForm] = useState({
        items: [{
            inventoryId: "",
            quantity: "",
            unit: "kg",
            sellingPrice: "",
            itemCommissionCandidates: []
        }],
        commissionCandidates: [],
        totalAmount: 0,
        totalCommission: 0,
        finalAmount: 0,
        paidAmount: "",
        note: ""
    });

    const [paymentForm, setPaymentForm] = useState({
        amount: "", paymentMethod: "cash", note: ""
    });

    const [inventoryForm, setInventoryForm] = useState({
        productName: "", category: "vegetables", currentStock: "",
        unit: "kg", costPrice: "", minStockLevel: ""
    });

    const [stockPurchaseForm, setStockPurchaseForm] = useState({
        inventoryId: "", supplier: "", quantity: "", unit: "kg",
        pricePerUnit: "", billNumber: "", billDate: new Date().toISOString().split('T')[0], note: ""
    });

    const [expenseForm, setExpenseForm] = useState({
        amount: "", expenseCategory: "transport", expenseTo: "", note: ""
    });

    const [commissionForm, setCommissionForm] = useState({
        amount: "", commissionFrom: "", commissionType: "cash", note: ""
    });

    const [damagedGoodsForm, setDamagedGoodsForm] = useState({
        inventoryId: "", quantity: "", unit: "kg", damageReason: "", note: ""
    });

    const [bullyPurchaseForm, setBullyPurchaseForm] = useState({
        items: [{ inventoryId: "", quantity: "", unit: "kg" }],
        bullySupplier: "", bullyBillNumber: "", note: ""
    });

    const [reminderForm, setReminderForm] = useState({
        customerId: "", amount: "", reminderDate: new Date().toISOString().split('T')[0], note: ""
    });

    const [commissionCandidateForm, setCommissionCandidateForm] = useState({
        name: "", type: "exporter", commissionRate: "", contactNumber: ""
    });

    // Calculate purchase totals
    useEffect(() => {
        let total = 0;
        let totalCommission = 0;

        // Calculate item totals
        purchaseForm.items.forEach(item => {
            if (item.quantity && item.sellingPrice) {
                const itemTotal = parseFloat(item.quantity) * parseFloat(item.sellingPrice);
                total += itemTotal;

                // Calculate item-level commission
                if (item.itemCommissionCandidates && item.itemCommissionCandidates.length > 0) {
                    item.itemCommissionCandidates.forEach(commission => {
                        if (commission.commissionValue) {
                            if (commission.commissionMethod === 'percentage') {
                                const commissionAmount = (itemTotal * parseFloat(commission.commissionValue)) / 100;
                                totalCommission += commissionAmount;
                            } else if (commission.commissionMethod === 'fixed') {
                                totalCommission += parseFloat(commission.commissionValue);
                            }
                        }
                    });
                }
            }
        });

        // Calculate purchase-level commission
        if (purchaseForm.commissionCandidates && purchaseForm.commissionCandidates.length > 0) {
            purchaseForm.commissionCandidates.forEach(commission => {
                if (commission.commissionValue) {
                    if (commission.commissionMethod === 'percentage') {
                        const commissionAmount = (total * parseFloat(commission.commissionValue)) / 100;
                        totalCommission += commissionAmount;
                    } else if (commission.commissionMethod === 'fixed') {
                        totalCommission += parseFloat(commission.commissionValue);
                    }
                }
            });
        }

        setPurchaseForm(prev => ({
            ...prev,
            totalAmount: total,
            totalCommission: totalCommission,
            finalAmount: total - totalCommission
        }));
    }, [purchaseForm.items, purchaseForm.commissionCandidates]);

    // Filter customers based on active tab
    const getFilteredCustomers = () => {
        let filtered = customers;
        if (activeTab === "active") filtered = filtered.filter(c => c.isActive);
        else if (activeTab === "inactive") filtered = filtered.filter(c => !c.isActive);
        else if (activeTab === "due") filtered = filtered.filter(c => c.currentBalance > 0);
        else if (activeTab === "credit") filtered = filtered.filter(c => c.currentBalance < 0);

        return filtered;
    };

    const filteredCustomers = getFilteredCustomers();

    // Calculate stats
    const stats = {
        totalCustomers: customers.length,
        activeCustomers: customers.filter(c => c.isActive).length,
        totalOutstanding: customers.reduce((sum, c) => sum + (c.currentBalance > 0 ? c.currentBalance : 0), 0),
        totalPurchases: customers.reduce((sum, c) => sum + (c.totalPurchases || 0), 0),
        totalInventory: inventory.length,
        lowStockItems: lowStockItems.length,
        totalRevenue: profitLossReport.totalRevenue || 0,
        netProfit: profitLossReport.netProfit || 0,
        totalExpenses: profitLossReport.totalExpenses || 0,
        totalDamages: profitLossReport.totalDamages || 0,
        totalPurchaseCommission: profitLossReport.totalPurchaseCommission || 0,
    };

    // Handler functions
    const handleCreateCustomer = async () => {
        try {
            const result = await createCustomer(customerForm).unwrap();
            if (result.status === 'success') {
                alert('Customer created successfully!');
                setShowCustomerModal(false);
                setCustomerForm({ name: '', phone: '', email: '', address: '' });
                refetchCustomers();
            }
        } catch (error) {
            alert(error?.data?.message || 'Error creating customer');
        }
    };

    const handleMakePayment = async () => {
        if (!selectedCustomer) return;
        try {
            const paymentData = {
                customerId: selectedCustomer._id,
                amount: parseFloat(paymentForm.amount),
                paymentMethod: paymentForm.paymentMethod,
                note: paymentForm.note
            };
            const result = await makePayment(paymentData).unwrap();
            if (result.status === 'success') {
                alert('Payment added successfully!');
                setShowPaymentModal(false);
                setPaymentForm({ amount: "", paymentMethod: "cash", note: "" });
                refetchCustomers();
            }
        } catch (error) {
            alert(error?.data?.message || 'Error processing payment');
        }
    };

    const handleAddInventory = async () => {
        try {
            const inventoryData = {
                ...inventoryForm,
                currentStock: parseFloat(inventoryForm.currentStock) || 0,
                costPrice: parseFloat(inventoryForm.costPrice),
                minStockLevel: parseFloat(inventoryForm.minStockLevel) || 0
            };

            const result = await addInventory(inventoryData).unwrap();
            if (result.status === 'success') {
                alert('Inventory item added successfully!');
                setShowInventoryModal(false);
                setInventoryForm({
                    productName: "", category: "vegetables", currentStock: "",
                    unit: "kg", costPrice: "", minStockLevel: ""
                });
                refetchInventory();
            }
        } catch (error) {
            alert(error?.data?.message || 'Error adding inventory item');
        }
    };

    const handleStockPurchase = async () => {
        try {
            const stockData = {
                ...stockPurchaseForm,
                quantity: parseFloat(stockPurchaseForm.quantity),
                pricePerUnit: parseFloat(stockPurchaseForm.pricePerUnit)
            };

            const result = await addStockPurchase(stockData).unwrap();
            if (result.status === 'success') {
                alert('Stock purchased successfully!');
                setShowStockPurchaseModal(false);
                setStockPurchaseForm({
                    inventoryId: "", supplier: "", quantity: "", unit: "kg",
                    pricePerUnit: "", billNumber: "", billDate: new Date().toISOString().split('T')[0], note: ""
                });
                refetchInventory();
                refetchProfitLoss();
            }
        } catch (error) {
            alert(error?.data?.message || 'Error purchasing stock');
        }
    };

    const handleAddExpense = async () => {
        try {
            const expenseData = {
                ...expenseForm,
                amount: parseFloat(expenseForm.amount)
            };

            const result = await addExpense(expenseData).unwrap();
            if (result.status === 'success') {
                alert('Expense added successfully!');
                setShowExpenseModal(false);
                setExpenseForm({
                    amount: "", expenseCategory: "transport", expenseTo: "", note: ""
                });
                refetchProfitLoss();
            }
        } catch (error) {
            alert(error?.data?.message || 'Error adding expense');
        }
    };

    const handleAddCommission = async () => {
        try {
            const commissionData = {
                ...commissionForm,
                amount: parseFloat(commissionForm.amount)
            };

            const result = await addCommission(commissionData).unwrap();
            if (result.status === 'success') {
                alert('Commission added successfully!');
                setShowCommissionModal(false);
                setCommissionForm({
                    amount: "", commissionFrom: "", commissionType: "cash", note: ""
                });
                refetchProfitLoss();
            }
        } catch (error) {
            alert(error?.data?.message || 'Error adding commission');
        }
    };

    const handleAddDamagedGoods = async () => {
        try {
            const damagedData = {
                ...damagedGoodsForm,
                quantity: parseFloat(damagedGoodsForm.quantity)
            };

            const result = await addDamagedGoods(damagedData).unwrap();
            if (result.status === 'success') {
                alert('Damaged goods recorded successfully!');
                setShowDamagedGoodsModal(false);
                setDamagedGoodsForm({
                    inventoryId: "", quantity: "", unit: "kg", damageReason: "", note: ""
                });
                refetchInventory();
                refetchProfitLoss();
            }
        } catch (error) {
            alert(error?.data?.message || 'Error recording damaged goods');
        }
    };

    const handleAddBullyPurchase = async () => {
        try {
            const bullyData = {
                ...bullyPurchaseForm,
                items: bullyPurchaseForm.items.map(item => ({
                    ...item,
                    quantity: parseFloat(item.quantity)
                }))
            };

            const result = await addBullyPurchase(bullyData).unwrap();
            if (result.status === 'success') {
                alert('Bully purchase recorded successfully!');
                setShowBullyPurchaseModal(false);
                setBullyPurchaseForm({
                    items: [{ inventoryId: "", quantity: "", unit: "kg" }],
                    bullySupplier: "", bullyBillNumber: "", note: ""
                });
                refetchInventory();
                refetchProfitLoss();
            }
        } catch (error) {
            alert(error?.data?.message || 'Error recording bully purchase');
        }
    };

    const handleAddReminder = async () => {
        try {
            const reminderData = {
                ...reminderForm,
                amount: parseFloat(reminderForm.amount)
            };

            const result = await addReminder(reminderData).unwrap();
            if (result.status === 'success') {
                alert('Reminder added successfully!');
                setShowReminderModal(false);
                setReminderForm({
                    customerId: "", amount: "", reminderDate: new Date().toISOString().split('T')[0], note: ""
                });
            }
        } catch (error) {
            alert(error?.data?.message || 'Error adding reminder');
        }
    };

    const handleAddCommissionCandidate = async () => {
        try {
            const candidateData = {
                ...commissionCandidateForm,
                commissionRate: parseFloat(commissionCandidateForm.commissionRate) || 0
            };

            const result = await createCommissionCandidate(candidateData).unwrap();
            if (result.status === 'success') {
                alert('Commission candidate added successfully!');
                setShowCommissionCandidateModal(false);
                setCommissionCandidateForm({
                    name: "", type: "exporter", commissionRate: "", contactNumber: ""
                });
                refetchCommissionCandidates();
            }
        } catch (error) {
            alert(error?.data?.message || 'Error adding commission candidate');
        }
    };

    const handleRefresh = () => {
        refetchCustomers();
        refetchInventory();
        refetchProfitLoss();
        refetchLowStock();
        refetchCommissionCandidates();
    };

    const handleDeleteCustomer = async (customerId) => {
        if (!confirm('Are you sure you want to delete this customer?')) return;
        try {
            await deleteCustomer(customerId).unwrap();
            alert('Customer deleted successfully!');
            refetchCustomers();
        } catch (error) {
            alert(error?.data?.message || 'Error deleting customer');
        }
    };

    const handleToggleStatus = async (customerId, currentStatus) => {
        try {
            await toggleCustomerStatus(customerId).unwrap();
            alert(`Customer ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
            refetchCustomers();
        } catch (error) {
            alert(error?.data?.message || 'Error updating customer status');
        }
    };

    const handleDownloadLedger = async (customerId) => {
        try {
            await downloadLedgerPDF(customerId).unwrap();
        } catch (error) {
            alert('Error downloading ledger');
        }
    };

    const handleViewTransactions = (customer) => {
        setSelectedCustomer(customer);
        setShowCustomerTransactionsModal(true);
        refetchCustomerTransactions();
    };

    // Analytics Period Selector Component
    const AnalyticsPeriodSelector = () => (
        <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Period:</label>
            <select
                value={analyticsPeriod}
                onChange={(e) => setAnalyticsPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none"
            >
                <option value="1d">1 Day</option>
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
                <option value="all">All Time</option>
            </select>
        </div>
    );

    // Reset forms when modals close
    useEffect(() => {
        if (!showCustomerModal) {
            setCustomerForm({ name: "", phone: "", email: "", address: "" });
        }
        if (!showPurchaseModal) {
            setPurchaseForm({
                items: [{
                    inventoryId: "",
                    quantity: "",
                    unit: "kg",
                    sellingPrice: "",
                    itemCommissionCandidates: []
                }],
                commissionCandidates: [],
                totalAmount: 0,
                totalCommission: 0,
                finalAmount: 0,
                paidAmount: "",
                note: ""
            });
        }
    }, [showCustomerModal, showPurchaseModal]);


    const handleItemCommissionChange = (itemIndex, commissionIndex, field, value) => {
        setPurchaseForm(prev => {
            const updatedItems = [...prev.items];
            const updatedCommissions = [...updatedItems[itemIndex].itemCommissionCandidates];
            updatedCommissions[commissionIndex] = {
                ...updatedCommissions[commissionIndex],
                [field]: value
            };

            // If changing candidateType to something other than 'other', clear otherCandidate
            if (field === 'candidateType' && value !== 'other') {
                updatedCommissions[commissionIndex].otherCandidate = "";
            }

            updatedItems[itemIndex].itemCommissionCandidates = updatedCommissions;
            return { ...prev, items: updatedItems };
        });
    };

    const handleRemoveItemCommission = (itemIndex, commissionIndex) => {
        setPurchaseForm(prev => {
            const updatedItems = [...prev.items];
            updatedItems[itemIndex] = {
                ...updatedItems[itemIndex],
                itemCommissionCandidates: updatedItems[itemIndex].itemCommissionCandidates.filter((_, i) => i !== commissionIndex)
            };
            return { ...prev, items: updatedItems };
        });
    };

    const handleAddItemCommission = (itemIndex) => {
        setPurchaseForm(prev => {
            const updatedItems = [...prev.items];
            updatedItems[itemIndex] = {
                ...updatedItems[itemIndex],
                itemCommissionCandidates: [
                    ...(updatedItems[itemIndex].itemCommissionCandidates || []),
                    {
                        candidateType: "",
                        otherCandidate: "",
                        commissionMethod: "percentage",
                        commissionValue: ""
                    }
                ]
            };
            return { ...prev, items: updatedItems };
        });
    };

    const handleAddPurchaseCommission = () => {
        setPurchaseForm(prev => ({
            ...prev,
            commissionCandidates: [
                ...prev.commissionCandidates,
                {
                    candidateType: "",
                    otherCandidate: "",
                    commissionMethod: "percentage",
                    commissionValue: ""
                }
            ]
        }));
    };

    const handlePurchaseCommissionChange = (index, field, value) => {
        setPurchaseForm(prev => {
            const updatedCommissions = [...prev.commissionCandidates];
            updatedCommissions[index] = {
                ...updatedCommissions[index],
                [field]: value
            };

            // If changing candidateType to something other than 'other', clear otherCandidate
            if (field === 'candidateType' && value !== 'other') {
                updatedCommissions[index].otherCandidate = "";
            }

            return { ...prev, commissionCandidates: updatedCommissions };
        });
    };

    const handleRemovePurchaseCommission = (index) => {
        setPurchaseForm(prev => ({
            ...prev,
            commissionCandidates: prev.commissionCandidates.filter((_, i) => i !== index)
        }));
    };

    const handleCreatePurchase = async () => {
        if (!selectedCustomer) return;
        try {
            const itemsWithPrices = purchaseForm.items.map(item => {
                const inventoryItem = inventory.find(inv => inv._id === item.inventoryId);

                // Format item commission candidates
                const formattedItemCommissions = item.itemCommissionCandidates?.map(commission => {
                    return {
                        candidateType: commission.candidateType,
                        otherCandidate: commission.candidateType === 'other' ? commission.otherCandidate : undefined,
                        commissionMethod: commission.commissionMethod,
                        commissionValue: parseFloat(commission.commissionValue) || 0
                    };
                }) || [];

                return {
                    inventoryId: item.inventoryId,
                    quantity: parseFloat(item.quantity),
                    unit: item.unit,
                    sellingPrice: parseFloat(item.sellingPrice),
                    itemCommissionCandidates: formattedItemCommissions
                };
            });

            // Format purchase-level commission candidates
            const formattedPurchaseCommissions = purchaseForm.commissionCandidates?.map(commission => {
                return {
                    candidateType: commission.candidateType,
                    otherCandidate: commission.candidateType === 'other' ? commission.otherCandidate : undefined,
                    commissionMethod: commission.commissionMethod,
                    commissionValue: parseFloat(commission.commissionValue) || 0
                };
            }) || [];

            const purchaseData = {
                customerId: selectedCustomer._id,
                items: itemsWithPrices,
                totalAmount: purchaseForm.totalAmount,
                paidAmount: parseFloat(purchaseForm.paidAmount) || 0,
                note: purchaseForm.note,
                commissionCandidates: formattedPurchaseCommissions
            };

            const result = await createPurchase(purchaseData).unwrap();
            if (result.status === 'success') {
                alert('Purchase added successfully!');
                setShowPurchaseModal(false);
                setPurchaseForm({
                    items: [{
                        inventoryId: "",
                        quantity: "",
                        unit: "kg",
                        sellingPrice: "",
                        itemCommissionCandidates: []
                    }],
                    commissionCandidates: [],
                    totalAmount: 0,
                    totalCommission: 0,
                    finalAmount: 0,
                    paidAmount: "",
                    note: ""
                });
                refetchCustomers();
                refetchInventory();
                refetchProfitLoss();
            }
        } catch (error) {
            alert(error?.data?.message || 'Error adding purchase');
        }
    };

    if (customersError) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-lg mb-4">Error loading data</div>
                    <button onClick={handleRefresh} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Account Management</h1>
                    <p className="text-gray-600 mt-1">Manage customers, inventory, and financial transactions</p>
                </div>
                <button
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:border-gray-400 rounded-lg text-gray-700 font-medium transition-all duration-200"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh Data
                </button>
            </div>

            {/* Analytics Cards with Period Selector */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard Analytics</h2>
                <AnalyticsPeriodSelector />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <AnalyticCard
                    title="Total Revenue"
                    value={formatCurrency(stats.totalRevenue)}
                    icon={DollarSign}
                    color="blue"
                    loading={customersLoading}
                />
                <AnalyticCard
                    title="Net Profit"
                    value={formatCurrency(stats.netProfit)}
                    icon={BarChart3}
                    color={stats.netProfit >= 0 ? "green" : "red"}
                    loading={customersLoading}
                />
                <AnalyticCard
                    title="Purchase Commission"
                    value={formatCurrency(stats.totalPurchaseCommission)}
                    icon={Percent}
                    color="purple"
                    loading={customersLoading}
                />
                <AnalyticCard
                    title="Outstanding Balance"
                    value={formatCurrency(stats.totalOutstanding)}
                    icon={CreditCard}
                    color="orange"
                    loading={customersLoading}
                />
            </div>

            {/* Main Navigation - UPDATED to include Commission Candidates */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="border-b border-gray-200">
                    <div className="flex flex-wrap">
                        {[
                            { id: "dashboard", name: "Dashboard", icon: BarChart3 },
                            { id: "customers", name: "Customers", icon: Users },
                            { id: "inventory", name: "Inventory", icon: Warehouse },
                            { id: "commissionCandidates", name: "Commission Info", icon: User },
                            { id: "reports", name: "Reports", icon: PieChart },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === tab.id ? "border-indigo-600 text-indigo-600 bg-indigo-50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Dashboard View */}
            {activeTab === "dashboard" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Quick Actions */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <ActionButton icon={UserPlus} label="New Customer" onClick={() => setShowCustomerModal(true)} color="blue" />
                            <ActionButton icon={Warehouse} label="Add Inventory" onClick={() => setShowInventoryModal(true)} color="green" />
                            <ActionButton icon={Truck} label="Stock Purchase" onClick={() => setShowStockPurchaseModal(true)} color="orange" />
                            <ActionButton icon={Receipt} label="Add Expense" onClick={() => setShowExpenseModal(true)} color="red" />
                            <ActionButton icon={Gift} label="Add Commission" onClick={() => setShowCommissionModal(true)} color="purple" />
                            <ActionButton icon={ShieldAlert} label="Damaged Goods" onClick={() => setShowDamagedGoodsModal(true)} color="amber" />
                            <ActionButton icon={User} label="Add Commission Info" color="indigo" onClick={() => setShowCommissionCandidateModal(true)} />
                            <ActionButton icon={Briefcase} label="View Commission Info" color="indigo" onClick={() => setActiveTab("commissionCandidates")} />
                        </div>
                    </div>

                    {/* Low Stock Alerts */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            Low Stock Alerts ({lowStockItems.length})
                        </h3>
                        {lowStockItems.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No low stock items</p>
                        ) : (
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {lowStockItems.map((item) => (
                                    <div key={item._id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                                        <div>
                                            <p className="font-medium text-gray-800">{item.productName}</p>
                                            <p className="text-sm text-gray-600">Stock: {item.currentStock} {item.unit}</p>
                                        </div>
                                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">Low</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Customer Summary */}
                    <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard title="Total Customers" value={stats.totalCustomers.toString()} change={`${Math.round((stats.activeCustomers / stats.totalCustomers) * 100)}% active`} trend="up" />
                            <StatCard title="Active Customers" value={stats.activeCustomers.toString()} change="This month" trend="up" />
                            <StatCard title="Customers with Due" value={customers.filter(c => c.currentBalance > 0).length.toString()} change="Need follow up" trend="neutral" />
                            <StatCard title="Total Inventory" value={stats.totalInventory.toString()} change={`${stats.lowStockItems} low stock`} trend="neutral" />
                        </div>
                    </div>
                </div>
            )}

            {/* Customers View */}
            {activeTab === "customers" && (
                <CustomersView
                    customers={filteredCustomers}
                    loading={customersLoading}
                    onAddPurchase={(customer) => {
                        setSelectedCustomer(customer);
                        setShowPurchaseModal(true);
                    }}
                    onAddPayment={(customer) => {
                        setSelectedCustomer(customer);
                        setShowPaymentModal(true);
                    }}
                    onAddReminder={(customer) => {
                        setSelectedCustomer(customer);
                        setReminderForm({
                            ...reminderForm,
                            customerId: customer._id,
                            amount: customer.currentBalance > 0 ? customer.currentBalance.toString() : ""
                        });
                        setShowReminderModal(true);
                    }}
                    onViewTransactions={handleViewTransactions}
                    onDeleteCustomer={handleDeleteCustomer}
                    onToggleStatus={handleToggleStatus}
                    onDownloadLedger={handleDownloadLedger}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onRefresh={handleRefresh}
                    onNewCustomer={() => setShowCustomerModal(true)}
                />
            )}

            {/* Inventory View */}
            {activeTab === "inventory" && (
                <InventoryView
                    inventory={inventory}
                    loading={inventoryLoading}
                    onRefresh={refetchInventory}
                    onNewInventory={() => setShowInventoryModal(true)}
                    onStockPurchase={(item) => {
                        setStockPurchaseForm({ ...stockPurchaseForm, inventoryId: item._id });
                        setShowStockPurchaseModal(true);
                    }}
                />
            )}

            {/* Commission Candidates View */}
            {activeTab === "commissionCandidates" && (
                <CommissionCandidatesView
                    candidates={commissionCandidates}
                    onRefresh={refetchCommissionCandidates}
                    onNewCandidate={() => setShowCommissionCandidateModal(true)}
                />
            )}

            {/* Reports View */}
            {activeTab === "reports" && (
                <ReportsView
                    profitLossReport={profitLossReport}
                    customers={customers}
                    inventory={inventory}
                    period={analyticsPeriod}
                    onPeriodChange={setAnalyticsPeriod}
                />
            )}

            {/* All Modals */}
            <CustomerModal
                show={showCustomerModal}
                onClose={() => setShowCustomerModal(false)}
                form={customerForm}
                setForm={setCustomerForm}
                onSubmit={handleCreateCustomer}
                loading={creatingCustomer}
            />
            <PurchaseModal
                show={showPurchaseModal}
                onClose={() => setShowPurchaseModal(false)}
                customer={selectedCustomer}
                inventory={inventory}
                commissionCandidates={commissionCandidates}
                form={purchaseForm}
                setForm={setPurchaseForm}
                onSubmit={handleCreatePurchase}
                loading={creatingPurchase}
            />
            <PaymentModal
                show={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                customer={selectedCustomer}
                form={paymentForm}
                setForm={setPaymentForm}
                onSubmit={handleMakePayment}
                loading={makingPayment}
            />
            <InventoryModal
                show={showInventoryModal}
                onClose={() => setShowInventoryModal(false)}
                form={inventoryForm}
                setForm={setInventoryForm}
                onSubmit={handleAddInventory}
                categories={categories}
            />
            <StockPurchaseModal
                show={showStockPurchaseModal}
                onClose={() => setShowStockPurchaseModal(false)}
                inventory={inventory}
                form={stockPurchaseForm}
                setForm={setStockPurchaseForm}
                onSubmit={handleStockPurchase}
            />
            <ExpenseModal
                show={showExpenseModal}
                onClose={() => setShowExpenseModal(false)}
                form={expenseForm}
                setForm={setExpenseForm}
                onSubmit={handleAddExpense}
            />
            <CommissionModal
                show={showCommissionModal}
                onClose={() => setShowCommissionModal(false)}
                form={commissionForm}
                setForm={setCommissionForm}
                onSubmit={handleAddCommission}
            />
            <DamagedGoodsModal
                show={showDamagedGoodsModal}
                onClose={() => setShowDamagedGoodsModal(false)}
                inventory={inventory}
                form={damagedGoodsForm}
                setForm={setDamagedGoodsForm}
                onSubmit={handleAddDamagedGoods}
            />
            <BullyPurchaseModal
                show={showBullyPurchaseModal}
                onClose={() => setShowBullyPurchaseModal(false)}
                inventory={inventory}
                form={bullyPurchaseForm}
                setForm={setBullyPurchaseForm}
                onSubmit={handleAddBullyPurchase}
            />
            <ReminderModal
                show={showReminderModal}
                onClose={() => setShowReminderModal(false)}
                customers={customers}
                form={reminderForm}
                setForm={setReminderForm}
                onSubmit={handleAddReminder}
            />
            <CustomerTransactionsModal
                show={showCustomerTransactionsModal}
                onClose={() => setShowCustomerTransactionsModal(false)}
                customer={selectedCustomer}
                transactions={customerTransactions}
                loading={!customerTransactionsData}
            />
            <CommissionCandidateModal
                show={showCommissionCandidateModal}
                onClose={() => setShowCommissionCandidateModal(false)}
                form={commissionCandidateForm}
                setForm={setCommissionCandidateForm}
                onSubmit={handleAddCommissionCandidate}
                commissionTypes={commissionTypes}
            />
        </div>
    );
}

// Sub-components
function CustomersView({
    customers,
    loading,
    onAddPurchase,
    onAddPayment,
    onAddReminder,
    onViewTransactions,
    onDeleteCustomer,
    onToggleStatus,
    onDownloadLedger,
    searchTerm,
    onSearchChange,
    onRefresh,
    onNewCustomer
}) {
    const [activeCustomerTab, setActiveCustomerTab] = useState("all");

    const filteredCustomers = customers.filter(customer => {
        if (activeCustomerTab === "all") return true;
        if (activeCustomerTab === "active") return customer.isActive;
        if (activeCustomerTab === "inactive") return !customer.isActive;
        if (activeCustomerTab === "due") return customer.currentBalance > 0;
        if (activeCustomerTab === "credit") return customer.currentBalance < 0;
        return true;
    });

    const tabCounts = {
        all: customers.length,
        active: customers.filter(c => c.isActive).length,
        inactive: customers.filter(c => !c.isActive).length,
        due: customers.filter(c => c.currentBalance > 0).length,
        credit: customers.filter(c => c.currentBalance < 0).length,
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Customer Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex flex-wrap">
                    {[
                        { id: "all", name: "All Customers", count: tabCounts.all, icon: Users },
                        { id: "active", name: "Active", count: tabCounts.active, icon: CheckCircle },
                        { id: "inactive", name: "Inactive", count: tabCounts.inactive, icon: XCircle },
                        { id: "due", name: "Due Balance", count: tabCounts.due, icon: CreditCard },
                        { id: "credit", name: "Credit Balance", count: tabCounts.credit, icon: DollarSign },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveCustomerTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-all duration-200 ${activeCustomerTab === tab.id ? "border-indigo-600 text-indigo-600 bg-indigo-50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.name}
                            <span className={`px-2 py-1 rounded-full text-xs ${activeCustomerTab === tab.id ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-600"}`}>
                                {tabCounts[tab.id]}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Search and Actions */}
            <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search customers by name, ID, or phone..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all duration-200 bg-white"
                        />
                    </div>
                    <button
                        onClick={onRefresh}
                        className="px-4 py-3 bg-white border border-gray-300 hover:border-gray-400 rounded-xl text-gray-700 font-medium transition-all duration-200 flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />Refresh
                    </button>
                    <button
                        onClick={onNewCustomer}
                        className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-medium transition-all duration-200 flex items-center gap-2"
                    >
                        <UserPlus className="w-4 h-4" />New Customer
                    </button>
                </div>
            </div>

            {/* Customers Table */}
            <div className="overflow-x-auto">
                {loading ? (
                    <LoadingState />
                ) : filteredCustomers.length === 0 ? (
                    <EmptyState message="No customers found" />
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer Details</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Info</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Financial Summary</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filteredCustomers.map((customer) => (
                                <CustomerRow
                                    key={customer._id}
                                    customer={customer}
                                    onAddPurchase={onAddPurchase}
                                    onAddPayment={onAddPayment}
                                    onAddReminder={onAddReminder}
                                    onViewTransactions={onViewTransactions}
                                    onDelete={onDeleteCustomer}
                                    onToggleStatus={onToggleStatus}
                                    onDownloadLedger={onDownloadLedger}
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

function CustomerRow({ customer, onAddPurchase, onAddPayment, onAddReminder, onViewTransactions, onDelete, onToggleStatus, onDownloadLedger }) {
    const [showDropdown, setShowDropdown] = useState(false);

    const getBalanceColor = (balance) => {
        if (balance > 0) return "bg-red-100 text-red-800";
        if (balance < 0) return "bg-green-100 text-green-800";
        return "bg-gray-100 text-gray-800";
    };

    const getBalanceText = (balance) => {
        if (balance > 0) return "Due";
        if (balance < 0) return "Credit";
        return "Settled";
    };

    return (
        <tr className="hover:bg-gray-50 transition-colors duration-150">
            <td className="px-6 py-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">ID: {customer.customerId}</p>
                        <p className="text-xs text-gray-500 mt-2">
                            Created: {new Date(customer.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </td>

            <td className="px-6 py-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        {customer.phone}
                    </div>
                    {customer.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            {customer.email}
                        </div>
                    )}
                    {customer.address && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                            {customer.address}
                        </div>
                    )}
                </div>
            </td>

            <td className="px-6 py-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Purchases:</span>
                        <span className="font-semibold text-gray-900">
                            {formatCurrency(customer.totalPurchases)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Payments:</span>
                        <span className="font-semibold text-green-600">
                            {formatCurrency(customer.totalPayments)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Balance:</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getBalanceColor(customer.currentBalance)}`}>
                            {getBalanceText(customer.currentBalance)}: {formatCurrency(Math.abs(customer.currentBalance))}
                        </span>
                    </div>
                </div>
            </td>

            <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${customer.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {customer.isActive ? <><CheckCircle className="w-3 h-3" />Active</> : <><XCircle className="w-3 h-3" />Inactive</>}
                </span>
            </td>

            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onAddPurchase(customer)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                    >
                        <ShoppingCart className="w-4 h-4" />Purchase
                    </button>
                    <button
                        onClick={() => onAddPayment(customer)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                    >
                        <CreditCard className="w-4 h-4" />Payment
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>

                        {showDropdown && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                <button
                                    onClick={() => { onViewTransactions(customer); setShowDropdown(false); }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <FileText className="w-4 h-4" />View Transactions
                                </button>
                                <button
                                    onClick={() => { onAddReminder(customer); setShowDropdown(false); }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <Calendar className="w-4 h-4" />Add Reminder
                                </button>
                                <button
                                    onClick={() => { onDownloadLedger(customer._id); setShowDropdown(false); }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />Download Ledger
                                </button>
                                <button
                                    onClick={() => { onToggleStatus(customer._id, customer.isActive); setShowDropdown(false); }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    {customer.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                    {customer.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                    onClick={() => { onDelete(customer._id); setShowDropdown(false); }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </td>
        </tr>
    );
}

function InventoryView({ inventory, loading, onRefresh, onNewInventory, onStockPurchase }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">Inventory Management</h3>
                        <p className="text-sm text-gray-600">Manage your stock and track inventory levels</p>
                    </div>
                    <button
                        onClick={onRefresh}
                        className="px-4 py-3 bg-white border border-gray-300 hover:border-gray-400 rounded-xl text-gray-700 font-medium transition-all duration-200 flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />Refresh
                    </button>
                    <button
                        onClick={onNewInventory}
                        className="px-4 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white font-medium transition-all duration-200 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />Add Inventory
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                {loading ? (
                    <LoadingState />
                ) : inventory.length === 0 ? (
                    <EmptyState message="No inventory items" />
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cost Price</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Profit</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {inventory.map((item) => (
                                <InventoryRow key={item._id} item={item} onStockPurchase={onStockPurchase} />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

function InventoryRow({ item, onStockPurchase }) {
    const isLowStock = item.currentStock <= item.minStockLevel;
    const totalProfit = item.totalProfit || 0;

    return (
        <tr className="hover:bg-gray-50 transition-colors duration-150">
            <td className="px-6 py-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                        <p className="text-sm text-gray-600 mt-1">ID: {item.productId}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {item.category}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <span className={`font-semibold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                        {item.currentStock} {item.unit}
                    </span>
                    {isLowStock && <AlertTriangle className="w-4 h-4 text-red-500" />}
                </div>
                {item.minStockLevel > 0 && (
                    <p className="text-xs text-gray-500">Min: {item.minStockLevel} {item.unit}</p>
                )}
            </td>
            <td className="px-6 py-4">
                <span className="font-semibold text-gray-900">{formatCurrency(item.costPrice)}</span>
            </td>
            <td className="px-6 py-4">
                <span className={`font-semibold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totalProfit)}
                </span>
            </td>
            <td className="px-6 py-4">
                <button
                    onClick={() => onStockPurchase(item)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                    <Truck className="w-4 h-4" />Add Stock
                </button>
            </td>
        </tr>
    );
}

function CommissionCandidatesView({ candidates, onRefresh, onNewCandidate }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">Commission Candidates</h3>
                        <p className="text-sm text-gray-600">Manage commission candidates (exporter, delivery, etc.)</p>
                    </div>
                    <button
                        onClick={onRefresh}
                        className="px-4 py-3 bg-white border border-gray-300 hover:border-gray-400 rounded-xl text-gray-700 font-medium transition-all duration-200 flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />Refresh
                    </button>
                    <button
                        onClick={onNewCandidate}
                        className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-medium transition-all duration-200 flex items-center gap-2"
                    >
                        <User className="w-4 h-4" />Add Candidate
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                {candidates.length === 0 ? (
                    <EmptyState message="No commission candidates found" />
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Commission Rate</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {candidates.map((candidate) => (
                                <CommissionCandidateRow key={candidate._id} candidate={candidate} />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

function CommissionCandidateRow({ candidate }) {
    const getTypeColor = (type) => {
        switch (type) {
            case 'exporter': return 'bg-blue-100 text-blue-800';
            case 'delivery': return 'bg-green-100 text-green-800';
            case 'agent': return 'bg-purple-100 text-purple-800';
            case 'broker': return 'bg-amber-100 text-amber-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <tr className="hover:bg-gray-50 transition-colors duration-150">
            <td className="px-6 py-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                        <p className="text-xs text-gray-500 mt-2">
                            Added: {new Date(candidate.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(candidate.type)}`}>
                    {candidate.type}
                </span>
            </td>
            <td className="px-6 py-4">
                <span className="font-semibold text-gray-900">{candidate.commissionRate}%</span>
            </td>
            <td className="px-6 py-4">
                <div className="text-sm text-gray-600">
                    {candidate.contactNumber || 'N/A'}
                </div>
            </td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${candidate.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {candidate.isActive ? <><CheckCircle className="w-3 h-3" />Active</> : <><XCircle className="w-3 h-3" />Inactive</>}
                </span>
            </td>
        </tr>
    );
}

function ReportsView({ profitLossReport, customers, inventory, period, onPeriodChange }) {
    const {
        totalRevenue = 0,
        totalCost = 0,
        grossProfit = 0,
        totalExpenses = 0,
        totalCommissions = 0,
        totalDamages = 0,
        totalPurchaseCommission = 0,
        netProfit = 0
    } = profitLossReport;

    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.isActive).length;
    const customersWithDue = customers.filter(c => c.currentBalance > 0).length;
    const totalDueAmount = customers.reduce((sum, c) => sum + (c.currentBalance > 0 ? c.currentBalance : 0), 0);

    const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.currentStock * (item.costPrice || 0)), 0);
    const lowStockCount = inventory.filter(item => item.currentStock <= item.minStockLevel).length;

    const profitMargin = grossProfit > 0 && totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100) : 0;
    const expenseRatio = totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100) : 0;
    const commissionRatio = totalRevenue > 0 ? ((totalPurchaseCommission / totalRevenue) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Period Selector */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Financial Reports</h3>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Period:</label>
                        <select
                            value={period}
                            onChange={(e) => onPeriodChange(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none"
                        >
                            <option value="1d">1 Day</option>
                            <option value="7d">7 Days</option>
                            <option value="30d">30 Days</option>
                            <option value="all">All Time</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profit & Loss Summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Profit & Loss Summary</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                            <span className="font-medium text-gray-700">Total Revenue</span>
                            <span className="font-bold text-blue-600">{formatCurrency(totalRevenue)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                            <span className="font-medium text-gray-700">Total Cost</span>
                            <span className="font-bold text-red-600">{formatCurrency(totalCost)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span className="font-medium text-gray-700">Gross Profit</span>
                            <span className="font-bold text-green-600">{formatCurrency(grossProfit)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                            <span className="font-medium text-gray-700">Purchase Commission</span>
                            <span className="font-bold text-purple-600">{formatCurrency(totalPurchaseCommission)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                            <span className="font-medium text-gray-700">Total Expenses</span>
                            <span className="font-bold text-orange-600">{formatCurrency(totalExpenses)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                            <span className="font-medium text-gray-700">Commissions Received</span>
                            <span className="font-bold text-indigo-600">{formatCurrency(totalCommissions)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                            <span className="font-medium text-gray-700">Damages/Losses</span>
                            <span className="font-bold text-amber-600">{formatCurrency(totalDamages)}</span>
                        </div>
                        <div className={`flex justify-between items-center p-3 rounded-lg ${netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                            <span className="font-medium text-gray-700">Net Profit</span>
                            <span className={`font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(netProfit)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Customer Insights */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Insights</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                            <span className="font-medium text-gray-700">Total Customers</span>
                            <span className="font-bold text-indigo-600">{totalCustomers}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span className="font-medium text-gray-700">Active Customers</span>
                            <span className="font-bold text-green-600">{activeCustomers}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                            <span className="font-medium text-gray-700">Customers with Due</span>
                            <span className="font-bold text-red-600">{customersWithDue}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                            <span className="font-medium text-gray-700">Total Due Amount</span>
                            <span className="font-bold text-orange-600">{formatCurrency(totalDueAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* Inventory Insights */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Inventory Insights</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                            <span className="font-medium text-gray-700">Total Products</span>
                            <span className="font-bold text-blue-600">{inventory.length}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                            <span className="font-medium text-gray-700">Low Stock Items</span>
                            <span className="font-bold text-red-600">{lowStockCount}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span className="font-medium text-gray-700">Total Inventory Value</span>
                            <span className="font-bold text-green-600">{formatCurrency(totalInventoryValue)}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard title="Profit Margin" value={`${profitMargin.toFixed(1)}%`} change="+2.1%" trend="up" />
                        <StatCard title="Expense Ratio" value={`${expenseRatio.toFixed(1)}%`} change="-0.5%" trend="down" />
                        <StatCard title="Commission Ratio" value={`${commissionRatio.toFixed(1)}%`} change="+0.3%" trend="neutral" />
                        <StatCard title="Active Rate" value={`${totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0}%`} change="+2%" trend="up" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Modal Components
function CustomerModal({ show, onClose, form, setForm, onSubmit, loading }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-indigo-600" />
                            Create New Customer
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">✕</button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Name *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Enter customer name"
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                placeholder="Enter phone number"
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email (Optional)</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="Enter email address"
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                            <textarea
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                placeholder="Enter customer address"
                                rows="3"
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all duration-200 resize-none"
                            />
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
                            disabled={loading || !form.name || !form.phone}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                        >
                            {loading ? <><RefreshCw className="w-4 h-4 animate-spin" />Creating...</> : <><UserPlus className="w-4 h-4" />Create Account</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PurchaseModal({ show, onClose, customer, inventory, commissionCandidates, form, setForm, onSubmit, loading }) {
    const remainingBalance = form.finalAmount - (parseFloat(form.paidAmount) || 0);

    const handleAddItem = () => {
        setForm(prev => ({
            ...prev,
            items: [...prev.items, {
                inventoryId: "",
                quantity: "",
                unit: "kg",
                sellingPrice: "",
                itemCommissionCandidates: []
            }]
        }));
    };

    const handleRemoveItem = (index) => {
        if (form.items.length === 1) return;
        setForm(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleItemChange = (index, field, value) => {
        setForm(prev => {
            const updatedItems = [...prev.items];
            updatedItems[index] = { ...updatedItems[index], [field]: value };
            return { ...prev, items: updatedItems };
        });
    };

    const handleAddItemCommission = (itemIndex) => {
        setForm(prev => {
            const updatedItems = [...prev.items];
            updatedItems[itemIndex] = {
                ...updatedItems[itemIndex],
                itemCommissionCandidates: [
                    ...(updatedItems[itemIndex].itemCommissionCandidates || []),
                    { candidate: "", commissionRate: "" }
                ]
            };
            return { ...prev, items: updatedItems };
        });
    };

    const handleRemoveItemCommission = (itemIndex, commissionIndex) => {
        setForm(prev => {
            const updatedItems = [...prev.items];
            updatedItems[itemIndex] = {
                ...updatedItems[itemIndex],
                itemCommissionCandidates: updatedItems[itemIndex].itemCommissionCandidates.filter((_, i) => i !== commissionIndex)
            };
            return { ...prev, items: updatedItems };
        });
    };

    const handleItemCommissionChange = (itemIndex, commissionIndex, field, value) => {
        setForm(prev => {
            const updatedItems = [...prev.items];
            const updatedCommissions = [...updatedItems[itemIndex].itemCommissionCandidates];
            updatedCommissions[commissionIndex] = { ...updatedCommissions[commissionIndex], [field]: value };
            updatedItems[itemIndex].itemCommissionCandidates = updatedCommissions;
            return { ...prev, items: updatedItems };
        });
    };

    const handleAddPurchaseCommission = () => {
        setForm(prev => ({
            ...prev,
            commissionCandidates: [
                ...prev.commissionCandidates,
                { candidate: "", commissionRate: "" }
            ]
        }));
    };

    const handleRemovePurchaseCommission = (index) => {
        setForm(prev => ({
            ...prev,
            commissionCandidates: prev.commissionCandidates.filter((_, i) => i !== index)
        }));
    };

    const handlePurchaseCommissionChange = (index, field, value) => {
        setForm(prev => {
            const updatedCommissions = [...prev.commissionCandidates];
            updatedCommissions[index] = { ...updatedCommissions[index], [field]: value };
            return { ...prev, commissionCandidates: updatedCommissions };
        });
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-blue-600" />
                            Add Purchase
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">✕</button>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-gray-50 p-4 rounded-xl mb-6">
                        <h3 className="font-semibold text-gray-800 mb-2">Customer Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div><strong>Name:</strong> {customer?.name}</div>
                            <div><strong>ID:</strong> {customer?.customerId}</div>
                            <div><strong>Current Balance:</strong> {formatCurrency(customer?.currentBalance || 0)}</div>
                        </div>
                    </div>

                    {/* Purchase Items */}
                    <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800">Purchase Items</h3>
                            <button
                                onClick={handleAddItem}
                                className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                            >
                                <Plus className="w-4 h-4" />Add Item
                            </button>
                        </div>

                        {form.items.map((item, index) => (
                            <div key={index} className="border border-gray-200 rounded-xl p-4 bg-white">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium text-gray-700">Item {index + 1}</h4>
                                    {form.items.length > 1 && (
                                        <button
                                            onClick={() => handleRemoveItem(index)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
                                        <select
                                            value={item.inventoryId}
                                            onChange={(e) => handleItemChange(index, 'inventoryId', e.target.value)}
                                            className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all duration-200"
                                        >
                                            <option value="">Select Product</option>
                                            {inventory.map((inv) => (
                                                <option key={inv._id} value={inv._id}>
                                                    {inv.productName} (Stock: {inv.currentStock} {inv.unit})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                            placeholder="0"
                                            step="0.01"
                                            min="0"
                                            className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                        <select
                                            value={item.unit}
                                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                            className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all duration-200"
                                        >
                                            <option value="kg">kg</option>
                                            <option value="ton">ton</option>
                                            <option value="piece">piece</option>
                                            <option value="bag">bag</option>
                                            <option value="liter">liter</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₹) *</label>
                                        <input
                                            type="number"
                                            value={item.sellingPrice}
                                            onChange={(e) => handleItemChange(index, 'sellingPrice', e.target.value)}
                                            placeholder="0"
                                            step="0.01"
                                            min="0"
                                            className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                {/* Item-level Commission */}
                                <div className="mt-4 border-t border-gray-200 pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h5 className="text-sm font-medium text-gray-700">Item Commission (Optional)</h5>
                                        <button
                                            type="button"
                                            onClick={() => handleAddItemCommission(index)}
                                            className="flex items-center gap-1 px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-medium rounded-lg transition-colors duration-200"
                                        >
                                            <Plus className="w-3 h-3" /> Add Commission
                                        </button>
                                    </div>

                                    {item.itemCommissionCandidates && item.itemCommissionCandidates.length > 0 ? (
                                        <div className="space-y-2">
                                            {item.itemCommissionCandidates.map((commission, commissionIndex) => (
                                                <div key={commissionIndex} className="flex flex-wrap items-center gap-2 p-3 bg-purple-50 rounded-lg">
                                                    {/* Commission Type Dropdown */}
                                                    <select
                                                        value={commission.candidateType || ""}
                                                        onChange={(e) => handleItemCommissionChange(index, commissionIndex, 'candidateType', e.target.value)}
                                                        className="flex-1 min-w-[150px] p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all duration-200 text-sm"
                                                    >
                                                        <option value="">Select Commission Type</option>
                                                        {commissionTypes.map(type => (
                                                            <option key={type.id} value={type.id}>
                                                                {type.name}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    {/* Other Candidate Input (shown only when type is 'other') */}
                                                    {commission.candidateType === 'other' && (
                                                        <input
                                                            type="text"
                                                            value={commission.otherCandidate || ""}
                                                            onChange={(e) => handleItemCommissionChange(index, commissionIndex, 'otherCandidate', e.target.value)}
                                                            placeholder="Enter custom type"
                                                            className="flex-1 min-w-[150px] p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all duration-200 text-sm"
                                                        />
                                                    )}

                                                    {/* Commission Method (INR or %) */}
                                                    <select
                                                        value={commission.commissionMethod || "percentage"}
                                                        onChange={(e) => handleItemCommissionChange(index, commissionIndex, 'commissionMethod', e.target.value)}
                                                        className="w-20 p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all duration-200 text-sm"
                                                    >
                                                        {commissionMethods.map(method => (
                                                            <option key={method.id} value={method.id}>
                                                                {method.name}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    {/* Commission Value */}
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            type="number"
                                                            value={commission.commissionValue || ""}
                                                            onChange={(e) => handleItemCommissionChange(index, commissionIndex, 'commissionValue', e.target.value)}
                                                            placeholder={commission.commissionMethod === 'percentage' ? "%" : "₹"}
                                                            step={commission.commissionMethod === 'percentage' ? "0.1" : "0.01"}
                                                            min="0"
                                                            max={commission.commissionMethod === 'percentage' ? "100" : undefined}
                                                            className="w-24 p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all duration-200 text-sm"
                                                        />
                                                        {commission.commissionMethod === 'percentage' && (
                                                            <span className="text-gray-500 text-sm">%</span>
                                                        )}
                                                    </div>

                                                    {/* Remove Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItemCommission(index, commissionIndex)}
                                                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-500 text-center py-2">No commission added for this item</p>
                                    )}
                                </div>

                                {item.inventoryId && (
                                    <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                                        <div className="text-sm text-blue-700">
                                            <strong>Cost Price:</strong> {formatCurrency(inventory.find(inv => inv._id === item.inventoryId)?.costPrice)} per {item.unit}
                                            {item.quantity && item.sellingPrice && (
                                                <span className="ml-4">
                                                    <strong>Item Total:</strong> {formatCurrency(item.quantity * item.sellingPrice)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                            </div>
                        ))}
                    </div>

                    {/* Purchase-level Commission */}
                    <div className="border border-gray-200 rounded-xl p-4 bg-white mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Purchase Commission (Optional)</h3>
                            <button
                                onClick={handleAddPurchaseCommission}
                                className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                            >
                                <Plus className="w-4 h-4" /> Add Commission
                            </button>
                        </div>

                        {form.commissionCandidates.length > 0 ? (
                            <div className="space-y-3">
                                {form.commissionCandidates.map((commission, index) => (
                                    <div key={index} className="flex flex-wrap items-center gap-3 p-3 bg-purple-50 rounded-lg">
                                        {/* Commission Type Dropdown */}
                                        <select
                                            value={commission.candidateType || ""}
                                            onChange={(e) => handlePurchaseCommissionChange(index, 'candidateType', e.target.value)}
                                            className="flex-1 min-w-[150px] p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all duration-200"
                                        >
                                            <option value="">Select Commission Type</option>
                                            {commissionTypes.map(type => (
                                                <option key={type.id} value={type.id}>
                                                    {type.name}
                                                </option>
                                            ))}
                                        </select>

                                        {/* Other Candidate Input (shown only when type is 'other') */}
                                        {commission.candidateType === 'other' && (
                                            <input
                                                type="text"
                                                value={commission.otherCandidate || ""}
                                                onChange={(e) => handlePurchaseCommissionChange(index, 'otherCandidate', e.target.value)}
                                                placeholder="Enter custom type"
                                                className="flex-1 min-w-[150px] p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all duration-200"
                                            />
                                        )}

                                        {/* Commission Method (INR or %) */}
                                        <select
                                            value={commission.commissionMethod || "percentage"}
                                            onChange={(e) => handlePurchaseCommissionChange(index, 'commissionMethod', e.target.value)}
                                            className="w-20 p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all duration-200"
                                        >
                                            {commissionMethods.map(method => (
                                                <option key={method.id} value={method.id}>
                                                    {method.name}
                                                </option>
                                            ))}
                                        </select>

                                        {/* Commission Value */}
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={commission.commissionValue || ""}
                                                onChange={(e) => handlePurchaseCommissionChange(index, 'commissionValue', e.target.value)}
                                                placeholder={commission.commissionMethod === 'percentage' ? "0.0" : "0.00"}
                                                step={commission.commissionMethod === 'percentage' ? "0.1" : "0.01"}
                                                min="0"
                                                max={commission.commissionMethod === 'percentage' ? "100" : undefined}
                                                className="w-24 p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all duration-200"
                                            />
                                            <span className="text-gray-500">
                                                {commission.commissionMethod === 'percentage' ? '%' : '₹'}
                                            </span>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePurchaseCommission(index)}
                                            className="text-red-500 hover:text-red-700 transition-colors p-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No commission added. This is optional.</p>
                        )}
                    </div>
                    {/* Summary Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">Payment Details</h3>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium text-gray-700">Sub Total:</span>
                                    <span className="font-bold text-gray-900">{formatCurrency(form.totalAmount)}</span>
                                </div>

                                {form.totalCommission > 0 && (
                                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                        <span className="font-medium text-gray-700">Total Commission:</span>
                                        <span className="font-bold text-purple-600">-{formatCurrency(form.totalCommission)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                    <span className="font-medium text-gray-700">Final Amount:</span>
                                    <span className="font-bold text-blue-600">{formatCurrency(form.finalAmount)}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount (₹) *</label>
                                <input
                                    type="number"
                                    value={form.paidAmount}
                                    onChange={(e) => setForm({ ...form, paidAmount: e.target.value })}
                                    placeholder="0"
                                    step="0.01"
                                    min="0"
                                    max={form.finalAmount}
                                    className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all duration-200"
                                />
                            </div>

                            <div className={`p-3 rounded-xl border-2 ${remainingBalance > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                                <div className="flex justify-between items-center">
                                    <span className={`text-sm font-medium ${remainingBalance > 0 ? 'text-red-800' : 'text-green-800'}`}>
                                        {remainingBalance > 0 ? 'Remaining Balance' : 'Payment Complete'}
                                    </span>
                                    <span className={`text-lg font-bold ${remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {formatCurrency(Math.abs(remainingBalance))}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">Additional Information</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
                                <textarea
                                    value={form.note}
                                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                                    placeholder="Add purchase details or remarks..."
                                    rows="6"
                                    className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all duration-200 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSubmit}
                            disabled={loading || form.finalAmount === 0 || !form.paidAmount || form.items.some(item => !item.inventoryId || !item.quantity || !item.sellingPrice)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                        >
                            {loading ? <><RefreshCw className="w-4 h-4 animate-spin" />Processing...</> : <><ShoppingCart className="w-4 h-4" />Add Purchase ({formatCurrency(form.finalAmount)})</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Add the CommissionCandidateModal component
function CommissionCandidateModal({ show, onClose, form, setForm, onSubmit, commissionTypes }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <User className="w-5 h-5 text-purple-600" />
                            Add Commission Candidate
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">✕</button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Enter candidate name"
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Type *</label>
                            <select
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all duration-200"
                            >
                                {commissionTypes.map(type => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Default Commission Rate (%)</label>
                            <input
                                type="number"
                                value={form.commissionRate}
                                onChange={(e) => setForm({ ...form, commissionRate: e.target.value })}
                                placeholder="0"
                                step="0.1"
                                min="0"
                                max="100"
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
                            <input
                                type="tel"
                                value={form.contactNumber}
                                onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                                placeholder="Enter contact number"
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all duration-200"
                            />
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
                            disabled={!form.name || !form.type}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                        >
                            <User className="w-4 h-4" /> Add Candidate
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Payment Modal (keep existing)
function PaymentModal({ show, onClose, customer, form, setForm, onSubmit, loading }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-green-600" />
                            Add Payment
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">✕</button>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl mb-4">
                        <h3 className="font-semibold text-gray-800 mb-2">Customer Details</h3>
                        <p className="text-sm text-gray-600"><strong>Name:</strong> {customer?.name}</p>
                        <p className="text-sm text-gray-600"><strong>ID:</strong> {customer?.customerId}</p>
                        <p className="text-sm text-gray-600"><strong>Current Balance:</strong> {formatCurrency(customer?.currentBalance || 0)}</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹) *</label>
                            <input
                                type="number"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                placeholder="Enter amount"
                                step="0.01"
                                min="0"
                                max={customer?.currentBalance}
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none transition-all duration-200"
                            />
                            <p className="text-xs text-gray-500 mt-1">Maximum: {formatCurrency(customer?.currentBalance || 0)}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                            <select
                                value={form.paymentMethod}
                                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none transition-all duration-200"
                            >
                                <option value="cash">Cash</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="upi">UPI</option>
                                <option value="card">Card</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Note (Optional)</label>
                            <textarea
                                value={form.note}
                                onChange={(e) => setForm({ ...form, note: e.target.value })}
                                placeholder="Add payment reference or remarks..."
                                rows="3"
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none transition-all duration-200 resize-none"
                            />
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
                            disabled={loading || !form.amount || parseFloat(form.amount) > (customer?.currentBalance || 0)}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                        >
                            {loading ? <><RefreshCw className="w-4 h-4 animate-spin" />Processing...</> : <><CreditCard className="w-4 h-4" />Add Payment</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Inventory Modal (keep existing)
function InventoryModal({ show, onClose, form, setForm, onSubmit, categories }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Warehouse className="w-5 h-5 text-green-600" />
                            Add Inventory Item
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">✕</button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                            <input
                                type="text"
                                value={form.productName}
                                onChange={(e) => setForm({ ...form, productName: e.target.value })}
                                placeholder="Enter product name"
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none transition-all duration-200"
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Stock</label>
                                <input
                                    type="number"
                                    value={form.currentStock}
                                    onChange={(e) => setForm({ ...form, currentStock: e.target.value })}
                                    placeholder="0"
                                    step="0.01"
                                    min="0"
                                    className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none transition-all duration-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
                                <select
                                    value={form.unit}
                                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none transition-all duration-200"
                                >
                                    <option value="kg">kg</option>
                                    <option value="ton">ton</option>
                                    <option value="piece">piece</option>
                                    <option value="bag">bag</option>
                                    <option value="liter">liter</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Cost Price (₹) *</label>
                            <input
                                type="number"
                                value={form.costPrice}
                                onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                                placeholder="0"
                                step="0.01"
                                min="0"
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Stock Level</label>
                            <input
                                type="number"
                                value={form.minStockLevel}
                                onChange={(e) => setForm({ ...form, minStockLevel: e.target.value })}
                                placeholder="0"
                                step="0.01"
                                min="0"
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none transition-all duration-200"
                            />
                            <p className="text-xs text-gray-500 mt-1">Alert when stock falls below this level</p>
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
                            disabled={!form.productName || !form.costPrice}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-4 h-4" /> Add Inventory
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Stock Purchase Modal (keep existing)
function StockPurchaseModal({ show, onClose, inventory, form, setForm, onSubmit }) {
    if (!show) return null;

    const selectedInventory = inventory.find(inv => inv._id === form.inventoryId);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-orange-600" />
                            Stock Purchase
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">✕</button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Product *</label>
                            <select
                                value={form.inventoryId}
                                onChange={(e) => setForm({ ...form, inventoryId: e.target.value })}
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all duration-200"
                            >
                                <option value="">Select Product</option>
                                {inventory.map((inv) => (
                                    <option key={inv._id} value={inv._id}>
                                        {inv.productName} (Current: {inv.currentStock} {inv.unit})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier *</label>
                            <input
                                type="text"
                                value={form.supplier}
                                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                                placeholder="Enter supplier name"
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all duration-200"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity *</label>
                                <input
                                    type="number"
                                    value={form.quantity}
                                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                                    placeholder="0"
                                    step="0.01"
                                    min="0"
                                    className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all duration-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
                                <select
                                    value={form.unit}
                                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all duration-200"
                                >
                                    <option value="kg">kg</option>
                                    <option value="ton">ton</option>
                                    <option value="piece">piece</option>
                                    <option value="bag">bag</option>
                                    <option value="liter">liter</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Price Per Unit (₹) *</label>
                            <input
                                type="number"
                                value={form.pricePerUnit}
                                onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })}
                                placeholder="0"
                                step="0.01"
                                min="0"
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all duration-200"
                            />
                        </div>

                        {form.quantity && form.pricePerUnit && (
                            <div className="p-3 bg-orange-50 rounded-lg">
                                <div className="text-sm text-orange-700">
                                    <strong>Total Amount:</strong> {formatCurrency(parseFloat(form.quantity) * parseFloat(form.pricePerUnit))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Bill Number</label>
                                <input
                                    type="text"
                                    value={form.billNumber}
                                    onChange={(e) => setForm({ ...form, billNumber: e.target.value })}
                                    placeholder="Optional"
                                    className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all duration-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Bill Date</label>
                                <input
                                    type="date"
                                    value={form.billDate}
                                    onChange={(e) => setForm({ ...form, billDate: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all duration-200"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Note</label>
                            <textarea
                                value={form.note}
                                onChange={(e) => setForm({ ...form, note: e.target.value })}
                                placeholder="Add purchase details..."
                                rows="3"
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all duration-200 resize-none"
                            />
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
                            disabled={!form.inventoryId || !form.supplier || !form.quantity || !form.pricePerUnit}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                        >
                            <Truck className="w-4 h-4" /> Purchase Stock
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Expense Modal (keep existing)
function ExpenseModal({ show, onClose, form, setForm, onSubmit }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-red-600" />
                            Add Expense
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">✕</button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹) *</label>
                            <input
                                type="number"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                placeholder="Enter amount"
                                step="0.01"
                                min="0"
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Expense Category *</label>
                            <select
                                value={form.expenseCategory}
                                onChange={(e) => setForm({ ...form, expenseCategory: e.target.value })}
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition-all duration-200"
                            >
                                <option value="transport">Transport</option>
                                <option value="labor">Labor</option>
                                <option value="utilities">Utilities</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="rent">Rent</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Paid To</label>
                            <input
                                type="text"
                                value={form.expenseTo}
                                onChange={(e) => setForm({ ...form, expenseTo: e.target.value })}
                                placeholder="To whom expense paid"
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Note</label>
                            <textarea
                                value={form.note}
                                onChange={(e) => setForm({ ...form, note: e.target.value })}
                                placeholder="Add expense details..."
                                rows="3"
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition-all duration-200 resize-none"
                            />
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
                            disabled={!form.amount || !form.expenseCategory}
                            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                        >
                            <Receipt className="w-4 h-4" /> Add Expense
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Commission Modal (keep existing)
function CommissionModal({ show, onClose, form, setForm, onSubmit }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Gift className="w-5 h-5 text-purple-600" />
                            Add Commission
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">✕</button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹) *</label>
                            <input
                                type="number"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                placeholder="Enter amount"
                                step="0.01"
                                min="0"
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Commission From *</label>
                            <input
                                type="text"
                                value={form.commissionFrom}
                                onChange={(e) => setForm({ ...form, commissionFrom: e.target.value })}
                                placeholder="From whom commission received"
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                            <select
                                value={form.commissionType}
                                onChange={(e) => setForm({ ...form, commissionType: e.target.value })}
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all duration-200"
                            >
                                <option value="cash">Cash</option>
                                <option value="bank">Bank Transfer</option>
                                <option value="upi">UPI</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Note</label>
                            <textarea
                                value={form.note}
                                onChange={(e) => setForm({ ...form, note: e.target.value })}
                                placeholder="Add commission details..."
                                rows="3"
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all duration-200 resize-none"
                            />
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
                            disabled={!form.amount || !form.commissionFrom}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                        >
                            <Gift className="w-4 h-4" /> Add Commission
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Damaged Goods Modal (keep existing)
function DamagedGoodsModal({ show, onClose, inventory, form, setForm, onSubmit }) {
    if (!show) return null;

    const selectedInventory = inventory.find(inv => inv._id === form.inventoryId);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-amber-600" />
                            Record Damaged Goods
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">✕</button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Product *</label>
                            <select
                                value={form.inventoryId}
                                onChange={(e) => setForm({ ...form, inventoryId: e.target.value })}
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none transition-all duration-200"
                            >
                                <option value="">Select Product</option>
                                {inventory.map((inv) => (
                                    <option key={inv._id} value={inv._id}>
                                        {inv.productName} (Stock: {inv.currentStock} {inv.unit})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Damaged Quantity *</label>
                                <input
                                    type="number"
                                    value={form.quantity}
                                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                                    placeholder="0"
                                    step="0.01"
                                    min="0"
                                    max={selectedInventory?.currentStock}
                                    className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none transition-all duration-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
                                <select
                                    value={form.unit}
                                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none transition-all duration-200"
                                >
                                    <option value="kg">kg</option>
                                    <option value="ton">ton</option>
                                    <option value="piece">piece</option>
                                    <option value="bag">bag</option>
                                    <option value="liter">liter</option>
                                </select>
                            </div>
                        </div>

                        {selectedInventory && form.quantity && (
                            <div className="p-3 bg-amber-50 rounded-lg">
                                <div className="text-sm text-amber-700">
                                    <strong>Estimated Loss:</strong> {formatCurrency(parseFloat(form.quantity) * selectedInventory.costPrice)}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Damage Reason *</label>
                            <input
                                type="text"
                                value={form.damageReason}
                                onChange={(e) => setForm({ ...form, damageReason: e.target.value })}
                                placeholder="Why was the product damaged?"
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Note</label>
                            <textarea
                                value={form.note}
                                onChange={(e) => setForm({ ...form, note: e.target.value })}
                                placeholder="Add damage details..."
                                rows="3"
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none transition-all duration-200 resize-none"
                            />
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
                            disabled={!form.inventoryId || !form.quantity || !form.damageReason}
                            className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                        >
                            <ShieldAlert className="w-4 h-4" /> Record Damage
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Bully Purchase Modal (keep existing)
function BullyPurchaseModal({ show, onClose, inventory, form, setForm, onSubmit }) {
    if (!show) return null;

    const handleAddItem = () => {
        setForm(prev => ({
            ...prev,
            items: [...prev.items, { inventoryId: "", quantity: "", unit: "kg" }]
        }));
    };

    const handleRemoveItem = (index) => {
        if (form.items.length === 1) return;
        setForm(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleItemChange = (index, field, value) => {
        setForm(prev => {
            const updatedItems = [...prev.items];
            updatedItems[index] = { ...updatedItems[index], [field]: value };
            return { ...prev, items: updatedItems };
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-indigo-600" />
                            Bully Purchase (Personal Use)
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">✕</button>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800">Purchase Items</h3>
                            <button
                                onClick={handleAddItem}
                                className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                            >
                                <Plus className="w-4 h-4" /> Add Item
                            </button>
                        </div>

                        {form.items.map((item, index) => (
                            <div key={index} className="border border-gray-200 rounded-xl p-4 bg-white">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium text-gray-700">Item {index + 1}</h4>
                                    {form.items.length > 1 && (
                                        <button
                                            onClick={() => handleRemoveItem(index)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
                                        <select
                                            value={item.inventoryId}
                                            onChange={(e) => handleItemChange(index, 'inventoryId', e.target.value)}
                                            className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all duration-200"
                                        >
                                            <option value="">Select Product</option>
                                            {inventory.map((inv) => (
                                                <option key={inv._id} value={inv._id}>
                                                    {inv.productName} (Stock: {inv.currentStock} {inv.unit})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                            placeholder="0"
                                            step="0.01"
                                            min="0"
                                            className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                        <select
                                            value={item.unit}
                                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                            className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all duration-200"
                                        >
                                            <option value="kg">kg</option>
                                            <option value="ton">ton</option>
                                            <option value="piece">piece</option>
                                            <option value="bag">bag</option>
                                            <option value="liter">liter</option>
                                        </select>
                                    </div>
                                </div>

                                {item.inventoryId && (
                                    <div className="mt-3 p-2 bg-indigo-50 rounded-lg">
                                        <div className="text-sm text-indigo-700">
                                            <strong>Cost Price:</strong> {formatCurrency(inventory.find(inv => inv._id === item.inventoryId)?.costPrice)} per {item.unit}
                                            {item.quantity && (
                                                <span className="ml-4">
                                                    <strong>Total:</strong> {formatCurrency(item.quantity * (inventory.find(inv => inv._id === item.inventoryId)?.costPrice || 0))}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier *</label>
                            <input
                                type="text"
                                value={form.bullySupplier}
                                onChange={(e) => setForm({ ...form, bullySupplier: e.target.value })}
                                placeholder="Enter supplier name"
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Bill Number</label>
                            <input
                                type="text"
                                value={form.bullyBillNumber}
                                onChange={(e) => setForm({ ...form, bullyBillNumber: e.target.value })}
                                placeholder="Optional"
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Note</label>
                            <textarea
                                value={form.note}
                                onChange={(e) => setForm({ ...form, note: e.target.value })}
                                placeholder="Add purchase details..."
                                rows="3"
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all duration-200 resize-none"
                            />
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
                            disabled={!form.bullySupplier || form.items.some(item => !item.inventoryId || !item.quantity)}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                        >
                            <ShoppingBag className="w-4 h-4" /> Record Purchase
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Reminder Modal (keep existing)
function ReminderModal({ show, onClose, customers, form, setForm, onSubmit }) {
    if (!show) return null;

    const selectedCustomer = customers.find(c => c._id === form.customerId);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            Add Payment Reminder
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">✕</button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Customer *</label>
                            <select
                                value={form.customerId}
                                onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all duration-200"
                            >
                                <option value="">Select Customer</option>
                                {customers.filter(c => c.currentBalance > 0).map((customer) => (
                                    <option key={customer._id} value={customer._id}>
                                        {customer.name} (Due: {formatCurrency(customer.currentBalance)})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedCustomer && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <div className="text-sm text-blue-700">
                                    <strong>Current Balance:</strong> {formatCurrency(selectedCustomer.currentBalance)}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Reminder Amount (₹) *</label>
                            <input
                                type="number"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                placeholder="Enter amount"
                                step="0.01"
                                min="0"
                                max={selectedCustomer?.currentBalance}
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Reminder Date *</label>
                            <input
                                type="date"
                                value={form.reminderDate}
                                onChange={(e) => setForm({ ...form, reminderDate: e.target.value })}
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Note</label>
                            <textarea
                                value={form.note}
                                onChange={(e) => setForm({ ...form, note: e.target.value })}
                                placeholder="Add reminder message..."
                                rows="3"
                                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all duration-200 resize-none"
                            />
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
                            disabled={!form.customerId || !form.amount || !form.reminderDate}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                        >
                            <Calendar className="w-4 h-4" /> Add Reminder
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Customer Transactions Modal (keep existing)
function CustomerTransactionsModal({ show, onClose, customer, transactions, loading }) {
    if (!show) return null;

    const getTransactionTypeColor = (type) => {
        switch (type) {
            case 'purchase': return 'bg-blue-100 text-blue-800';
            case 'payment': return 'bg-green-100 text-green-800';
            case 'stock_purchase': return 'bg-orange-100 text-orange-800';
            case 'expense': return 'bg-red-100 text-red-800';
            case 'commission': return 'bg-purple-100 text-purple-800';
            case 'damaged_goods': return 'bg-amber-100 text-amber-800';
            case 'reminder': return 'bg-indigo-100 text-indigo-800';
            case 'bully_purchase': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            Transaction History - {customer?.name}
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">✕</button>
                    </div>
                </div>

                <div className="overflow-auto max-h-[calc(90vh-120px)]">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading transactions...</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="p-8 text-center">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No transactions found</p>
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="space-y-4">
                                {transactions.map((transaction) => (
                                    <div key={transaction._id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors duration-200">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.type)}`}>
                                                    {transaction.type.replace('_', ' ').toUpperCase()}
                                                </span>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {new Date(transaction.createdAt).toLocaleDateString()} at {new Date(transaction.createdAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-900">
                                                    {formatCurrency(transaction.amount)}
                                                </p>
                                                {transaction.remainingBalance !== undefined && (
                                                    <p className="text-sm text-gray-500">
                                                        Balance: {formatCurrency(transaction.remainingBalance)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {transaction.note && (
                                            <p className="text-sm text-gray-600 mb-2">{transaction.note}</p>
                                        )}

                                        {transaction.purchaseCommission?.totalCommission > 0 && (
                                            <div className="mt-2 p-2 bg-purple-50 rounded-lg">
                                                <p className="text-sm text-purple-700">
                                                    <strong>Commission Deducted:</strong> {formatCurrency(transaction.purchaseCommission.totalCommission)}
                                                </p>
                                            </div>
                                        )}

                                        {transaction.items && transaction.items.length > 0 && (
                                            <div className="mt-3 border-t border-gray-200 pt-3">
                                                <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                                                <div className="space-y-2">
                                                    {transaction.items.map((item, index) => (
                                                        <div key={index} className="flex justify-between text-sm">
                                                            <span>{item.productName} ({item.quantity} {item.unit})</span>
                                                            <span>
                                                                {formatCurrency(item.total)}
                                                                {item.totalCommission > 0 && (
                                                                    <span className="ml-2 text-xs text-purple-600">(-{formatCurrency(item.totalCommission)})</span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Utility Components
function AnalyticCard({ title, value, icon: Icon, color, loading = false }) {
    const colors = {
        blue: "from-blue-500 to-blue-600",
        orange: "from-orange-500 to-orange-600",
        green: "from-green-500 to-green-600",
        purple: "from-purple-500 to-purple-600",
        emerald: "from-emerald-500 to-emerald-600",
        indigo: "from-indigo-500 to-indigo-600",
        red: "from-red-500 to-red-600",
        amber: "from-amber-500 to-amber-600",
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

function ActionButton({ icon: Icon, label, onClick, color = "blue" }) {
    const colors = {
        blue: "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200",
        green: "bg-green-50 hover:bg-green-100 text-green-700 border-green-200",
        orange: "bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200",
        red: "bg-red-50 hover:bg-red-100 text-red-700 border-red-200",
        purple: "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200",
        amber: "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200",
    };

    return (
        <button
            onClick={onClick}
            className={`p-4 rounded-xl border transition-all duration-200 flex flex-col items-center gap-2 ${colors[color]} hover:border-current`}
        >
            <Icon className="w-6 h-6" />
            <span className="text-sm font-medium">{label}</span>
        </button>
    );
}

function StatCard({ title, value, change, trend }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <span className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                    {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : trend === 'down' ? <ArrowDown className="w-4 h-4" /> : null}
                    {change}
                </span>
            </div>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg">Loading...</p>
        </div>
    );
}

function EmptyState({ message = "No data available" }) {
    return (
        <div className="p-16 text-center">
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">{message}</p>
        </div>
    );
}