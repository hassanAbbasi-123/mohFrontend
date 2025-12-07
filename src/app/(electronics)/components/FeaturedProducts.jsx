'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Carrot, Apple, Sprout, Wheat, Zap, Sparkles, Flame, Crown, Star, ArrowRight, ShoppingCart, Heart, Eye,
  ChevronLeft, ChevronRight, TrendingUp, Shield, Truck, Clock, Leaf
} from 'lucide-react';
import { useGetApprovedProductsQuery } from '@/store/features/productApi';
import { useGetAllCategoriesQuery } from '@/store/features/categoryApi';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * FeaturedProductsWithSidebar (Categories Row on Top)
 */

export default function FeaturedProductsWithSidebar({ addToCart, setQuickViewProduct }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollContainerRef = useRef(null);
  
  // Fetch categories from the categoryApi
  const { data: categoriesData = [], isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  
  // Auto-rotate featured products
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Vegetable/Fruit category configurations
  const categoryConfigs = {
    Vegetables: { 
      icon: <Carrot className="w-4 h-4" />,
      bgColor: 'from-green-500/10 to-emerald-500/10',
      borderColor: 'border-green-400/30',
      iconColor: 'text-green-300',
      accentColor: 'green',
      hoverColor: 'hover:from-green-500/20 hover:to-emerald-500/20'
    },
    Fruits: { 
      icon: <Apple className="w-4 h-4" />,
      bgColor: 'from-orange-500/10 to-red-500/10',
      borderColor: 'border-orange-400/30',
      iconColor: 'text-orange-300',
      accentColor: 'orange',
      hoverColor: 'hover:from-orange-500/20 hover:to-red-500/20'
    },
    Seeds: { 
      icon: <Sprout className="w-4 h-4" />,
      bgColor: 'from-amber-500/10 to-yellow-500/10',
      borderColor: 'border-amber-400/30',
      iconColor: 'text-amber-300',
      accentColor: 'amber',
      hoverColor: 'hover:from-amber-500/20 hover:to-yellow-500/20'
    },
    'Dried Legumes': { 
      icon: <Wheat className="w-4 h-4" />,
      bgColor: 'from-amber-500/10 to-yellow-500/10',
      borderColor: 'border-amber-400/30',
      iconColor: 'text-amber-300',
      accentColor: 'amber',
      hoverColor: 'hover:from-amber-500/20 hover:to-yellow-500/20'
    },
    'Organic Produce': { 
      icon: <Sparkles className="w-4 h-4" />,
      bgColor: 'from-lime-500/10 to-green-500/10',
      borderColor: 'border-lime-400/30',
      iconColor: 'text-lime-300',
      accentColor: 'lime',
      hoverColor: 'hover:from-lime-500/20 hover:to-green-500/20'
    },
    'Fresh Herbs': { 
      icon: <Leaf className="w-4 h-4" />,
      bgColor: 'from-emerald-500/10 to-teal-500/10',
      borderColor: 'border-emerald-400/30',
      iconColor: 'text-emerald-300',
      accentColor: 'emerald',
      hoverColor: 'hover:from-emerald-500/20 hover:to-teal-500/20'
    },
    'Seasonal Fruits': { 
      icon: <Apple className="w-4 h-4" />,
      bgColor: 'from-pink-500/10 to-rose-500/10',
      borderColor: 'border-pink-400/30',
      iconColor: 'text-pink-300',
      accentColor: 'pink',
      hoverColor: 'hover:from-pink-500/20 hover:to-rose-500/20'
    },
    'Leafy Greens': { 
      icon: <Carrot className="w-4 h-4" />,
      bgColor: 'from-green-500/10 to-lime-500/10',
      borderColor: 'border-green-400/30',
      iconColor: 'text-green-300',
      accentColor: 'green',
      hoverColor: 'hover:from-green-500/20 hover:to-lime-500/20'
    },
    'Root Vegetables': { 
      icon: <Carrot className="w-4 h-4" />,
      bgColor: 'from-orange-500/10 to-amber-500/10',
      borderColor: 'border-orange-400/30',
      iconColor: 'text-orange-300',
      accentColor: 'orange',
      hoverColor: 'hover:from-orange-500/20 hover:to-amber-500/20'
    },
  };

  // Default configuration for unknown categories
  const defaultConfig = {
    icon: <Zap className="w-4 h-4" />,
    bgColor: 'from-green-500/10 to-emerald-500/10',
    borderColor: 'border-green-400/30',
    iconColor: 'text-green-300',
    accentColor: 'green',
    hoverColor: 'hover:from-green-500/20 hover:to-emerald-500/20'
  };

  // Prepare categories for rendering, including an "All Categories" option
  const categories = [
    { 
      _id: null, 
      name: 'All Categories', 
      icon: <Sparkles className="w-4 h-4" />,
      bgColor: 'from-green-500/10 via-emerald-500/10 to-lime-500/10',
      borderColor: 'border-green-400/30',
      iconColor: 'text-emerald-300',
      accentColor: 'emerald',
      hoverColor: 'hover:from-green-500/20 hover:via-emerald-500/20 hover:to-lime-500/20',
      count: '∞' 
    },
    ...categoriesData.map(cat => {
      const config = categoryConfigs[cat.name] || defaultConfig;
      return {
        ...cat,
        icon: config.icon,
        bgColor: config.bgColor,
        borderColor: config.borderColor,
        iconColor: config.iconColor,
        accentColor: config.accentColor,
        hoverColor: config.hoverColor,
        count: Math.floor((cat.name.charCodeAt(0) * 13) % 50) + 10 // Deterministic mock count
      };
    }),
  ];

  // Fetch products based on the selected category
  const { data: products = [], isLoading: productsLoading } = useGetApprovedProductsQuery({
    category: activeCategory ? activeCategory : undefined,
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Build image URL function
  const buildImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-product.png';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return imagePath;
    return `${API_BASE}/${imagePath.replace(/\\/g, '/')}`;
  };

  // Scroll functions for categories row
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Client-side particles (purely decorative)
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    // only generate on client
    if (typeof window !== 'undefined') {
      const newParticles = [...Array(8)].map(() => ({
        initialX: Math.random() * window.innerWidth,
        initialY: Math.random() * (window.innerHeight * 0.4),
        animateXOffset: Math.random() * 12 - 6,
        duration: 3 + Math.random() * 2,
        delay: Math.random() * 2,
        size: Math.random() * 1.5 + 0.5,
      }));
      setParticles(newParticles);
    }
  }, []);

  // Helper function to get active state styles
  const getActiveStyles = (category) => {
    if (!category.accentColor) return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-transparent shadow-xl';
    
    const accentMap = {
      green: 'bg-gradient-to-r from-green-500 to-green-600 text-white border-transparent shadow-xl',
      emerald: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-transparent shadow-xl',
      orange: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-transparent shadow-xl',
      amber: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-transparent shadow-xl',
      lime: 'bg-gradient-to-r from-lime-500 to-lime-600 text-white border-transparent shadow-xl',
      pink: 'bg-gradient-to-r from-pink-500 to-pink-600 text-white border-transparent shadow-xl',
    };
    
    return accentMap[category.accentColor] || accentMap.green;
  };

  return (
    <section
      className="w-full bg-gradient-to-br from-green-800 via-emerald-800 to-green-900 py-6 sm:py-8 md:py-12 relative overflow-hidden"
      aria-label="Featured products"
    >
      {/* Enhanced Background Elements */}
      <div className="pointer-events-none" aria-hidden>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-32 -right-32 w-64 h-64 bg-green-600/20 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="absolute -bottom-24 -left-24 w-56 h-56 bg-emerald-600/20 rounded-full blur-3xl"
        />
        {particles.map((p, i) => (
          <motion.div
            key={`p-${i}`}
            initial={{ x: p.initialX, y: p.initialY, opacity: 0 }}
            animate={{ x: p.initialX + p.animateXOffset, y: p.initialY - 15, opacity: [0, 0.6, 0] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
            className="absolute bg-green-300/30 rounded-full"
            style={{ width: p.size, height: p.size }}
          />
        ))}
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative">
        {/* Categories Row - Now at the top for all screen sizes */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <motion.h2 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3"
            >
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              Browse Categories
            </motion.h2>
            
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center text-sm bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1.5 rounded-full shadow-lg">
                {categories.length} Categories
              </div>
              <div className="flex items-center gap-1">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={scrollLeft} 
                  aria-label="Scroll categories left" 
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 hover:bg-white/30 transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={scrollRight} 
                  aria-label="Scroll categories right" 
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 hover:bg-white/30 transition-all duration-200"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Categories Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-3 overflow-x-auto no-scrollbar pb-4 -ml-1 pl-1"
            role="tablist"
            aria-label="Product categories"
          >
            {categoriesLoading ? (
              <div className="flex gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-32 h-20 bg-green-600/30 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              categories.map((cat, i) => (
                <motion.button
                  key={cat._id ?? `cat-${i}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(cat._id)}
                  role="tab"
                  aria-selected={activeCategory === cat._id}
                  className={`flex-shrink-0 w-32 sm:w-36 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl font-semibold transition-all duration-300 border-2 focus:outline-none focus:ring-2 focus:ring-green-400 ${
                    activeCategory === cat._id
                      ? getActiveStyles(cat) + ' shadow-xl'
                      : `bg-gradient-to-r ${cat.bgColor} text-green-100 border ${cat.borderColor} ${cat.hoverColor} hover:shadow-lg`
                  }`}
                >
                  <div className={`p-2 rounded-xl transition-all duration-300 ${
                    activeCategory === cat._id 
                      ? `bg-white/20 text-white` 
                      : `bg-white/10 ${cat.iconColor}`
                  }`}>
                    {cat.icon}
                  </div>
                  <span className="text-sm font-semibold text-center leading-tight">{cat.name}</span>
                  <span className={`text-xs ${
                    activeCategory === cat._id ? 'text-white/80' : 'text-green-200/70'
                  }`}>
                    {cat.count} items
                  </span>
                </motion.button>
              ))
            )}
          </div>
        </motion.div>

        {/* Main Content Area */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div className="flex-1">
              <motion.div 
                initial={{ y: -8, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-2 rounded-full mb-3 shadow-lg"
              >
                <Flame className="w-4 h-4" />
                <span className="text-sm font-bold">FRESH COLLECTION</span>
              </motion.div>

              <motion.h2 
                initial={{ y: 8, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.4 }} 
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2"
              >
                Farm Fresh <span className="text-yellow-300 ">Delights</span>
              </motion.h2>

              <motion.p 
                initial={{ y: 8, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.5 }} 
                className="text-sm sm:text-base text-green-100 max-w-2xl"
              >
                Discover handpicked fresh produce with <span className="font-semibold text-yellow-300">farm-to-table quality</span> and guaranteed freshness
              </motion.p>
            </div>

            <div className="mt-2 sm:mt-0">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                transition={{ delay: 0.6 }}
              >
                <Link 
                  href="/products" 
                  className="group inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-3 rounded-xl shadow-lg hover:bg-white/20 hover:shadow-xl text-sm font-bold transition-all duration-300"
                >
                  <TrendingUp className="w-4 h-4" />
                  Explore All
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Trust Badges */}
          {/* <motion.div 
            initial={{ y: 12, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.7 }}
            className="flex flex-wrap gap-3 mb-8 justify-center sm:justify-start"
          >
            {[
              { icon: Shield, label: "100% Secure", color: "green" },
              { icon: Truck, label: "Fast Delivery", color: "emerald" },
              { icon: Clock, label: "24/7 Support", color: "amber" },
              { icon: Crown, label: "Premium Quality", color: "yellow" }
            ].map((badge, i) => (
              <motion.div
                key={badge.label}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-200"
              >
                <badge.icon className={`w-4 h-4 text-${badge.color}-400`} />
                <div className="text-xs text-green-100 font-medium">{badge.label}</div>
              </motion.div>
            ))}
          </motion.div> */}

          {/* Products Grid */}
          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-16 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 8 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.03 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden animate-pulse"
                >
                  <div className="h-32 sm:h-36 bg-green-600/30" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-green-600/30 rounded w-3/4" />
                    <div className="h-3 bg-green-600/30 rounded w-1/2" />
                    <div className="h-8 bg-green-600/30 rounded-xl w-full" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20 shadow-xl"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Products Found</h3>
              <p className="text-green-100 mb-4">We're preparing amazing fresh produce for this category. Check back soon or explore other categories!</p>
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={() => setActiveCategory(null)} 
                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Show All Products
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              <AnimatePresence>
                {products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 8, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: index * 0.02, type: 'spring', stiffness: 120, damping: 16 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    onHoverStart={() => setHoveredProduct(product._id)}
                    onHoverEnd={() => setHoveredProduct(null)}
                    className="relative group"
                  >
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col relative">
                      
                      {/* Enhanced Background Glow */}
                      <AnimatePresence>
                        {hoveredProduct === product._id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl -z-10"
                          />
                        )}
                      </AnimatePresence>

                      {/* Stock Status */}
                      <div className="absolute top-3 left-3 z-20">
                        {product.inStock ? (
                          <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            <span className="text-xs">In Stock</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            <span className="text-xs">Out of Stock</span>
                          </div>
                        )}
                      </div>

                      {/* Enhanced Badges */}
                      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
                        {product.coupons?.length > 0 && (
                          <motion.div 
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg"
                          >
                            <Zap className="w-3 h-3" />
                            <span className="text-xs">{product.coupons[0]?.discount || '10%'} OFF</span>
                          </motion.div>
                        )}
                        {product.isOnSale && (
                          <motion.div 
                            initial={{ scale: 0, rotate: 180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg"
                          >
                            <Flame className="w-3 h-3" />
                            <span className="text-xs">HOT DEAL</span>
                          </motion.div>
                        )}
                      </div>

                      {/* Enhanced Quick Actions */}
                      <div className="absolute top-12 right-3 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-4">
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label="Wishlist" 
                          className="p-2 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white/30 transition-all duration-200"
                        >
                          <Heart className="w-4 h-4 text-white" />
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label="Quick view" 
                          onClick={() => setQuickViewProduct(product)} 
                          className="p-2 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white/30 transition-all duration-200"
                        >
                          <Eye className="w-4 h-4 text-white" />
                        </motion.button>
                      </div>

                      {/* Enhanced Product Image */}
                      <Link href={`/product/${product.slug}`} className="block flex-shrink-0">
                        <div className="relative h-32 sm:h-36 md:h-40 w-full overflow-hidden bg-white/10">
                          <motion.div 
                            whileHover={{ scale: 1.08 }} 
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="h-full w-full"
                          >
                            <Image
                              src={buildImageUrl(product.image)}
                              alt={product.name}
                              fill
                              className="object-cover w-full h-full transition-transform duration-500"
                              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder-product.png";
                              }}
                            />
                          </motion.div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </Link>

                      {/* Enhanced Product Info */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col">
                        <div className="flex-1">
                          <Link href={`/product/${product.slug}`}>
                            <h3 className="text-sm sm:text-base font-semibold text-white leading-tight line-clamp-2 mb-2 hover:text-yellow-300 transition-colors duration-200 group-hover:underline">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-xs text-green-100 mb-3 line-clamp-1">by {product.seller?.user?.name || 'Premium Seller'}</p>

                          {/* Enhanced Rating */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-3 h-3 ${i < (product.rating || 4) ? 'fill-yellow-400 text-yellow-400' : 'fill-white/30 text-white/30'}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-green-100">({product.reviewCount || 24})</span>
                            </div>
                          </div>

                          {/* Enhanced Price */}
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-lg font-bold text-yellow-300">
                                {product.price} PKR
                              </p>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <p className="text-sm line-through text-green-200">{product.originalPrice} PKR</p>
                              )}
                            </div>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <div className="text-right">
                                <p className="text-xs text-green-100">You save</p>
                                <p className="text-sm font-bold text-amber-300">
                                  {product.originalPrice - product.price} PKR
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Enhanced Add to Cart Button */}
                        <div className="mt-auto pt-3">
                          <motion.button 
                            whileHover={{ scale: 1.03 }} 
                            whileTap={{ scale: 0.97 }} 
                            onClick={() => addToCart(product)} 
                            disabled={!product.inStock}
                            className={`w-full py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden ${
                              product.inStock
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600'
                                : 'bg-white/20 text-white/70 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <ShoppingCart className="w-4 h-4" />
                              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                            </div>
                            {product.inStock && (
                              <motion.div
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '100%' }}
                                transition={{ duration: 0.6 }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                              />
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Hover Effects */}
                    <AnimatePresence>
                      {hoveredProduct === product._id && (
                        <>
                          <motion.div 
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400/50 rounded-full blur-sm"
                          />
                          <motion.div 
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ delay: 0.05 }}
                            className="absolute -bottom-2 -left-2 w-4 h-4 bg-amber-400/50 rounded-full blur-sm"
                          />
                        </>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}