"use client";

import { useState } from "react";
import {
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
} from "@/store/features/wishlistApi";

export default function Wishlist() {
  // 🔹 API integration
  const { data, isLoading, isError } = useGetWishlistQuery();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");

  // Debug: Log the actual API response structure
  if (data && process.env.NODE_ENV === 'development') {
    console.log("API Response:", data);
    console.log("First wishlist item structure:", data?.wishlist?.products?.[0]);
    console.log("Seller data in first item:", data?.wishlist?.products?.[0]?.seller);
  }

  // 🔹 Helper: Get full category path
  const getCategoryPath = (category) => {
    if (!category) return "Uncategorized";
    let path = [];
    let current = category;
    while (current) {
      path.unshift(current.name);
      current = current.parentCategory;
    }
    return path.join(" > ");
  };

  // 🔹 Normalize backend response - FIXED: Correct data structure
  const wishlistItems =
    data?.wishlist?.products
      ?.filter(item => item.status === "active") // Only show active items
      ?.map((item) => {
        const product = item.product || {};
        
        // Handle different seller data structures
        let sellerName = "Unknown Seller";
        let sellerId = null;
        
        // Check if seller is populated as an object or just an ID
        if (item.seller) {
          if (typeof item.seller === 'object') {
            sellerName = item.seller.shopName || item.seller.name || "Store";
            sellerId = item.seller._id;
          } else {
            // Seller is just an ID, we might need to fetch details separately
            sellerName = "Store";
            sellerId = item.seller;
          }
        }
        
        // Check product stock status more accurately
        const isInStock = product.status === "active" && 
                         (product.stockQuantity === undefined || product.stockQuantity > 0);
        
        return {
          id: product._id || item.product, // Handle both populated and object ID cases
          name: product.name,
          price: product.price,
          image: product.image,
          category: getCategoryPath(product.category),
          inStock: isInStock,
          seller: sellerName,
          sellerId: sellerId,
          productStatus: product.status, // For debugging
          stockQuantity: product.stockQuantity || 0, // For debugging
          wishlistItemStatus: item.status // For debugging
        };
      }) || [];

  // 🔹 Handlers
  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist({ id: productId }).unwrap();
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    }
  };

  const addToCart = (productId) => {
    console.log("Adding to cart:", productId);
  };

  const addAllToCart = () => {
    const inStockItems = wishlistItems.filter((item) => item.inStock);
    console.log("Adding all in-stock items to cart:", inStockItems);
  };

  const shareWishlist = () => {
    console.log("Sharing wishlist");
  };

  // 🔹 Filters
  const filteredItems = wishlistItems.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.seller?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inStockCount = wishlistItems.filter((item) => item.inStock).length;

  // 🔹 Loading + Empty States
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-blue-700">
        Loading your wishlist...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-screen flex items-center justify-center text-red-600">
        Failed to load wishlist.
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center shadow-xl">
          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HeartIcon size={32} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-blue-900 mb-3">Your wishlist is empty</h2>
          <p className="text-blue-700 mb-6">
            Start saving your favorite items to keep track of them
          </p>
          <button className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-3 px-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // 🔹 UI Components
  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-blue-100 transition-all duration-300 hover:shadow-xl">
      <div className="relative aspect-square bg-blue-50">
        <img
          src={
            product.image?.startsWith("http")
              ? product.image
              : `http://localhost:5000/${product.image}`
          }
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/placeholder-product.png";
            // Also check if the error is due to wrong URL structure
            if (product.image && !product.image.startsWith("http")) {
              console.warn("Image might need correct path:", product.image);
            }
          }}
        />
        <button
          onClick={() => handleRemove(product.id)}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-110"
        >
          <HeartIcon size={18} filled className="text-red-500" />
        </button>
        
        {/* Stock status badge */}
        {!product.inStock && (
          <div className="absolute top-3 left-3 bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-md">
            Out of Stock
          </div>
        )}
      </div>
      <div className="p-4">
        <span className="text-xs text-blue-600 font-medium mb-1">
          {product.category}
        </span>
        <h3 className="font-semibold text-blue-900 mb-2 line-clamp-2">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-blue-900 text-lg">${product.price}</span>
          <span className="text-sm text-blue-600">{product.seller || "Unknown Seller"}</span>
        </div>

        <button
          onClick={() => addToCart(product.id)}
          disabled={!product.inStock}
          className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${
            product.inStock
              ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 shadow-md hover:shadow-lg"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          <ShoppingCartIcon size={16} />
          {product.inStock ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );

  // List view component
  const ProductListItem = ({ product }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="relative w-20 h-20 bg-blue-50 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={
            product.image?.startsWith("http")
              ? product.image
              : `http://localhost:5000/${product.image}`
          }
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/placeholder-product.png";
            if (product.image && !product.image.startsWith("http")) {
              console.warn("Image might need correct path:", product.image);
            }
          }}
        />
        {!product.inStock && (
          <div className="absolute top-1 left-1 bg-red-100 text-red-800 text-xs font-medium px-1.5 py-0.5 rounded">
            Out of Stock
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-blue-900 truncate">{product.name}</h3>
        <p className="text-sm text-blue-600 truncate">{product.category}</p>
        <p className="text-sm text-blue-700">{product.seller || "Unknown Seller"}</p>
        
        {/* Debug info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 mt-1">
            Status: {product.productStatus} | Stock: {product.stockQuantity} | Seller ID: {product.sellerId}
          </div>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <span className="font-bold text-blue-900 text-lg">${product.price}</span>
        
        <div className="flex gap-2">
          <button
            onClick={() => addToCart(product.id)}
            disabled={!product.inStock}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              product.inStock
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </button>
          
          <button
            onClick={() => handleRemove(product.id)}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove from wishlist"
          >
            <HeartIcon size={16} filled />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <HeartIcon size={24} className="text-blue-600" />
              </div>
              My Wishlist
            </h1>
            <p className="text-blue-700 mt-2">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1 ? "item" : "items"} saved •{" "}
              {inStockCount} in stock
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={shareWishlist}
              className="flex items-center gap-2 px-5 py-2.5 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors font-medium text-blue-800"
            >
              <ShareIcon size={18} />
              Share
            </button>
            {inStockCount > 0 && (
              <button
                onClick={addAllToCart}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl hover:from-blue-700 hover:to-blue-900 transition-all font-medium shadow-md hover:shadow-lg"
              >
                <ShoppingCartIcon size={18} />
                Add All ({inStockCount})
              </button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="relative flex-1 max-w-lg">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
            <input
              type="text"
              placeholder="Search your wishlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-blue-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 font-medium">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            </span>
            <div className="flex bg-blue-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${
                  viewMode === "grid"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-blue-500"
                }`}
              >
                <GridIcon size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${
                  viewMode === "list"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-blue-500"
                }`}
              >
                <ListIcon size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Debug info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            Debug: {wishlistItems.filter(item => !item.inStock).length} items showing as out of stock
            {data?.counts && ` | Backend counts: ${JSON.stringify(data.counts)}`}
          </div>
        )}

        {/* Wishlist Items */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <SearchIcon size={48} className="text-blue-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-blue-900 mb-2">
              No items found
            </h3>
            <p className="text-blue-700">Try adjusting your search terms</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((product) => (
              <ProductListItem key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------- Icons ----------------- */
const HeartIcon = ({ size = 24, filled = false, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const ShoppingCartIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
);

const ShareIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="5" r="1" />
    <circle cx="6" cy="12" r="1" />
    <circle cx="18" cy="19" r="1" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const SearchIcon = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const GridIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="14" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
  </svg>
);

const ListIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);