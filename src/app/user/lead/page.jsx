"use client";
import { useState, useEffect } from "react";
import {
    FileText,
    BarChart3,
    CheckCircle,
    Clock,
    XCircle,
    Package,
    Zap,
    AlertCircle,
    LogOut,
    User,
    Plus,
    X,
    ChevronDown,
    Loader2,
    Edit,
    Save
} from "lucide-react";
import {
    useGetUserLeadsQuery,
    useCreateLeadMutation,
    useUpdateLeadMutation,
} from "../../../../src/store/features/leadsApi";

export default function LeadManagement() {
    const [formData, setFormData] = useState({
        category: "",
        product: "",
        quantity: "",
        quantity_unit: "kg",
        quality_type: "",
        price_range_start: "",
        price_range_end: "",
        delivery_location: "",
        description: "",
        allow_sellers_contact: false,
        buyer_contact_phone: "",
        buyer_contact_email: "",
    });

    const [formErrors, setFormErrors] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [editingLead, setEditingLead] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [isClient, setIsClient] = useState(false);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
    const [isQualityDropdownOpen, setIsQualityDropdownOpen] = useState(false);
    const [isQuantityUnitDropdownOpen, setIsQuantityUnitDropdownOpen] = useState(false);

    // Hardcoded Categories Data
    const categories = [
        { _id: "1", name: "Vegetables", description: "Fresh vegetables and greens" },
        { _id: "2", name: "Fruits", description: "Seasonal and exotic fruits" },
        { _id: "3", name: "Pulses", description: "Lentils, beans and legumes" },
        { _id: "4", name: "Grains", description: "Cereals and grains" },
        { _id: "5", name: "Spices", description: "Indian spices and masalas" },
        { _id: "6", name: "Oil Seeds", description: "Oil seeds and edible seeds" },
        { _id: "7", name: "Dry Fruits", description: "Nuts and dry fruits" },
    ];

    // Helper function to get category name by ID
    const getCategoryNameById = (categoryId) => {
        const category = categories.find(cat => cat._id === categoryId);
        return category ? category.name : null;
    };

    // Product data based on categories
    const productData = {
        vegetables: [
            "Onion (प्याज)", "Garlic (लहसुन)", "Potato (आलू)", "Tomato (टमाटर)", "Carrot (गाजर)",
            "Cabbage (पत्ता गोभी)", "Cauliflower (फूल गोभी)", "Spinach (पालक)", "Brinjal / Eggplant (बैंगन)",
            "Green Chili (हरी मिर्च)", "Peas (मटर)", "Pumpkin (कद्दू)", "Radish (मूली)", "Lady Finger / Okra (भिंडी)",
            "Bitter Gourd (करेला)", "Bottle Gourd (लौकी)", "Ridge Gourd (तोरी)", "Cucumber (खीरा)",
            "Drumstick (सहजन)", "Beans (बीन्स)", "Sweet Potato (शकरकंद)", "Turnip (शलगम)",
            "Ginger (अदरक)", "Raw Turmeric (कच्ची हल्दी)", "Beetroot (चकुंदर)", "Coriander Leaves (हरा धनिया)",
            "Mint Leaves (पुदीना)", "Fenugreek Leaves (मेथी)", "Spring Onion (हरा प्याज)", "Green Capsicum (शिमला मिर्च)"
        ],
        fruits: [
            "Mango (आम)", "Banana (केला)", "Apple (सेब)", "Orange (संतरा)", "Papaya (पपीता)",
            "Grapes (अंगूर)", "Watermelon (तरबूज)", "Pomegranate (अनार)", "Guava (अमरूद)",
            "Lemon (नींबू)", "Pineapple (अनानास)", "Litchi (लीची)", "Sapota / Chikoo (चीकू)",
            "Custard Apple (सीताफल)", "Jackfruit (कटहल)", "Muskmelon (खरबूजा)", "Pear (नाशपाती)",
            "Plum (आलूबुखारा)", "Fig (अंजीर)", "Date / Khajur (खजूर)", "Kiwi (कीवी)", "Strawberry (स्ट्रॉबेरी)",
            "Cherry (चेरी)", "Blueberry (ब्लूबेरी)", "Dragon Fruit (ड्रैगन फ्रूट)", "Avocado (एवोकाडो)",
            "Passion Fruit (पैशन फ्रूट)", "Gooseberry / Amla (आंवला)", "Tamarind / Imli (इमली)"
        ],
        pulses: [
            "Masoor Dal (मसूर दाल)", "Moong Dal (मूंग दाल)", "Urad Dal (उड़द दाल)", "Chana Dal (चना दाल)",
            "Toor / Arhar Dal (अरहर दाल)", "Rajma (राजमा)", "Kabuli Chana (काबुली चना)", "Desi Chana (देसी चना)",
            "Horse Gram (कुल्थी)", "Cowpea / Lobia (लोबिया)", "Moth Bean (मटकी)", "Green Peas Dry (सूखी मटर)",
            "Yellow Split Peas (पीली मटर दाल)", "Field Peas (फील्ड मटर)", "Adzuki Beans (अजुकी बीन्स)",
            "Lentil Split Red (लाल मसूर)", "Lentil Split Yellow (पीली मसूर)", "Black Chickpeas (काला चना)",
            "White Peas (सफेद मटर)", "Soybean (सोयाबीन)", "Black-eyed Peas (लोबिया / चवला)"
        ],
        grains: [
            "Rice - Basmati (बासमती चावल)", "Rice - Non-Basmati (चावल)", "Rice - Parboiled (पारबोइल चावल)",
            "Wheat (गेहूं)", "Maize / Corn (मक्का)", "Barley (जौ)", "Bajra / Pearl Millet (बाजरा)",
            "Jowar / Sorghum (ज्वार)", "Ragi / Finger Millet (रागी)", "Foxtail Millet (कंगनी)",
            "Barnyard Millet (सांवा)", "Kodo Millet (कोदो)", "Little Millet (कुटकी)", "Oats (जई)",
            "Quinoa (क्विनोआ)", "Buckwheat (कुट्टू)", "Amaranth (राजगीरा)", "Poha (चूड़ा)",
            "Muri (मुरमुरा)", "Suji / Semolina (सूजी)", "Corn Flour (मक्के का आटा)"
        ],
        spices: [
            "Turmeric (हल्दी)", "Dry Ginger (सूखी अदरक)", "Red Chili (लाल मिर्च)", "Black Pepper (काली मिर्च)",
            "Cumin (जीरा)", "Coriander Seeds (धनिया)", "Cloves (लौंग)", "Cardamom (इलायची)",
            "Cinnamon (दालचीनी)", "Bay Leaf (तेजपत्ता)", "Fennel (सौंफ)", "Fenugreek Seeds (मेथी दाना)",
            "Mustard Seeds (सरसों दाना)", "Carom Seeds / Ajwain (अजवाइन)", "Nigella Seeds / Kalonji (कलौंजी)",
            "Asafoetida / Hing (हींग)", "Curry Leaves (करी पत्ता)", "Star Anise (चक्रफूल)", "Mace / Javitri (जावित्री)",
            "Nutmeg (जायफल)", "Dry Mango Powder / Amchur (अमचूर)", "Tamarind / Imli (इमली)",
            "Poppy Seeds / Khus Khus (खसखस)", "Sesame Seeds / Til (तिल)", "Saffron / Kesar (केसर)"
        ],
        oilseeds: [
            "Mustard Seeds (सरसों)", "Groundnut / Peanut (मूंगफली)", "Sesame / Til (तिल)",
            "Sunflower Seeds (सूरजमुखी बीज)", "Soybean (सोयाबीन)", "Castor Seeds (अरंडी)",
            "Cotton Seeds (रुई बीज)", "Flax Seeds / Alsi (अलसी)", "Niger Seeds (रामतिल)",
            "Watermelon Seeds (तरबूज बीज)", "Pumpkin Seeds (कद्दू बीज)", "Chia Seeds (चिया बीज)"
        ],
        dryfruits: [
            "Almonds (बादाम)", "Cashew Nuts (काजू)", "Walnuts (अखरोट)", "Raisins (किशमिश)",
            "Dates (खजूर)", "Pistachio (पिस्ता)", "Dry Figs (अंजीर)", "Fox Nuts / Makhana (मखाना)",
            "Peanuts (ड्राई मूंगफली)", "Hazelnuts (हैज़लनट्स)", "Macadamia Nuts (मैकाडामिया नट्स)",
            "Brazil Nuts (ब्राज़ील नट्स)", "Pine Nuts / Chilgoza (चिलगोजा)", "Betel Nut / Supari (सुपारी)",
            "Coconut Kernel (नारियल गिरी)", "Dry Coconut / Copra (सूखा नारियल)"
        ]
    };

    // Quality options
    const qualityOptions = [
        "A Grade",
        "Premium",
        "Organic",
        "Export Quality",
        "Commercial Grade",
        "Standard Quality"
    ];

    // Unit options - only kg and ton
    const unitOptions = ["kg", "ton"];

    // Set client-side flag
    useEffect(() => {
        setIsClient(true);
        // Get basic user info from token or localStorage
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const userData = localStorage.getItem("user");
                if (userData) {
                    setUserInfo(JSON.parse(userData));
                }
            } catch (error) {
                console.error("Error parsing user data:", error);
            }
        }
    }, []);

    // RTK Query Hooks
    const {
        data: leadsResponse,
        isLoading: leadsLoading,
        error: leadsError,
        refetch: refetchLeads,
    } = useGetUserLeadsQuery(undefined, {
        skip: !isClient
    });

    const [createLead, { isLoading: creating, error: createError }] = useCreateLeadMutation();
    const [updateLead, { isLoading: updating, error: updateError }] = useUpdateLeadMutation();

    // Extract leads from response
    const leads = leadsResponse || [];

    // Get products based on selected category
    const getProductsForCategory = () => {
        if (!formData.category) return [];

        const selectedCategory = categories.find(cat => cat._id === formData.category);
        if (!selectedCategory) return [];

        const categoryName = selectedCategory.name.toLowerCase();

        // Map category names to product data keys
        const categoryMap = {
            'vegetables': 'vegetables',
            'fruits': 'fruits',
            'pulses': 'pulses',
            'grains': 'grains',
            'spices': 'spices',
            'oil seeds': 'oilseeds',
            'dry fruits': 'dryfruits'
        };

        const productKey = categoryMap[categoryName];
        return productData[productKey] || [];
    };

    const availableProducts = getProductsForCategory();

    // Analytics Counts
    const analytics = {
        total: Array.isArray(leads) ? leads.length : 0,
        approved: Array.isArray(leads) ? leads.filter((l) => l.status === "approved").length : 0,
        pending: Array.isArray(leads) ? leads.filter((l) => l.status === "pending").length : 0,
        rejected: Array.isArray(leads) ? leads.filter((l) => l.status === "rejected").length : 0,
        sold: Array.isArray(leads) ? leads.filter((l) => l.status === "sold").length : 0,
    };

    // Form Validation
    const validateForm = () => {
        const errors = {};

        if (!formData.category) errors.category = "Category is required";
        if (!formData.product) errors.product = "Product is required";
        if (!formData.quantity) errors.quantity = "Quantity is required";
        if (!formData.delivery_location) errors.delivery_location = "Delivery location is required";
        if (!formData.description) errors.description = "Description is required";

        // Validate price range
        if (formData.price_range_start && formData.price_range_end) {
            if (parseFloat(formData.price_range_start) >= parseFloat(formData.price_range_end)) {
                errors.price_range = "End price must be greater than start price";
            }
        }

        // Contact info validation - always mandatory now
        if (!formData.buyer_contact_phone) errors.buyer_contact_phone = "Phone number is required";
        if (!formData.buyer_contact_email) errors.buyer_contact_email = "Email address is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Form Change Handler
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        // Clear error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    // Handle category selection
    const handleCategorySelect = (categoryId, categoryName) => {
        setFormData(prev => ({
            ...prev,
            category: categoryId,
            product: "" // Reset product when category changes
        }));
        setIsCategoryDropdownOpen(false);
        setIsProductDropdownOpen(false);
    };

    // Handle product selection
    const handleProductSelect = (product) => {
        setFormData(prev => ({
            ...prev,
            product: product
        }));
        setIsProductDropdownOpen(false);
    };

    // Handle quality type selection
    const handleQualitySelect = (quality) => {
        setFormData(prev => ({
            ...prev,
            quality_type: quality
        }));
        setIsQualityDropdownOpen(false);
    };

    // Handle quantity unit selection
    const handleQuantityUnitSelect = (unit) => {
        setFormData(prev => ({
            ...prev,
            quantity_unit: unit
        }));
        setIsQuantityUnitDropdownOpen(false);
    };

    // Edit Lead Function
    const handleEditLead = (lead) => {
        // Parse quantity and unit from existing lead
        const quantityMatch = lead.quantity.match(/(\d+(?:\.\d+)?)\s*(\w+)/);
        const quantityValue = quantityMatch ? quantityMatch[1] : "";
        const quantityUnit = quantityMatch ? quantityMatch[2] : "kg";

        // Parse price range if exists
        let priceStart = "";
        let priceEnd = "";
        if (lead.price_range) {
            const priceMatch = lead.price_range.match(/₹(\d+)\s*-\s*₹(\d+)/);
            if (priceMatch) {
                priceStart = priceMatch[1];
                priceEnd = priceMatch[2];
            }
        }

        setFormData({
            category: lead.category,
            product: lead.product,
            quantity: quantityValue,
            quantity_unit: quantityUnit,
            quality_type: lead.quality_type || "",
            price_range_start: priceStart,
            price_range_end: priceEnd,
            delivery_location: lead.delivery_location,
            description: lead.description,
            allow_sellers_contact: lead.allow_sellers_contact || false,
            buyer_contact_phone: lead.buyer_contact_phone || "",
            buyer_contact_email: lead.buyer_contact_email || "",
        });

        setEditingLead(lead);
        setShowForm(true);
    };

    // Logout function
    const handleLogout = () => {
        if (isClient) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
    };

    // Submit Lead - FIXED VERSION
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            alert("Please fill all required fields correctly");
            return;
        }

        // Prepare data for API
        const submitData = {
            category: formData.category,
            product: formData.product,
            quantity: `${formData.quantity} ${formData.quantity_unit}`,
            quality_type: formData.quality_type,
            delivery_location: formData.delivery_location,
            description: formData.description,
            price_range: formData.price_range_start && formData.price_range_end
                ? `₹${formData.price_range_start} - ₹${formData.price_range_end} per ${formData.quantity_unit}`
                : "",
            allow_sellers_contact: formData.allow_sellers_contact,
            buyer_contact_phone: formData.buyer_contact_phone,
            buyer_contact_email: formData.buyer_contact_email,
        };

        // Remove empty fields
        Object.keys(submitData).forEach(key => {
            if (submitData[key] === "" || submitData[key] === undefined) {
                delete submitData[key];
            }
        });

        try {
            if (editingLead) {
                // Update existing lead - FIXED: Use 'id' parameter
                console.log("🔄 Updating lead:", { id: editingLead._id, ...submitData });
                const result = await updateLead({
                    id: editingLead._id, // This is the fix
                    ...submitData
                }).unwrap();
                console.log("✅ Lead updated successfully:", result);
                alert("Lead updated successfully!");
            } else {
                // Create new lead
                console.log("🔄 Submitting lead:", submitData);
                const result = await createLead(submitData).unwrap();
                console.log("✅ Lead created successfully:", result);
                alert("Lead submitted successfully!");
            }

            handleResetForm();
            refetchLeads();
        } catch (err) {
            console.error("❌ Lead submission failed:", err);
            const errorMessage = err?.data?.message ||
                err?.error ||
                "Failed to submit lead. Please try again.";
            alert(`Error: ${errorMessage}`);
        }
    };

    // Reset form
    const handleResetForm = () => {
        setFormData({
            category: "",
            product: "",
            quantity: "",
            quantity_unit: "kg",
            quality_type: "",
            price_range_start: "",
            price_range_end: "",
            delivery_location: "",
            description: "",
            allow_sellers_contact: false,
            buyer_contact_phone: "",
            buyer_contact_email: "",
        });
        setFormErrors({});
        setShowForm(false);
        setEditingLead(null);
        setIsCategoryDropdownOpen(false);
        setIsProductDropdownOpen(false);
        setIsQualityDropdownOpen(false);
        setIsQuantityUnitDropdownOpen(false);
    };

    // Get selected category name
    const getSelectedCategoryName = () => {
        if (!formData.category) return "Select Category";
        const selectedCategory = categories.find(cat => cat._id === formData.category);
        return selectedCategory ? selectedCategory.name : "Select Category";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/10 rounded-2xl shadow-sm">
                        <FileText className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                            Lead Management
                        </h1>
                        {userInfo && (
                            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <strong>{userInfo.name || "User"}</strong> ({userInfo.email || "user@example.com"})
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Create Lead Button */}
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        <Plus className="w-4 h-4" />
                        Create Lead
                    </button>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-red-50 text-red-600 rounded-xl text-sm font-medium transition-all duration-200 border border-red-200 hover:border-red-300 shadow-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Error Display */}
            {(createError || updateError) && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-4 rounded-xl mb-6 shadow-sm">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <strong className="font-semibold">
                                {updateError ? "Error Updating Lead" : "Error Creating Lead"}
                            </strong>
                            <p className="text-sm mt-1.5">
                                {(updateError || createError)?.data?.message || 
                                 (updateError || createError)?.error || 
                                 "Failed to process lead. Please try again."}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <MetricCard
                    title="Total Leads"
                    value={analytics.total}
                    icon={BarChart3}
                    color="blue"
                    loading={leadsLoading}
                />
                <MetricCard
                    title="Approved"
                    value={analytics.approved}
                    icon={CheckCircle}
                    color="green"
                    loading={leadsLoading}
                />
                <MetricCard
                    title="Pending"
                    value={analytics.pending}
                    icon={Clock}
                    color="orange"
                    loading={leadsLoading}
                />
                <MetricCard
                    title="Rejected"
                    value={analytics.rejected}
                    icon={XCircle}
                    color="red"
                    loading={leadsLoading}
                />
                <MetricCard
                    title="Sold"
                    value={analytics.sold}
                    icon={Package}
                    color="purple"
                    loading={leadsLoading}
                />
            </div>

            {/* Create/Edit Lead Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
                        <div className="p-6 sm:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                        <Package className="w-6 h-6 text-blue-600" />
                                        {editingLead ? "Edit Lead" : "Create New Lead"}
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {editingLead ? "Update the lead details" : "Fill in the details to create a new lead"}
                                    </p>
                                </div>
                                <button
                                    onClick={handleResetForm}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Category Select */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Category *
                                    </label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 ${formErrors.category
                                                    ? "border-red-300 bg-red-50 focus:border-red-500"
                                                    : "border-gray-200 bg-white focus:border-blue-500 hover:border-gray-300"
                                                } ${isCategoryDropdownOpen ? "border-blue-500 ring-2 ring-blue-200" : ""}`}
                                        >
                                            <span className={`${!formData.category ? "text-gray-500" : "text-gray-900"}`}>
                                                {getSelectedCategoryName()}
                                            </span>
                                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isCategoryDropdownOpen ? "rotate-180" : ""}`} />
                                        </button>

                                        {isCategoryDropdownOpen && (
                                            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                                {categories.length === 0 ? (
                                                    <div className="p-4 text-center text-gray-500">
                                                        No categories available
                                                    </div>
                                                ) : (
                                                    categories.map((category) => (
                                                        <button
                                                            key={category._id}
                                                            type="button"
                                                            onClick={() => handleCategorySelect(category._id, category.name)}
                                                            className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${formData.category === category._id ? "bg-blue-50 text-blue-700" : "text-gray-700"
                                                                }`}
                                                        >
                                                            <div className="font-medium">{category.name}</div>
                                                            {category.description && (
                                                                <div className="text-sm text-gray-500 mt-1">{category.description}</div>
                                                            )}
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {formErrors.category && (
                                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {formErrors.category}
                                        </p>
                                    )}
                                </div>

                                {/* Product Dropdown */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Product *
                                    </label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => formData.category && setIsProductDropdownOpen(!isProductDropdownOpen)}
                                            disabled={!formData.category}
                                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 ${formErrors.product
                                                    ? "border-red-300 bg-red-50 focus:border-red-500"
                                                    : formData.category
                                                        ? "border-gray-200 bg-white focus:border-blue-500 hover:border-gray-300"
                                                        : "border-gray-200 bg-gray-100 cursor-not-allowed"
                                                } ${isProductDropdownOpen ? "border-blue-500 ring-2 ring-blue-200" : ""}`}
                                        >
                                            <span className={`${!formData.product ? "text-gray-500" : "text-gray-900"}`}>
                                                {formData.product || (formData.category ? "Select Product" : "Select category first")}
                                            </span>
                                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isProductDropdownOpen ? "rotate-180" : ""
                                                } ${!formData.category ? "text-gray-300" : ""}`} />
                                        </button>

                                        {isProductDropdownOpen && formData.category && (
                                            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                                {availableProducts.length === 0 ? (
                                                    <div className="p-4 text-center text-gray-500">
                                                        No products available for this category
                                                    </div>
                                                ) : (
                                                    availableProducts.map((product, index) => (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            onClick={() => handleProductSelect(product)}
                                                            className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${formData.product === product ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"
                                                                }`}
                                                        >
                                                            {product}
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {formErrors.product && (
                                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {formErrors.product}
                                        </p>
                                    )}
                                    {formData.category && availableProducts.length > 0 && (
                                        <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4" />
                                            {availableProducts.length} products available in this category
                                        </p>
                                    )}
                                </div>

                                {/* Quantity with Unit */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Quantity *
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            name="quantity"
                                            type="number"
                                            placeholder="e.g., 1000"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            required
                                            className={`flex-1 p-4 rounded-xl border-2 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 ${formErrors.quantity
                                                    ? "border-red-300 bg-red-50 focus:border-red-500"
                                                    : "border-gray-200 bg-white focus:border-blue-500 hover:border-gray-300"
                                                }`}
                                        />
                                        <div className="relative w-32">
                                            <button
                                                type="button"
                                                onClick={() => setIsQuantityUnitDropdownOpen(!isQuantityUnitDropdownOpen)}
                                                className="w-full h-full p-4 rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 hover:border-gray-300 flex items-center justify-between"
                                            >
                                                <span className="font-medium">{formData.quantity_unit}</span>
                                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isQuantityUnitDropdownOpen ? "rotate-180" : ""}`} />
                                            </button>

                                            {isQuantityUnitDropdownOpen && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                                    {unitOptions.map((unit) => (
                                                        <button
                                                            key={unit}
                                                            type="button"
                                                            onClick={() => handleQuantityUnitSelect(unit)}
                                                            className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${formData.quantity_unit === unit ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"
                                                                }`}
                                                        >
                                                            {unit}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {formErrors.quantity && (
                                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {formErrors.quantity}
                                        </p>
                                    )}
                                </div>

                                {/* Quality Type Dropdown */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Quality Type
                                    </label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setIsQualityDropdownOpen(!isQualityDropdownOpen)}
                                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 ${formErrors.quality_type
                                                    ? "border-red-300 bg-red-50 focus:border-red-500"
                                                    : "border-gray-200 bg-white focus:border-blue-500 hover:border-gray-300"
                                                } ${isQualityDropdownOpen ? "border-blue-500 ring-2 ring-blue-200" : ""}`}
                                        >
                                            <span className={`${!formData.quality_type ? "text-gray-500" : "text-gray-900"}`}>
                                                {formData.quality_type || "Select Quality Type"}
                                            </span>
                                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isQualityDropdownOpen ? "rotate-180" : ""}`} />
                                        </button>

                                        {isQualityDropdownOpen && (
                                            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                                {qualityOptions.map((quality) => (
                                                    <button
                                                        key={quality}
                                                        type="button"
                                                        onClick={() => handleQualitySelect(quality)}
                                                        className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${formData.quality_type === quality ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"
                                                            }`}
                                                    >
                                                        {quality}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Price Range (per {formData.quantity_unit})
                                    </label>
                                    <div className="flex gap-3 items-center">
                                        <div className="flex-1 flex gap-3">
                                            <input
                                                name="price_range_start"
                                                type="number"
                                                placeholder="Start"
                                                value={formData.price_range_start}
                                                onChange={handleChange}
                                                className="w-full p-4 rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 hover:border-gray-300"
                                            />
                                            <span className="flex items-center text-gray-500 font-medium">to</span>
                                            <input
                                                name="price_range_end"
                                                type="number"
                                                placeholder="End"
                                                value={formData.price_range_end}
                                                onChange={handleChange}
                                                className="w-full p-4 rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 hover:border-gray-300"
                                            />
                                        </div>
                                        <div className="w-20 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-center">
                                            <span className="text-sm font-medium text-gray-700">{formData.quantity_unit}</span>
                                        </div>
                                    </div>
                                    {formErrors.price_range && (
                                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {formErrors.price_range}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Delivery Location *
                                        </label>
                                        <input
                                            name="delivery_location"
                                            placeholder="e.g., Lahore, Karachi, Delhi, Mumbai"
                                            value={formData.delivery_location}
                                            onChange={handleChange}
                                            required
                                            className={`w-full p-4 rounded-xl border-2 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 ${formErrors.delivery_location
                                                    ? "border-red-300 bg-red-50 focus:border-red-500"
                                                    : "border-gray-200 bg-white focus:border-blue-500 hover:border-gray-300"
                                                }`}
                                        />
                                        {formErrors.delivery_location && (
                                            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {formErrors.delivery_location}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        placeholder="Please provide a detailed description of your requirements, specifications, quality standards, delivery timeline, and any other relevant information that sellers should know..."
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={5}
                                        required
                                        className={`w-full p-4 rounded-xl border-2 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 resize-none ${formErrors.description
                                                ? "border-red-300 bg-red-50 focus:border-red-500"
                                                : "border-gray-200 bg-white focus:border-blue-500 hover:border-gray-300"
                                            }`}
                                    />
                                    {formErrors.description && (
                                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {formErrors.description}
                                        </p>
                                    )}
                                </div>

                                {/* Contact Information - Always Required */}
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Contact Information (Required)
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                Phone Number *
                                            </label>
                                            <input
                                                name="buyer_contact_phone"
                                                type="tel"
                                                placeholder="+92 300 1234567"
                                                value={formData.buyer_contact_phone}
                                                onChange={handleChange}
                                                required
                                                className={`w-full p-4 rounded-xl border-2 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 ${formErrors.buyer_contact_phone
                                                        ? "border-red-300 bg-red-50 focus:border-red-500"
                                                        : "border-gray-200 bg-white focus:border-blue-500 hover:border-gray-300"
                                                    }`}
                                            />
                                            {formErrors.buyer_contact_phone && (
                                                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {formErrors.buyer_contact_phone}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                Email Address *
                                            </label>
                                            <input
                                                name="buyer_contact_email"
                                                type="email"
                                                placeholder="your.email@example.com"
                                                value={formData.buyer_contact_email}
                                                onChange={handleChange}
                                                required
                                                className={`w-full p-4 rounded-xl border-2 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 ${formErrors.buyer_contact_email
                                                        ? "border-red-300 bg-red-50 focus:border-red-500"
                                                        : "border-gray-200 bg-white focus:border-blue-500 hover:border-gray-300"
                                                    }`}
                                            />
                                            {formErrors.buyer_contact_email && (
                                                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {formErrors.buyer_contact_email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Sharing Option */}
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <input
                                        type="checkbox"
                                        id="allow_contact"
                                        name="allow_sellers_contact"
                                        checked={formData.allow_sellers_contact}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    />
                                    <label htmlFor="allow_contact" className="text-sm text-gray-700 cursor-pointer font-medium">
                                        Share my contact information with sellers
                                        <span className="block text-xs text-gray-500 font-normal mt-1">
                                            Your contact details will be visible to sellers who purchase this lead. Contact information is always required for lead verification.
                                        </span>
                                    </label>
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleResetForm}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-6 rounded-xl font-semibold transition-all duration-200 border border-gray-300 hover:border-gray-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating || updating}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                                    >
                                        {(creating || updating) ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                {editingLead ? "Updating Lead..." : "Submitting Lead..."}
                                        </>
                                    ) : (
                                        <>
                                            {editingLead ? <Save className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                            {editingLead ? "Update Lead" : "Submit Lead"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )}

        {/* Leads List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-600" /> My Submitted Leads
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Manage and track your lead submissions</p>
                </div>
                <button
                    onClick={refetchLeads}
                    disabled={leadsLoading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium transition-all duration-200 border border-gray-300 hover:border-gray-400 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Refresh
                </button>
            </div>

            {leadsLoading ? (
                <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 text-lg">Loading your leads...</p>
                    <p className="text-gray-400 text-sm mt-1">Please wait while we fetch your data</p>
                </div>
            ) : leadsError ? (
                <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <p className="text-red-500 text-lg mb-2">
                        Error loading leads
                    </p>
                    <p className="text-gray-600 mb-4">
                        {leadsError?.data?.message || "Unable to load your leads. Please check your connection."}
                    </p>
                    <button
                        onClick={refetchLeads}
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            ) : (!leads || leads.length === 0) ? (
                <div className="text-center py-16">
                    <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No leads submitted yet</p>
                    <p className="text-gray-400 mb-6">Get started by creating your first lead</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                    >
                        Create Your First Lead
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {leads.map((lead) => (
                        <LeadCard 
                            key={lead._id} 
                            lead={lead} 
                            getCategoryNameById={getCategoryNameById}
                            onEditLead={handleEditLead}
                        />
                    ))}
                </div>
            )}
        </div>
    </div>
);
}

// Lead Card Component
function LeadCard({ lead, getCategoryNameById, onEditLead }) {
    const getStatusConfig = (status) => {
        const config = {
            approved: {
                color: "bg-green-50 text-green-700 border-green-200",
                icon: CheckCircle,
                badge: "bg-green-100 text-green-800"
            },
            pending: {
                color: "bg-orange-50 text-orange-700 border-orange-200",
                icon: Clock,
                badge: "bg-orange-100 text-orange-800"
            },
            rejected: {
                color: "bg-red-50 text-red-700 border-red-200",
                icon: XCircle,
                badge: "bg-red-100 text-red-800"
            },
            sold: {
                color: "bg-purple-50 text-purple-700 border-purple-200",
                icon: Package,
                badge: "bg-purple-100 text-purple-800"
            },
        };
        return config[status] || {
            color: "bg-gray-50 text-gray-700 border-gray-200",
            icon: FileText,
            badge: "bg-gray-100 text-gray-800"
        };
    };

    const statusConfig = getStatusConfig(lead.status);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 bg-white group hover:border-blue-200">
            <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                    {getCategoryNameById(lead.category) || "Unknown Category"}
                </h3>
                
                <div className="flex items-center gap-2">
                    {/* Edit Button - Only show for pending leads, always visible */}
                    {lead.status === "pending" && (
                        <button
                            onClick={() => onEditLead(lead)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all duration-200"
                            title="Edit Lead"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    )}
                    
                    <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusConfig.color} flex items-center gap-1.5`}
                    >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {lead.status?.charAt(0).toUpperCase() + lead.status?.slice(1)}
                    </span>
                </div>
            </div>

            <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                        <strong className="text-gray-700">Product:</strong> {lead.product}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                        <strong className="text-gray-700">Quantity:</strong> {lead.quantity}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                        <strong className="text-gray-700">Location:</strong> {lead.delivery_location}
                    </span>
                </div>

                {lead.quality_type && (
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                            <strong className="text-gray-700">Quality:</strong> {lead.quality_type}
                        </span>
                    </div>
                )}

                {lead.price_range && (
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                            <strong className="text-gray-700">Price Range:</strong> {lead.price_range}
                        </span>
                    </div>
                )}

                {lead.lead_price && (
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-500" />
                        <span className="text-blue-600 font-semibold">
                            <strong>Lead Price:</strong> ₹{lead.lead_price}
                        </span>
                    </div>
                )}
            </div>

            <p className="text-sm text-gray-700 mt-4 line-clamp-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                {lead.description}
            </p>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                    Created: {new Date(lead.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}
                </p>
                {lead.allow_sellers_contact && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                        Contact Shared
                    </span>
                )}
            </div>
        </div>
    );
}

// Metric Card Component
function MetricCard({ title, value, icon: Icon, color, loading = false }) {
    const colors = {
        blue: "from-blue-500 to-blue-600",
        green: "from-green-500 to-green-600",
        orange: "from-orange-500 to-orange-600",
        red: "from-red-500 to-red-600",
        purple: "from-purple-500 to-purple-600",
    };

    return (
        <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 group hover:scale-105">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">{title}</p>
                    {loading ? (
                        <div className="w-12 h-7 bg-gray-200 rounded-lg animate-pulse"></div>
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