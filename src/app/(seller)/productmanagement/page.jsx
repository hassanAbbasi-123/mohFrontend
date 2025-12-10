"use client";

import { useState, useEffect } from "react";
import ProductForm from "@/components/products/ProductForm";
import CouponModal from "@/components/products/CouponModal";

import {
  useGetMyProductsQuery,
  useCreateProductMutation,
  useUpdateOwnProductMutation,
  useDeleteOwnProductMutation,
  useToggleStockMutation,
  useToggleSaleMutation,
  useApplyCouponMutation,
  useRemoveCouponFromSellerProductMutation,
} from "@/store/features/productApi";

import { useGetAllCategoriesWithSubForSellerQuery } from "@/store/features/categoryApi";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const SellerProducts = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filter, setFilter] = useState("all");
  const [viewProduct, setViewProduct] = useState(null);

  // Success message
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    }
  }, []);

  const { data: categoriesData, isLoading: categoriesLoading } = useGetAllCategoriesWithSubForSellerQuery();
  const categories = categoriesData || [];

  const { data: productsData, isLoading, error, refetch } = useGetMyProductsQuery(undefined, {
    skip: !token,
  });

  // Normalize backend response into an array
  const products = Array.isArray(productsData) ? productsData : [];

  // Debug log to check what backend is returning
  useEffect(() => {
    console.log("Fetched productsData:", productsData);
    console.log("Fetched categoriesData:", categoriesData);
  }, [productsData, categoriesData]);

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateOwnProductMutation();
  const [deleteProduct] = useDeleteOwnProductMutation();
  const [toggleStock] = useToggleStockMutation();
  const [toggleSale] = useToggleSaleMutation();
  const [applyCoupon] = useApplyCouponMutation();
  const [removeCoupon] = useRemoveCouponFromSellerProductMutation();

  useEffect(() => {
    if (!showForm) setEditingProduct(null);
  }, [showForm]);

  if (!user || user.role !== "seller") return null;

  if (isLoading || categoriesLoading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  // Show error only if there is a network/server failure
  if (error && !products.length) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm max-w-md w-full text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-medium text-lg mb-2">Failed to load products</h3>
          <p className="text-sm">Please try again later or check your connection.</p>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter((p) => {
    if (filter === "all") return true;
    if (filter === "approved") return p.status === "approved";
    if (filter === "pending") return p.status === "pending";
    if (filter === "rejected") return p.status === "rejected";
    if (filter === "out-of-season") return p.status === "out-of-season";
    if (filter === "inStock") return p.inStock;
    if (filter === "outOfStock") return !p.inStock;
    if (filter === "onSale") return p.isOnSale;
    return true;
  });

  const handleCreateProduct = async (formData) => {
    try {
      const res = await createProduct(formData).unwrap();
      console.log("Created product:", res.product);
      setShowForm(false);
      refetch();
      setSuccessMessage("Product added successfully and is waiting for admin approval.");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProduct = async (formData) => {
    try {
      await updateProduct({ id: editingProduct._id, formData }).unwrap();
      setShowForm(false);
      setEditingProduct(null);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id).unwrap();
        refetch();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleToggleStock = async (id) => {
    try {
      await toggleStock(id).unwrap();
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSale = async (id) => {
    try {
      await toggleSale(id).unwrap();
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyCoupon = async (productId, couponId) => {
    try {
      await applyCoupon({ id: productId, couponId }).unwrap();
      setShowCouponModal(false);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveCoupon = async (productId, couponId) => {
    try {
      await removeCoupon({ id: productId, couponId }).unwrap();
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">My Products</h1>
            <p className="text-gray-600">Manage your product inventory and promotions</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Product
          </button>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl shadow-sm flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-0.5 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label htmlFor="filter" className="font-medium text-gray-700 min-w-[70px]">
              Filter:
            </label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors w-full sm:max-w-xs bg-gray-50"
            >
              <option value="all">All Products</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="out-of-season">Out of Season</option>
              <option value="inStock">In Stock</option>
              <option value="outOfStock">Out of Stock</option>
              <option value="onSale">On Sale</option>
            </select>
            
            <div className="text-sm text-gray-500 ml-auto">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            </div>
          </div>
        </div>

        {showForm && (
          <ProductForm
            product={editingProduct}
            categories={categories}
            onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
          />
        )}

        {showCouponModal && (
          <CouponModal
            product={selectedProduct}
            onApply={handleApplyCoupon}
            onCancel={() => {
              setShowCouponModal(false);
              setSelectedProduct(null);
            }}
          />
        )}

        {viewProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative shadow-xl">
              <button
                onClick={() => setViewProduct(null)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 text-xl bg-gray-100 hover:bg-gray-200 rounded-full p-1 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b border-gray-200 pb-3">{viewProduct.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="rounded-xl overflow-hidden mb-4 border border-gray-200">
                    <img
                      src={`${API_BASE}/${viewProduct.image}`}
                      alt={viewProduct.name}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  {viewProduct.gallery && viewProduct.gallery.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Gallery Images</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {viewProduct.gallery.map((img, idx) => (
                          <div key={idx} className="rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={`${API_BASE}/${img}`}
                              alt={`Gallery ${idx}`}
                              className="w-full h-32 object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <div className="bg-gray-50 rounded-xl p-5 mb-5">
                    <h3 className="font-medium text-gray-700 mb-3">Description</h3>
                    <p className="text-gray-600">{viewProduct.description}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-medium">RS{viewProduct.price}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Variety:</span>
                          <span className="font-medium">{viewProduct.variety || "—"}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Unit:</span>
                          <span className="font-medium">{viewProduct.unit || "—"}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Organic:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${viewProduct.isOrganic ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                            {viewProduct.isOrganic ? "Yes" : "No"}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Seasonal:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${viewProduct.isSeasonal ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>
                            {viewProduct.isSeasonal ? "Yes" : "No"}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Harvest Date:</span>
                          <span className="font-medium">{viewProduct.harvestDate ? new Date(viewProduct.harvestDate).toLocaleDateString() : "—"}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Best Before:</span>
                          <span className="font-medium">{viewProduct.bestBefore ? new Date(viewProduct.bestBefore).toLocaleDateString() : "—"}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Storage:</span>
                          <span className="font-medium">{viewProduct.storageInstructions || "—"}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Min Order Qty:</span>
                          <span className="font-medium">{viewProduct.minOrderQuantity || 0.25} {viewProduct.unit || "units"}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Low Stock Threshold:</span>
                          <span className="font-medium">{viewProduct.lowStockThreshold || 5} {viewProduct.unit || "units"}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Quantity:</span>
                          <span className="font-medium">{viewProduct.quantity} {viewProduct.unit || "units"}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              viewProduct.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : viewProduct.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : viewProduct.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : viewProduct.status === "out-of-season"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {viewProduct.status === "approved"
                              ? "Approved"
                              : viewProduct.status === "pending"
                              ? "Waiting for approval"
                              : viewProduct.status === "rejected"
                              ? "Rejected"
                              : viewProduct.status === "out-of-season"
                              ? "Out of Season"
                              : "Unknown"}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Stock:</span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              viewProduct.inStock
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {viewProduct.inStock ? "In Stock" : "Out of Stock"}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sale Status:</span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              viewProduct.isOnSale
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {viewProduct.isOnSale ? "On Sale" : "Regular Price"}
                          </span>
                        </div>
                        
                        {viewProduct.features && viewProduct.features.length > 0 && (
                          <div>
                            <span className="text-gray-600">Features:</span>
                            <ul className="mt-1 list-disc list-inside text-sm text-gray-700">
                              {viewProduct.features.map((feature, index) => (
                                <li key={index}>{feature}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {viewProduct.attributes && Object.keys(viewProduct.attributes).length > 0 && (
                          <div>
                            <span className="text-gray-600">Attributes:</span>
                            <ul className="mt-1 list-disc list-inside text-sm text-gray-700">
                              {Object.entries(viewProduct.attributes).map(([key, value]) => (
                                <li key={key}>{key}: {value}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {viewProduct.stockHistory && viewProduct.stockHistory.length > 0 && (
                          <div>
                            <span className="text-gray-600">Recent Stock Changes:</span>
                            <ul className="mt-1 space-y-1 text-sm text-gray-700">
                              {viewProduct.stockHistory.slice(-3).reverse().map((history, index) => (
                                <li key={index}>
                                  {new Date(history.date).toLocaleDateString()}: {history.change > 0 ? '+' : ''}{history.change} ({history.reason})
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts?.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="h-48 bg-gray-100 overflow-hidden relative">
                {product.image ? (
                  <img
                    src={`${API_BASE}/${product.image}`}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      product.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : product.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : product.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : product.status === "out-of-season"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {product.status === "approved"
                      ? "Approved"
                      : product.status === "pending"
                      ? "Pending"
                      : product.status === "rejected"
                      ? "Rejected"
                      : product.status === "out-of-season"
                      ? "Out of Season"
                      : "Unknown"}
                  </span>
                  
                  {product.isOnSale && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      On Sale
                    </span>
                  )}
                  
                  {product.isSeasonal && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      Seasonal
                    </span>
                  )}
                </div>
                
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      product.inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-blue-600 font-medium text-xl mb-4">RS{product.price}</p>

                {product.coupons && product.coupons.length > 0 && (
                  <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <h4 className="font-medium mb-2 text-purple-700 text-sm">Applied Coupons:</h4>
                    <div className="space-y-2">
                      {product.coupons.map((coupon) => (
                        <div key={coupon._id} className="flex justify-between items-center">
                          <span className="text-xs bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full font-medium">
                            {coupon.code} {coupon.discountType === 'percentage' ? `(${coupon.discountValue}%)` : `(₹${coupon.discountValue})`}
                          </span>
                          <button
                            onClick={() => handleRemoveCoupon(product._id, coupon._id)}
                            className="text-red-500 text-xs hover:text-red-700 flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      setShowForm(true);
                    }}
                    className="bg-yellow-500 text-white px-3 py-2.5 rounded-lg text-sm hover:bg-yellow-600 transition-colors flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStock(product._id)}
                    className={`px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center ${
                      product.inStock
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    {product.inStock ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Out of Stock
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        In Stock
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleToggleSale(product._id)}
                    className={`px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center ${
                      product.isOnSale
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    }`}
                  >
                    {product.isOnSale ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Remove Sale
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 5.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 10l1.293-1.293zm4 0a1 1 0 010 1.414L11.586 10l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Put on Sale
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowCouponModal(true);
                    }}
                    className="bg-purple-100 text-purple-700 px-3 py-2.5 rounded-lg text-sm hover:bg-purple-200 transition-colors flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                    Coupon
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="bg-red-100 text-red-700 px-3 py-2.5 rounded-lg text-sm hover:bg-red-200 transition-colors col-span-2 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete
                  </button>
                  <button
                    onClick={() => setViewProduct(product)}
                    className="bg-gray-100 text-gray-700 px-3 py-2.5 rounded-lg text-sm hover:bg-gray-200 transition-colors col-span-2 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts?.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-16M9 9h6m-6 4h6m-6 4h6" />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {filter === "all"
                ? "You haven't added any products yet."
                : `No products match the "${filter}" filter.`}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {filter === "all"
                ? "Get started by adding your first product to showcase in your store."
                : "Try changing your filter settings to see more products."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProducts;