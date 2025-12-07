"use client"
import Image from "next/image"
import {
  TrendingUp,
  Zap,
  Shield,
  Truck,
  Star,
  ArrowRight,
  Smartphone,
  Shirt,
  Home,
  BookOpen,
  Flame,
  ChevronRight,
  ShoppingBag,
  Clock,
  Heart
} from "lucide-react"
import { useState, useEffect } from "react"
import { useGetApprovedProductsQuery } from "@/store/features/productApi";
import { useGetAllCategoriesQuery } from "@/store/features/categoryApi";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function Dashboard() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { toast } = useToast();
  const { data: allProducts = [], isLoading: productsLoading } = useGetApprovedProductsQuery();
  const { data: categoriesData = [], isLoading: categoriesLoading } = useGetAllCategoriesQuery();

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const buildImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-product.png';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return imagePath;
    return `${API_BASE}/${imagePath.replace(/\\/g, '/')}`;
  };

  const categoryMap = {
    "Electronics": { icon: Smartphone, color: "linear-gradient(135deg, #3b82f6, #1e40af)" },
    "Fashion": { icon: Shirt, color: "linear-gradient(135deg, #6366f1, #4338ca)" },
    "Home & Kitchen": { icon: Home, color: "linear-gradient(135deg, #0ea5e9, #0369a1)" },
    "Books & Stationery": { icon: BookOpen, color: "linear-gradient(135deg, #06b6d4, #0e7490)" },
  };

  const categories = categoriesData.map((cat, index) => ({
    id: cat._id || `cat-${index}`,
    title: cat.name,
    icon: categoryMap[cat.name]?.icon || Smartphone,
    color: categoryMap[cat.name]?.color || "linear-gradient(135deg, #3b82f6, #1e40af)",
    count: cat.productCount || "1,000+",
  }));

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const computeProductData = (product) => {
    const price = Number(product.price || 0);
    let originalPrice = price;
    let isOnSale = false;
    let discountPercentage = 0;

    const discount = Number(product.discount || 0);
    if (discount > 0) {
      isOnSale = true;
      if (discount <= 100) {
        discountPercentage = discount;
        originalPrice = price / (1 - discount / 100);
      } else if (discount <= price) {
        originalPrice = price + discount;
        discountPercentage = (discount / originalPrice) * 100;
      } else {
        originalPrice = price;
        discountPercentage = 0;
      }
    }

    const ratings = product.ratings || [];
    const rating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;
    const reviewCount = ratings.length;

    return {
      id: product._id,
      name: product.name,
      price: price.toFixed(2),
      originalPrice: originalPrice.toFixed(2),
      rating: rating.toFixed(1),
      reviewCount,
      image: buildImageUrl(product.image),
      category: product.category?.name || "General",
      isOnSale,
      inStock: product.stock > 0,
      tags: isOnSale ? ["Trending"] : [],
    };
  };

  const shuffledProducts = shuffleArray(allProducts);
  const featuredProducts = shuffledProducts.slice(0, 4).map(computeProductData);

  const hotSaleProducts = shuffledProducts
    .filter((p) => computeProductData(p).isOnSale)
    .slice(0, 4)
    .map((product, index) => {
      const computed = computeProductData(product);
      const times = ["12:45:33", "06:22:17", "23:59:59", "17:30:45"];
      return {
        ...computed,
        timeLeft: times[index % times.length],
      };
    });

  const handleAddToCart = (product) => {
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleAddToWishlist = (product) => {
    toast({
      title: "Added to Wishlist",
      description: `${product.name} has been added to your wishlist.`,
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % hotSaleProducts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [hotSaleProducts.length]);

  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="text-center">
          <div className="flex justify-center space-x-2 mb-3">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-bounce delay-200"></div>
          </div>
          <p className="text-gray-600 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Main content with proper spacing for mobile navbar */}
      <div className="pt-16 lg:pt-0"> {/* Mobile: 16px top padding, Desktop: 0 */}
        <div className="p-3 sm:p-4 md:p-6">
          <div className="max-w-full mx-auto space-y-6 sm:space-y-8 md:space-y-12">

            {/* Hero Section - Fixed for mobile navbar */}
            <div className="relative rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-lg group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-indigo-800/80 z-10" />
              <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96">
                <Image
                  src="/hero-placeholder.jpg"
                  fill
                  unoptimized
                  sizes="100vw"
                  className="object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute inset-0 z-20 flex items-center justify-center p-3 sm:p-4 md:p-6">
                <div className="text-center text-white max-w-full sm:max-w-2xl md:max-w-3xl">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 leading-tight">
                    Discover Amazing{" "}
                    <span className="bg-gradient-to-r from-blue-300 to-blue-500 bg-clip-text text-transparent">
                      Deals
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base opacity-95 mb-3 sm:mb-4 md:mb-6 max-w-xs sm:max-w-md md:max-w-lg mx-auto">
                    Shop from millions of products across Electronics, Fashion, Home & Kitchen, and Books
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center">
                    <Link href="/user/categories">
                      <button className="bg-blue-600 ml-21 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium flex items-center gap-1.5 sm:gap-2 shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5 text-sm sm:text-base">
                        Start Shopping <ArrowRight size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </Link>
                    <Link href="/user/categories">
                      <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium hover:bg-white/20 transition-all duration-300 text-sm sm:text-base">
                        Browse Categories
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories Grid */}
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-900">Shop by Category</h2>
                <Link href="/user/categories">
                  <button className="bg-transparent border-none text-blue-700 flex items-center gap-1.5 cursor-pointer font-medium hover:gap-2 transition-all text-xs sm:text-sm">
                    View All <ChevronRight size={14} className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                {categories.map((category) => (
                  <Link key={category.id} href={`/user/categories?category=${category.title}`}>
                    <div className="bg-white rounded-lg sm:rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                      <div className="h-16 sm:h-20 md:h-24 relative" style={{ background: category.color }}>
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <category.icon size={20} className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <span className="absolute top-1.5 right-1.5 bg-white/25 text-white text-xs px-1.5 py-0.5 rounded-md">
                          {category.count}
                        </span>
                      </div>
                      <div className="p-2 sm:p-3 text-center">
                        <h3 className="font-semibold text-blue-900 text-xs sm:text-sm">{category.title}</h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Hot Sales Section */}
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-900 flex items-center gap-1.5 sm:gap-2">
                  <div className="p-1 sm:p-1.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-md sm:rounded-lg">
                    <Flame size={16} className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  Hot Sales
                  <span className="text-xs bg-gradient-to-r from-red-500 to-orange-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ml-1.5">
                    Limited Time
                  </span>
                </h2>
                <Link href="/user/sales">
                  <button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1.5 shadow-lg hover:shadow-red-500/30 transition-all text-xs sm:text-sm">
                    View All Sales <ArrowRight size={12} className="w-3 h-3" />
                  </button>
                </Link>
              </div>

              <div className="relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {hotSaleProducts.map((sale, index) => (
                    <div
                      key={sale.id}
                      className={`bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-md border-2 border-orange-300 transition-all duration-300 transform ${index === currentSlide ? 'scale-100 ring-1 ring-orange-400 z-10' : 'scale-95 opacity-90'}`}
                    >
                      <div className="relative h-32 sm:h-36 md:h-40">
                        <Image
                          src={sale.image}
                          alt={sale.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 50vw, 25vw"
                          className="object-cover"
                          onError={(e) => { e.currentTarget.src = "/placeholder-product.png"; }}
                        />
                        {sale.isOnSale && (
                          <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-0.5 rounded-md text-xs font-bold shadow-md">
                            -{Math.round(((Number(sale.originalPrice) - Number(sale.price)) / Number(sale.originalPrice)) * 100)}%
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-blue-900/90 backdrop-blur-md text-white py-0.5 px-1.5 rounded-md flex items-center gap-1">
                          <Clock size={10} className="w-2.5 h-2.5" />
                          <span className="text-xs font-medium">{sale.timeLeft}</span>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-white/90 text-blue-900 text-xs font-medium py-0.5 px-1.5 rounded-md">
                          {sale.category}
                        </div>
                      </div>
                      <div className="p-2 sm:p-3">
                        <h3 className="font-bold text-sm text-blue-900 mb-1 line-clamp-1">{sale.name}</h3>
                        <div className="flex items-center gap-1 mb-1 sm:mb-2">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={`${sale.id}-star-${i}`}
                                size={10}
                                className={`w-2.5 h-2.5 ${i < Math.floor(Number(sale.rating)) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-blue-700/80">({sale.reviewCount})</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-bold text-blue-900">${sale.price}</span>
                              {sale.originalPrice && Number(sale.originalPrice) > Number(sale.price) && (
                                <span className="text-xs text-gray-500 line-through">${sale.originalPrice}</span>
                              )}
                            </div>
                          </div>
                          <button onClick={() => handleAddToCart(sale)} className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-1.5 px-3 rounded-lg font-medium flex items-center gap-1 transition-all shadow-md hover:shadow-lg text-xs">
                            Buy Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-1.5 mt-3 sm:mt-4">
                  {hotSaleProducts.map((_, index) => (
                    <button
                      key={`slide-${index}`}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${index === currentSlide ? 'bg-blue-800 w-4' : 'bg-blue-300'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Featured Products */}
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-900">Featured Products</h2>
                <Link href="/user/categories">
                  <button className="bg-blue-700 hover:bg-blue-800 text-white border-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1.5 shadow-lg hover:shadow-blue-500/30 transition-all text-xs sm:text-sm">
                    View All Products <ArrowRight size={12} className="w-3 h-3" />
                  </button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {featuredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group"
                  >
                    <div className="relative overflow-hidden h-32 sm:h-36 md:h-40">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.currentTarget.src = "/placeholder-product.png"; }}
                      />
                      <div className="absolute top-1.5 left-1.5 flex gap-1">
                        {product.tags.map((tag, index) => (
                          <span key={`${product.id}-tag-${index}`} className="bg-blue-600 text-white text-xs px-1 py-0.5 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button onClick={() => handleAddToWishlist(product)} className="absolute top-1.5 right-1.5 bg-white/90 hover:bg-white p-1 rounded-full shadow-sm transition-all hover:scale-105">
                        <Heart size={12} className="w-3 h-3 text-blue-600" />
                      </button>
                      {product.isOnSale && (
                        <div className="absolute bottom-1.5 left-1.5 bg-red-500 text-white text-xs font-bold px-1 py-0.5 rounded-md">
                          SALE
                        </div>
                      )}
                    </div>
                    <div className="p-2 sm:p-3">
                      <p className="text-xs text-blue-600 font-medium mb-1">{product.category}</p>
                      <h3 className="font-semibold text-blue-900 mb-1 text-xs sm:text-sm line-clamp-1">{product.name}</h3>
                      <div className="flex items-center gap-1 mb-1 sm:mb-2">
                        <div className="flex items-center gap-0.5 bg-blue-100 px-1 py-0.5 rounded">
                          <Star size={10} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-semibold text-blue-900">{product.rating}</span>
                        </div>
                        <span className="text-xs text-blue-700/80">({product.reviewCount})</span>
                      </div>
                      <div className="flex items-center justify-between mt-1 sm:mt-2">
                        <div>
                          <p className="text-sm font-bold text-blue-900">${product.price}</p>
                          {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                            <p className="text-xs text-gray-500 line-through">${product.originalPrice}</p>
                          )}
                        </div>
                        <button onClick={() => handleAddToCart(product)} className="bg-blue-100 hover:bg-blue-200 p-1 rounded-md transition-colors">
                          <ShoppingBag size={12} className="w-3 h-3 text-blue-700" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}