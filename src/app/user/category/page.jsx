// src/app/user/category/page.jsx
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
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const UserProductsPage = () => {
  const router = useRouter();
  
  // filters / ui state
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [viewProduct, setViewProduct] = useState(null);
  const [ratingValues, setRatingValues] = useState({});
  const [likedProducts, setLikedProducts] = useState(new Set());
  const [wishlistProducts, setWishlistProducts] = useState(new Set());
  const [chatLoading, setChatLoading] = useState(null);

  // fetch categories for filter dropdown
  const { data: categoriesData, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  const categories = categoriesData || [];

  // fetch approved products with query params
  const queryArgs = useMemo(() => {
    const q = {};
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

  // local copy + client-side search/sort
  const [clientProducts, setClientProducts] = useState([]);
  useEffect(() => {
    if (productsData && Array.isArray(productsData)) {
      setClientProducts(productsData);
    } else {
      setClientProducts([]);
    }
  }, [productsData]);

  // mutations for liking / reviews / wishlist / cart / chat
  const [likeProduct] = useLikeProductMutation();
  const [addReview] = useAddReviewMutation();
  const [addToWishlist] = useAddToWishlistMutation();
  const [addToCart] = useAddToCartMutation();
  const [startConversation] = useStartConversationMutation();

  // New function to handle starting chat
  const handleStartChat = async (product) => {
    // Make sure product.seller exists
    if (!product.seller) {
      console.error("Product seller information is missing");
      return;
    }

    // Use seller.user instead of seller._id
    const sellerId = product.seller.user || product.seller._id;

    if (!sellerId) {
      console.error("Seller user ID is missing");
      return;
    }

    setChatLoading(product._id);

    try {
      const result = await startConversation({
        sellerId, // Correct sellerId
        productId: product._id,
      }).unwrap();

      console.log("Chat started successfully:", result);

      // Navigate to chat page with the conversation ID directly in the path
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

  // New function to handle star rating click
  const handleStarClick = async (productId, rating) => {
    try {
      await addReview({ id: productId, rating: Number(rating) }).unwrap();
      
      // Update the rating value for this specific product
      setRatingValues(prev => ({
        ...prev,
        [productId]: rating
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
            className={`text-2xl ${
              star <= currentRating ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-300 transition-colors`}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  // derived filtered + searched + sorted list
  const displayedProducts = useMemo(() => {
    let list = clientProducts.slice();

    if (search && search.trim() !== "") {
      const s = search.trim().toLowerCase();
      list = list.filter((p) => (p.name || "").toLowerCase().includes(s));
    }

    if (sort === "priceAsc") {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sort === "priceDesc") {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return list;
  }, [clientProducts, search, sort]);

  // handlers
  const handleLike = async (id) => {
    try {
      await likeProduct(id).unwrap();
      setLikedProducts(prev => {
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
    try {
      const res = await addToWishlist({ id }).unwrap();
      setWishlistProducts(prev => {
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

  // helpers
  const buildUrl = (path) => {
    if (!path) return "/placeholder-product.png";
    if (path.startsWith("http")) return path;
    if (path.startsWith("/")) return path;
    return `${API_BASE}/${path.replace(/\\/g, "/")}`;
  };

  const isImage = (file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file);
  const isVideo = (file) => /\.(mp4|webm|ogg)$/i.test(file);

  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 rounded-lg max-w-md">
          <div className="text-red-600 text-xl font-medium mb-2">Error loading products</div>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Explore Products</h1>
              <p className="text-gray-600 mt-1">Discover amazing products just for you</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                />
              </div>
              
              <select 
                value={sort} 
                onChange={(e) => setSort(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Newest</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-6">Filters</h3>
                
                <div className="space-y-6">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="number"
                          placeholder="Min"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="Max"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => refetchProducts()}
                      className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Apply Filters
                    </button>
                    <button
                      onClick={() => {
                        setCategoryFilter("");
                        setMinPrice("");
                        setMaxPrice("");
                        setSearch("");
                        setSort("newest");
                        refetchProducts();
                      }}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600">Try adjusting your filters or search terms</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {displayedProducts.map((product) => (
                    <div key={product._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      {/* Product Image */}
                      <div className="relative h-56 bg-gray-100 overflow-hidden">
                        {product.image ? (
                          isImage(product.image) ? (
                            <img
                              src={buildUrl(product.image)}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform hover:scale-105"
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
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        
                        {/* In Stock Badge */}
                        {product.inStock && (
                          <div className="absolute top-3 left-3 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            In Stock
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-5">
                        <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h4>
                        
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm text-gray-600">4.8</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <button
                            onClick={() => handleLike(product._id)}
                            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              likedProducts.has(product._id)
                                ? "bg-red-100 text-red-600"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            <svg className="w-4 h-4" fill={likedProducts.has(product._id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            Like
                          </button>

                          <button
                            onClick={() => handleAddToWishlist(product._id)}
                            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              wishlistProducts.has(product._id)
                                ? "bg-purple-100 text-purple-600"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            <svg className="w-4 h-4" fill={wishlistProducts.has(product._id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Wishlist
                          </button>

                          {/* Chat Button */}
                          <button
                            onClick={() => handleStartChat(product)}
                            disabled={chatLoading === product._id}
                            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              chatLoading === product._id
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
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
                                Chat
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => setViewProduct(product)}
                            className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                        </div>

                        {/* Star Rating Section */}
                        <div className="flex flex-col gap-2">
                          <label className="text-sm text-gray-600">Rate this product:</label>
                          <StarRating 
                            productId={product._id} 
                            currentRating={ratingValues[product._id] || 0}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Product Detail Modal */}
          {viewProduct && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-6 border-b">
                  <h2 className="text-2xl font-bold text-gray-900">{viewProduct.name}</h2>
                  <button
                    onClick={() => setViewProduct(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
                    {/* Media Section */}
                    <div>
                      <div className="rounded-xl overflow-hidden bg-gray-100 mb-4">
                        {isImage(viewProduct.image) ? (
                          <img
                            src={buildUrl(viewProduct.image)}
                            alt={viewProduct.name}
                            className="w-full h-80 object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/placeholder-product.png";
                            }}
                          />
                        ) : isVideo(viewProduct.image) ? (
                          <video
                            src={buildUrl(viewProduct.image)}
                            controls
                            className="w-full h-80 object-cover"
                          />
                        ) : (
                          <div className="w-full h-80 flex items-center justify-center text-gray-400">
                            No Media Available
                          </div>
                        )}
                      </div>

                      {viewProduct.gallery && viewProduct.gallery.length > 0 && (
                        <div className="grid grid-cols-3 gap-3">
                          {viewProduct.gallery.map((g, i) => (
                            <div key={i} className="rounded-lg overflow-hidden bg-gray-100">
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
                                  Unsupported
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Details Section */}
                    <div>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                          <p className="text-gray-600 leading-relaxed">{viewProduct.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-gray-500">Price</span>
                            <p className="text-2xl font-bold text-blue-600">${viewProduct.price}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Status</span>
                            <p className={`font-medium ${viewProduct.inStock ? 'text-green-600' : 'text-red-600'}`}>
                              {viewProduct.inStock ? 'In Stock' : 'Out of Stock'}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <span className="text-sm text-gray-500">Category</span>
                            <p className="font-medium">{viewProduct.category?.name || "—"}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Brand</span>
                            <p className="font-medium">{viewProduct.brand?.name || "—"}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Seller</span>
                            <p className="font-medium">{viewProduct.seller?.name || viewProduct.seller?.email || "—"}</p>
                          </div>
                        </div>

                        {/* Star Rating in Modal */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Rate this product</h3>
                          <StarRating 
                            productId={viewProduct._id} 
                            currentRating={ratingValues[viewProduct._id] || 0}
                          />
                        </div>

                        {viewProduct.features && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Features</h3>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(viewProduct.features) ? (
                                viewProduct.features.map((feature, index) => (
                                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                    {feature}
                                  </span>
                                ))
                              ) : (
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                  {viewProduct.features}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons in Modal */}
                        <div className="flex gap-3 pt-4">
                          <button 
                            onClick={() => handleAddToCart(viewProduct)}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                          >
                            Add to Cart
                          </button>
                          <button 
                            onClick={() => handleStartChat(viewProduct)}
                            disabled={chatLoading === viewProduct._id}
                            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                              chatLoading === viewProduct._id
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                          >
                            {chatLoading === viewProduct._id ? "Starting Chat..." : "Chat with Seller"}
                          </button>
                          <button className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                            Buy Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default UserProductsPage;