"use client";

import { useState, useEffect } from "react";
import {
    useGetAllCategoriesAdminQuery,
    useCreateAdminCategoryMutation,
    useToggleCategoryStatusMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} from "@/store/features/categoryApi";
import { Pencil, Trash2, PlusCircle, Search, Filter, ChevronDown, Loader } from "lucide-react";
import { toast } from "sonner";
import slugify from "slugify";

export default function AdminCategoriesPage() {
    const { data: categories, isLoading, refetch } = useGetAllCategoriesAdminQuery();
    const [createCategory] = useCreateAdminCategoryMutation();
    const [toggleStatus] = useToggleCategoryStatusMutation();
    const [updateCategory] = useUpdateCategoryMutation();
    const [deleteCategory] = useDeleteCategoryMutation();

    const [open, setOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [form, setForm] = useState({
        name: "",
        slug: "",
        description: "",
        parentCategory: "",
    });

    // Filter categories based on search and status
    const filteredCategories = categories?.filter(cat => {
        const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            cat.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" || 
                            (filterStatus === "active" && cat.isActive) ||
                            (filterStatus === "inactive" && !cat.isActive);
        return matchesSearch && matchesStatus;
    });

    // Auto-generate slug from name
    useEffect(() => {
        if (form.name) {
            setForm((prev) => ({
                ...prev,
                slug: slugify(form.name, { lower: true }),
            }));
        }
    }, [form.name]);

    // Handle input change
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Create / Update
    const handleSubmit = async () => {
        try {
            if (editingCategory) {
                await updateCategory({ id: editingCategory._id, ...form }).unwrap();
                toast.success("Category updated successfully!");
            } else {
                const payload = {
                    name: form.name,
                    description: form.description,
                    parentCategory: form.parentCategory || null,
                };
                await createCategory(payload).unwrap();
                toast.success("Category created successfully!");
            }
            setOpen(false);
            setForm({ name: "", slug: "", description: "", parentCategory: "" });
            setEditingCategory(null);
            refetch();
        } catch (err) {
            console.error(err);
            toast.error("Operation failed!");
        }
    };

    // Delete
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            try {
                await deleteCategory(id).unwrap();
                toast.success("Category deleted!");
                refetch();
            } catch (err) {
                console.error(err);
                toast.error("Failed to delete!");
            }
        }
    };

    // Toggle Active/Inactive
    const handleToggle = async (id) => {
        try {
            await toggleStatus(id).unwrap();
            toast.success("Category status updated!");
            refetch();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update status!");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center space-y-4">
                    <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-lg font-semibold text-gray-700">Loading categories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8 border border-white/20">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        <div className="text-center lg:text-left">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                                Category Management
                            </h1>
                            <p className="text-gray-600 mt-2">Manage your product categories efficiently</p>
                        </div>
                        <button
                            onClick={() => {
                                setOpen(true);
                                setEditingCategory(null);
                                setForm({ name: "", slug: "", description: "", parentCategory: "" });
                            }}
                            className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
                        >
                            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            <PlusCircle className="w-5 h-5 relative z-10" />
                            <span className="relative z-10">Add New Category</span>
                        </button>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search categories by name or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-blue-50/50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            />
                        </div>
                        <div className="flex items-center gap-3 bg-blue-50/50 border border-blue-200 rounded-xl px-4 py-3">
                            <Filter className="w-5 h-5 text-blue-600" />
                            <select 
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-gray-700 font-medium"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredCategories?.map((cat) => (
                        <div
                            key={cat._id}
                            className="group relative bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 transform hover:scale-105 transition-all duration-300 overflow-hidden"
                        >
                            {/* Status Indicator */}
                            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${cat.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {cat.isActive ? 'Active' : 'Inactive'}
                            </div>

                            <div className="p-6">
                                {/* Category Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-800 truncate">{cat.name}</h3>
                                        <p className="text-sm text-blue-600 font-medium mt-1">/{cat.slug}</p>
                                    </div>
                                    {/* Toggle Switch */}
                                    <label className="inline-flex items-center cursor-pointer ml-3">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={cat.isActive}
                                            onChange={() => handleToggle(cat._id)}
                                        />
                                        <div className={`w-12 h-6 rounded-full transition-colors duration-300 ${cat.isActive ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                            <div className={`transform transition-transform duration-300 w-4 h-4 bg-white rounded-full mt-1 ${cat.isActive ? 'translate-x-7' : 'translate-x-1'}`}></div>
                                        </div>
                                    </label>
                                </div>

                                {/* Description */}
                                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                    {cat.description || "No description provided"}
                                </p>

                                {/* Parent Category Info */}
                                {cat.parentCategory && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-blue-50 rounded-lg px-3 py-2 mb-4">
                                        <span className="font-medium">Parent:</span>
                                        <span className="bg-white px-2 py-1 rounded-md">{cat.parentCategory.name}</span>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => {
                                            setEditingCategory(cat);
                                            setForm({
                                                name: cat.name,
                                                slug: cat.slug,
                                                description: cat.description || "",
                                                parentCategory: cat.parentCategory?._id || "",
                                            });
                                            setOpen(true);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transform hover:scale-105 transition-all duration-200 font-medium"
                                    >
                                        <Pencil className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat._id)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transform hover:scale-105 transition-all duration-200 font-medium"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredCategories?.length === 0 && (
                    <div className="text-center py-16">
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-12 border border-white/20">
                            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <PlusCircle className="w-12 h-12 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-700 mb-2">No categories found</h3>
                            <p className="text-gray-600 mb-6">Get started by creating your first category</p>
                            <button
                                onClick={() => setOpen(true)}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                            >
                                Create Category
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {open && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-3xl p-6">
                            <h2 className="text-2xl font-bold text-white">
                                {editingCategory ? "Edit Category" : "Create New Category"}
                            </h2>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Name Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter category name"
                                    className="w-full px-4 py-3 bg-blue-50/50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                />
                            </div>

                            {/* Description Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Enter category description"
                                    rows="3"
                                    className="w-full px-4 py-3 bg-blue-50/50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                                />
                            </div>

                            {/* Parent Category Dropdown */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Parent Category (optional)
                                </label>
                                <select
                                    name="parentCategory"
                                    value={form.parentCategory}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-blue-50/50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                >
                                    <option value="">None (This is a parent category)</option>
                                    {categories
                                        ?.filter(
                                            (c) =>
                                                !c.parentCategory &&
                                                (!editingCategory || c._id !== editingCategory._id)
                                        )
                                        .map((cat) => (
                                            <option key={cat._id} value={cat._id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleSubmit}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                >
                                    {editingCategory ? "Update Category" : "Create Category"}
                                </button>
                                <button
                                    onClick={() => {
                                        setOpen(false);
                                        setForm({
                                            name: "",
                                            slug: "",
                                            description: "",
                                            parentCategory: "",
                                        });
                                        setEditingCategory(null);
                                    }}
                                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}