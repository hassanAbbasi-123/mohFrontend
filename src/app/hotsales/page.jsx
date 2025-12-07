"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useGetApprovedProductsQuery,
  useLikeProductMutation,
  useAddReviewMutation,
} from "@/store/features/productApi";
import { useAddToWishlistMutation } from "@/store/features/wishlistApi";
import { useGetAllCategoriesQuery } from "@/store/features/categoryApi";
import { useAddToCartMutation } from "@/store/features/cartApi";
import { useStartConversationMutation } from "@/store/features/chatApi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const HotSalesPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Filters/UI state
  const [categoryFilter, setCategoryFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [viewProduct, setViewProduct] = useState(null);
  const [ratingValues, setRatingValues] = useState({});
  const [likedProducts, setLikedProducts] = useState(new Set());
  const [wishlistProducts, setWishlistProducts] = useState(new Set());
  const [chatLoading, setChatLoading] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  const categories = categoriesData || [];

  // Fetch products with isOnSale: true
  const queryArgs = useMemo(() => {
    const q = { isOnSale: true };
    if (categoryFilter) q.category = categoryFilter;
    if (minPrice) q.minPrice = minPrice;
    if (maxPrice) q.maxPrice = maxPrice;
    return q;
  }, [categoryFilter, minPrice, maxPrice]);

  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useGetApprovedProductsQuery(queryArgs);

  // Local copy + client-side sort
  const [clientProducts, setClientProducts] = useState([]);
  useEffect(() => {
    if (productsData && Array.isArray(productsData)) {
      setClientProducts(productsData);
    } else {
      setClientProducts([]);
    }
  }, [productsData]);

  // Mutations
  const [likeProduct] = useLikeProductMutation();
  const [addReview] = useAddReviewMutation();
  const [addToWishlist] = useAddToWishlistMutation();
  const [addToCart] = useAddToCartMutation();
  const [startConversation] = useStartConversationMutation();

  // Handle star rating click
  const handleStarClick = async (productId, rating) => {
    if (!isAuthenticated) {
      alert("Please log in to rate products.");
      router.push("/login");
      return;
    }
    try {
      await addReview({ id: productId, rating: Number(rating) }).unwrap();
      setRatingValues((prev) => ({
        ...prev,
        [productId]: rating,
      }));
      await refetchProducts();
    } catch (err) {
      console.error("Error adding review:", err);
    }
  };

  // Star rating component
  const StarRating = ({ productId, currentRating = 0 }) => {
    const stars = [1, 2, 3, 4, 5];
    return (
      <div className="flex items-center gap-1">
        {stars.map((star) => (
          <button
            key={star}
            onClick={() => handleStarClick(productId, star)}
            className={`text-lg transition-all duration-200 transform hover:scale-110 ${
              star <= currentRating 
                ? 'text-yellow-400 drop-shadow-sm' 
                : 'text-gray-300 hover:text-yellow-200'
            }`}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            disabled={!isAuthenticated}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  // Handlers
  const handleStartChat = async (product) => {
    if (!isAuthenticated) {
      alert("Please log in to start a chat.");
      router.push("/login");
      return;
    }
    if (!product.seller) {
      console.error("Product seller information is missing");
      return;
    }
    const sellerId = product.seller.user || product.seller._id;
    if (!sellerId) {
      console.error("Seller user ID is missing");
      return;
    }
    setChatLoading(product._id);
    try {
      const result = await startConversation({
        sellerId,
        productId: product._id,
      }).unwrap();
      if (result.conversation && result.conversation._id) {
        router.push(`/chat/${result.conversation._id}`);
      } else {
        alert("Chat started successfully! You can access it from your chat page.");
      }
    } catch (err) {
      console.error("Error starting chat:", err);
      if (err?.data?.message === "Conversation already exists") {
        alert("You already have a conversation with this seller. Redirecting to chat...");
        router.push("/user/chat");
      } else {
        alert(err?.data?.message || "Failed to start chat. Please try again.");
      }
    } finally {
      setChatLoading(null);
    }
  };

  const handleLike = async (id) => {
    if (!isAuthenticated) {
      alert("Please log in to like products.");
      router.push("/login");
      return;
    }
    try {
      await likeProduct(id).unwrap();
      setLikedProducts((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        return newSet;
      });
      await refetchProducts();
    } catch (err) {
      console.error("Error liking product:", err);
    }
  };

  const handleAddToWishlist = async (id) => {
    if (!isAuthenticated) {
      alert("Please log in to add to wishlist.");
      router.push("/login");
      return;
    }
    try {
      const res = await addToWishlist({ id }).unwrap();
      setWishlistProducts((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        return newSet;
      });
      console.log("Wishlist success:", res);
    } catch (err) {
      console.error("Error adding to wishlist:", err?.data || err);
    }
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      alert("Please log in to add to cart.");
      router.push("/login");
      return;
    }
    try {
      const res = await addToCart({
        productId: product._id,
        quantity: 1,
      }).unwrap();
      console.log("Cart success:", res);
    } catch (err) {
      console.error("Error adding to cart:", err?.data || err);
    }
  };

  // Helpers
  const buildUrl = (path) => {
    if (!path) return "/placeholder-product.png";
    if (path.startsWith("http")) return path;
    if (path.startsWith("/")) return path;
    return `${API_BASE}/${path.replace(/\\/g, "/")}`;
  };

  const isImage = (file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file);
  const isVideo = (file) => /\.(mp4|webm|ogg)$/i.test(file);

  // Derived filtered + sorted list
  const displayedProducts = useMemo(() => {
    let list = clientProducts.slice();
    if (sort === "priceAsc") {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sort === "priceDesc") {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return list;
  }, [clientProducts, sort]);

  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading hot sale products...</p>
        </div>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-3xl shadow-2xl max-w-md border border-gray-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-red-600 text-xl font-bold mb-2">Oops! Something went wrong</div>
          <p className="text-gray-600 mb-6">We couldn't load the products. Please try again later.</p>
          <button 
            onClick={() => refetchProducts()}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-2">
                Hot Sales
              </h1>
              <p className="text-gray-600 text-lg">
                Discover {displayedProducts.length} products on sale
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Sort & Filter Buttons */}
              <div className="flex gap-3">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="px-5 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/80 rounded-2xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md appearance-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                </select>

                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="lg:hidden px-5 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/80 rounded-2xl hover:shadow-md transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                  </svg>
                  Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:col-span-1 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-200/60 p-6 sticky top-24 transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                  Filters
                </h3>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-8">
                {/* Category Filter */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-900 uppercase tracking-wide">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-300/50 rounded-2xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <optgroup label={cat.name} key={cat._id}>
                        {Array.isArray(cat.subcategories) && cat.subcategories.length > 0 ? (
                          cat.subcategories.map((sub) => (
                            <option key={sub._id} value={sub._id}>
                              {sub.name}
                            </option>
                          ))
                        ) : (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        )}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-900 uppercase tracking-wide">Price Range</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full pl-8 pr-4 py-3.5 bg-gray-50/80 border border-gray-300/50 rounded-2xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full pl-8 pr-4 py-3.5 bg-gray-50/80 border border-gray-300/50 rounded-2xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => refetchProducts()}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3.5 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={() => {
                      setCategoryFilter("");
                      setMinPrice("");
                      setMaxPrice("");
                      setSort("newest");
                      refetchProducts();
                    }}
                    className="px-6 py-3.5 border-2 border-gray-300/80 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <section className="lg:col-span-3">
            {displayedProducts.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-16 text-center border border-gray-200/60">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No products found</h3>
                <p className="text-gray-600 text-lg mb-8">Try adjusting your filters to find what you're looking for</p>
                <button
                  onClick={() => {
                    setCategoryFilter("");
                    setMinPrice("");
                    setMaxPrice("");
                    refetchProducts();
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {displayedProducts.map((product) => (
                  <div 
                    key={product._id} 
                    className="group bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-200/60 hover:border-blue-200/80 hover:scale-105"
                  >
                    {/* Product Image/Media */}
                    <div className="relative h-72 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                      {product.image ? (
                        isImage(product.image) ? (
                          <img
                            src={buildUrl(product.image)}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/placeholder-product.png";
                            }}
                          />
                        ) : isVideo(product.image) ? (
                          <video
                            src={buildUrl(product.image)}
                            controls
                            className="w-full h-full object-cover"
                          />
                        ) : null
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Discount Badge */}
                      {product.originalPrice && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </div>
                      )}

                      {/* Action Buttons Overlay */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        {isAuthenticated && (
                          <>
                            <button
                              onClick={() => handleLike(product._id)}
                              className={`p-2.5 rounded-xl backdrop-blur-sm border transition-all duration-200 transform hover:scale-110 ${
                                likedProducts.has(product._id) 
                                  ? "bg-red-500/20 border-red-300 text-red-600" 
                                  : "bg-white/80 border-white/60 text-gray-700 hover:bg-white"
                              }`}
                            >
                              <svg className="w-5 h-5" fill={likedProducts.has(product._id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleAddToWishlist(product._id)}
                              className={`p-2.5 rounded-xl backdrop-blur-sm border transition-all duration-200 transform hover:scale-110 ${
                                wishlistProducts.has(product._id)
                                  ? "bg-purple-500/20 border-purple-300 text-purple-600"
                                  : "bg-white/80 border-white/60 text-gray-700 hover:bg-white"
                              }`}
                            >
                              <svg className="w-5 h-5" fill={wishlistProducts.has(product._id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>

                      {/* Quick Action Bar */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="flex justify-between items-center">
                          {isAuthenticated ? (
                            <button
                              onClick={() => setViewProduct(product)}
                              className="bg-white/90 text-gray-900 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-white transition-colors"
                            >
                              Quick View
                            </button>
                          ) : (
                            <Link
                              href={`/product/${product.slug}`}
                              className="bg-white/90 text-gray-900 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-white transition-colors"
                            >
                              View Details
                            </Link>
                          )}
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2 flex-1 pr-4">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          {product.originalPrice && (
                            <span className="text-lg line-through text-gray-400">
                              ${product.originalPrice.toFixed(2)}
                            </span>
                          )}
                          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            ${product.price}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-semibold text-gray-700">{product.rating.toFixed(1)}</span>
                          <span className="text-sm text-gray-500">({product.reviewCount} reviews)</span>
                        </div>
                      </div>

                      {/* Rating Section */}
                      <div className="space-y-3 pt-4 border-t border-gray-200/60">
                        <label className="text-sm font-semibold text-gray-700">Rate this product:</label>
                        <StarRating productId={product._id} currentRating={ratingValues[product._id] || 0} />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4">
                        {isAuthenticated && (
                          <button
                            onClick={() => handleStartChat(product)}
                            disabled={chatLoading === product._id}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                              chatLoading === product._id
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 shadow-lg"
                            }`}
                          >
                            {chatLoading === product._id ? (
                              <>
                                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4m8-10h-4M6 12H2m15.364-7.364l-2.828 2.828M7.464 17.536l-2.828 2.828m12.728 0l-2.828-2.828M7.464 6.464L4.636 3.636" />
                                </svg>
                                Starting...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Chat Seller
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Product Detail Modal (Only for authenticated users) */}
        {isAuthenticated && viewProduct && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-lg flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-200/60">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-8 border-b border-gray-200/60 bg-gradient-to-r from-gray-50 to-blue-50/50">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                  {viewProduct.name}
                </h2>
                <button
                  onClick={() => setViewProduct(null)}
                  className="p-3 hover:bg-white/80 rounded-2xl transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl border border-gray-200/60"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8">
                  {/* Media Section */}
                  <div className="space-y-6">
                    <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50/50 border border-gray-200/60 shadow-xl">
                      {isImage(viewProduct.image) ? (
                        <img
                          src={buildUrl(viewProduct.image)}
                          alt={viewProduct.name}
                          className="w-full h-96 object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/placeholder-product.png";
                          }}
                        />
                      ) : isVideo(viewProduct.image) ? (
                        <video
                          src={buildUrl(viewProduct.image)}
                          controls
                          className="w-full h-96 object-cover"
                        />
                      ) : (
                        <div className="w-full h-96 flex items-center justify-center text-gray-400">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Gallery */}
                    {viewProduct.gallery && viewProduct.gallery.length > 0 && (
                      <div className="grid grid-cols-4 gap-4">
                        {viewProduct.gallery.map((g, i) => (
                          <div key={i} className="rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50/50 border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                            {isImage(g) ? (
                              <img
                                src={buildUrl(g)}
                                alt={`${viewProduct.name} gallery ${i + 1}`}
                                className="w-full h-20 object-cover"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = "/placeholder-product.png";
                                }}
                              />
                            ) : isVideo(g) ? (
                              <video
                                src={buildUrl(g)}
                                className="w-full h-20 object-cover"
                              />
                            ) : (
                              <div className="w-full h-20 flex items-center justify-center text-gray-400 text-xs">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Details Section */}
                  <div className="space-y-8">
                    {/* Description */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200/60">Description</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">{viewProduct.description}</p>
                    </div>

                    {/* Key Information */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl p-5 border border-blue-200/60">
                        <span className="text-sm font-semibold text-blue-900 uppercase tracking-wide">Price</span>
                        <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mt-2">
                          ${viewProduct.price}
                        </p>
                        {viewProduct.originalPrice && (
                          <p className="text-sm text-gray-500 line-through">
                            ${viewProduct.originalPrice.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div className={`rounded-2xl p-5 border ${
                        viewProduct.inStock 
                          ? 'bg-gradient-to-br from-green-50 to-emerald-50/50 border-green-200/60' 
                          : 'bg-gradient-to-br from-red-50 to-pink-50/50 border-red-200/60'
                      }`}>
                        <span className="text-sm font-semibold uppercase tracking-wide text-gray-900">Status</span>
                        <p className={`text-2xl font-bold mt-2 ${
                          viewProduct.inStock ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {viewProduct.inStock ? 'In Stock' : 'Out of Stock'}
                        </p>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200/60">Product Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50/80 rounded-xl p-4">
                          <span className="text-sm text-gray-500 font-medium">Category</span>
                          <p className="font-semibold text-gray-900">{viewProduct.category?.name || "—"}</p>
                        </div>
                        <div className="bg-gray-50/80 rounded-xl p-4">
                          <span className="text-sm text-gray-500 font-medium">Brand</span>
                          <p className="font-semibold text-gray-900">{viewProduct.brand?.name || "—"}</p>
                        </div>
                        <div className="bg-gray-50/80 rounded-xl p-4 col-span-2">
                          <span className="text-sm text-gray-500 font-medium">Seller</span>
                          <p className="font-semibold text-gray-900">{viewProduct.seller?.name || viewProduct.seller?.email || "—"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Rating Section */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Rate this product</h3>
                      <div className="bg-gradient-to-br from-yellow-50 to-amber-50/50 rounded-2xl p-6 border border-yellow-200/60">
                        <StarRating productId={viewProduct._id} currentRating={ratingValues[viewProduct._id] || 0} />
                      </div>
                    </div>

                    {/* Features */}
                    {viewProduct.features && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Features</h3>
                        <div className="flex flex-wrap gap-3">
                          {Array.isArray(viewProduct.features) ? (
                            viewProduct.features.map((feature, index) => (
                              <span 
                                key={index} 
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-semibold shadow-lg"
                              >
                                {feature}
                              </span>
                            ))
                          ) : (
                            <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-semibold shadow-lg">
                              {viewProduct.features}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6">
                      <button
                        onClick={() => handleAddToCart(viewProduct)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleStartChat(viewProduct)}
                        disabled={chatLoading === viewProduct._id}
                        className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-2xl ${
                          chatLoading === viewProduct._id 
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                            : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                        }`}
                      >
                        {chatLoading === viewProduct._id ? "Starting Chat..." : "Chat Seller"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotSalesPage;