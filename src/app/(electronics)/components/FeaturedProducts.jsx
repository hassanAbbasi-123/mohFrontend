'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Carrot, Apple, Sprout, Wheat, Zap, Sparkles, Flame, Crown, Star, ArrowRight, ShoppingCart, Heart, Eye,
  ChevronLeft, ChevronRight, TrendingUp, Shield, Truck, Clock, Leaf, Layers, Menu, Grid, Filter
} from 'lucide-react';
import { useGetApprovedProductsQuery } from '@/store/features/productApi';
import { useGetAllCategoriesQuery } from '@/store/features/categoryApi';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * FeaturedProductsWithSidebar (Child Categories Row on Top)
 */

export default function FeaturedProductsWithSidebar({ addToCart, setQuickViewProduct }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showMobileCategories, setShowMobileCategories] = useState(false);
  const [mobileViewMode, setMobileViewMode] = useState('grid'); // 'grid' or 'list'
  const scrollContainerRef = useRef(null);
  
  // Fetch categories from the categoryApi
  const { data: categoriesData = [], isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  
  // Filter only child categories (categories that have a parentCategory)
  const childCategories = categoriesData.filter(cat => cat.parentCategory);
  
  // Auto-rotate featured products
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Child category configurations
  const childCategoryConfigs = {
    // Vegetables subcategories
    'Leafy Greens': { 
      icon: <Leaf className="w-4 h-4" />,
      bgColor: 'from-green-500/10 to-emerald-500/10',
      borderColor: 'border-green-400/30',
      iconColor: 'text-green-300',
      accentColor: 'green',
      hoverColor: 'hover:from-green-500/20 hover:to-emerald-500/20'
    },
    'Root Vegetables': { 
      icon: <Carrot className="w-4 h-4" />,
      bgColor: 'from-orange-500/10 to-amber-500/10',
      borderColor: 'border-orange-400/30',
      iconColor: 'text-orange-300',
      accentColor: 'orange',
      hoverColor: 'hover:from-orange-500/20 hover:to-amber-500/20'
    },
    'Tomatoes': { 
      icon: <Apple className="w-4 h-4" />,
      bgColor: 'from-red-500/10 to-rose-500/10',
      borderColor: 'border-red-400/30',
      iconColor: 'text-red-300',
      accentColor: 'red',
      hoverColor: 'hover:from-red-500/20 hover:to-rose-500/20'
    },
    'Peppers': { 
      icon: <Flame className="w-4 h-4" />,
      bgColor: 'from-orange-500/10 to-red-500/10',
      borderColor: 'border-orange-400/30',
      iconColor: 'text-orange-300',
      accentColor: 'orange',
      hoverColor: 'hover:from-orange-500/20 hover:to-red-500/20'
    },
    'Cucumbers': { 
      icon: <Sprout className="w-4 h-4" />,
      bgColor: 'from-lime-500/10 to-green-500/10',
      borderColor: 'border-lime-400/30',
      iconColor: 'text-lime-300',
      accentColor: 'lime',
      hoverColor: 'hover:from-lime-500/20 hover:to-green-500/20'
    },
    
    // Fruits subcategories
    'Citrus Fruits': { 
      icon: <Apple className="w-4 h-4" />,
      bgColor: 'from-yellow-500/10 to-orange-500/10',
      borderColor: 'border-yellow-400/30',
      iconColor: 'text-yellow-300',
      accentColor: 'yellow',
      hoverColor: 'hover:from-yellow-500/20 hover:to-orange-500/20'
    },
    'Berries': { 
      icon: <Apple className="w-4 h-4" />,
      bgColor: 'from-pink-500/10 to-purple-500/10',
      borderColor: 'border-pink-400/30',
      iconColor: 'text-pink-300',
      accentColor: 'pink',
      hoverColor: 'hover:from-pink-500/20 hover:to-purple-500/20'
    },
    'Tropical Fruits': { 
      icon: <Sparkles className="w-4 h-4" />,
      bgColor: 'from-amber-500/10 to-yellow-500/10',
      borderColor: 'border-amber-400/30',
      iconColor: 'text-amber-300',
      accentColor: 'amber',
      hoverColor: 'hover:from-amber-500/20 hover:to-yellow-500/20'
    },
    
    // Seeds subcategories
    'Vegetable Seeds': { 
      icon: <Sprout className="w-4 h-4" />,
      bgColor: 'from-emerald-500/10 to-green-500/10',
      borderColor: 'border-emerald-400/30',
      iconColor: 'text-emerald-300',
      accentColor: 'emerald',
      hoverColor: 'hover:from-emerald-500/20 hover:to-green-500/20'
    },
    'Flower Seeds': { 
      icon: <Sparkles className="w-4 h-4" />,
      bgColor: 'from-purple-500/10 to-pink-500/10',
      borderColor: 'border-purple-400/30',
      iconColor: 'text-purple-300',
      accentColor: 'purple',
      hoverColor: 'hover:from-purple-500/20 hover:to-pink-500/20'
    },
    
    // Dried Legumes subcategories
    'Lentils': { 
      icon: <Wheat className="w-4 h-4" />,
      bgColor: 'from-amber-500/10 to-orange-500/10',
      borderColor: 'border-amber-400/30',
      iconColor: 'text-amber-300',
      accentColor: 'amber',
      hoverColor: 'hover:from-amber-500/20 hover:to-orange-500/20'
    },
    'Beans': { 
      icon: <Wheat className="w-4 h-4" />,
      bgColor: 'from-brown-500/10 to-amber-500/10',
      borderColor: 'border-brown-400/30',
      iconColor: 'text-amber-300',
      accentColor: 'amber',
      hoverColor: 'hover:from-brown-500/20 hover:to-amber-500/20'
    },
  };

  // Default configuration for unknown child categories
  const defaultConfig = {
    icon: <Layers className="w-4 h-4" />,
    bgColor: 'from-green-500/10 to-emerald-500/10',
    borderColor: 'border-green-400/30',
    iconColor: 'text-green-300',
    accentColor: 'green',
    hoverColor: 'hover:from-green-500/20 hover:to-emerald-500/20'
  };

  // Prepare child categories for rendering, including an "All Child Categories" option
  const categories = [
    { 
      _id: null, 
      name: 'All', 
      parentCategory: 'All',
      icon: <Sparkles className="w-4 h-4" />,
      bgColor: 'from-green-500/10 via-emerald-500/10 to-lime-500/10',
      borderColor: 'border-green-400/30',
      iconColor: 'text-emerald-300',
      accentColor: 'emerald',
      hoverColor: 'hover:from-green-500/20 hover:via-emerald-500/20 hover:to-lime-500/20',
      count: '∞' 
    },
    ...childCategories.map(cat => {
      const config = childCategoryConfigs[cat.name] || defaultConfig;
      // Get parent category name
      const parentCat = categoriesData.find(c => c._id === cat.parentCategory);
      const parentName = parentCat?.name || 'Parent';
      
      return {
        ...cat,
        parentName: parentName,
        icon: config.icon,
        bgColor: config.bgColor,
        borderColor: config.borderColor,
        iconColor: config.iconColor,
        accentColor: config.accentColor,
        hoverColor: config.hoverColor,
        count: Math.floor((cat.name.charCodeAt(0) * 13) % 40) + 5 // Deterministic mock count
      };
    }),
  ];

  // Fetch products based on the selected child category
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
    if (!category.accentColor) return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-transparent shadow-lg';
    
    const accentMap = {
      green: 'bg-gradient-to-r from-green-500 to-green-600 text-white border-transparent shadow-lg',
      emerald: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-transparent shadow-lg',
      orange: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-transparent shadow-lg',
      amber: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-transparent shadow-lg',
      lime: 'bg-gradient-to-r from-lime-500 to-lime-600 text-white border-transparent shadow-lg',
      pink: 'bg-gradient-to-r from-pink-500 to-pink-600 text-white border-transparent shadow-lg',
      red: 'bg-gradient-to-r from-red-500 to-red-600 text-white border-transparent shadow-lg',
      yellow: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-transparent shadow-lg',
      purple: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-transparent shadow-lg',
    };
    
    return accentMap[category.accentColor] || accentMap.green;
  };

  // Top 8 categories for mobile (shorter list for better mobile UX)
  const mobileCategories = categories.slice(0, 8);

  return (
    <section
      className="w-full bg-gradient-to-br from-green-800 via-emerald-800 to-green-900 py-4 md:py-8 lg:py-12 relative overflow-hidden"
      aria-label="Featured products"
    >
      {/* Enhanced Background Elements */}
      <div className="pointer-events-none" aria-hidden>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-20 -right-16 w-40 h-40 bg-green-600/20 rounded-full blur-2xl md:blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="absolute -bottom-16 -left-16 w-36 h-36 bg-emerald-600/20 rounded-full blur-2xl md:blur-3xl"
        />
      </div>

      <div className="mx-auto px-4 md:px-6 lg:px-8 max-w-7xl relative">
        {/* Mobile Header with Filter and View Toggle */}
        <div className="md:hidden mb-4">
          <div className="flex items-center justify-between mb-3">
            <motion.h2 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-lg font-bold text-white flex items-center gap-2"
            >
              <div className="p-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <Layers className="w-4 h-4 text-white" />
              </div>
              Specialized Products
            </motion.h2>
            
            <div className="flex items-center gap-1">
              {/* View Toggle */}
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-0.5">
                <button
                  onClick={() => setMobileViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${mobileViewMode === 'grid' ? 'bg-green-500 text-white' : 'text-green-100'}`}
                  aria-label="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setMobileViewMode('list')}
                  className={`p-1.5 rounded-md transition-all ${mobileViewMode === 'list' ? 'bg-green-500 text-white' : 'text-green-100'}`}
                  aria-label="List view"
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>
              
              {/* Categories Toggle */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMobileCategories(!showMobileCategories)}
                className="p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white ml-1"
                aria-label="Filter categories"
              >
                <Menu className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Mobile Categories Grid - Always visible with 4 per row */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3"
          >
            <div className="grid grid-cols-4 gap-2">
              {mobileCategories.map((cat, index) => (
                <motion.button
                  key={cat._id ?? `cat-${index}`}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(cat._id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                    activeCategory === cat._id
                      ? getActiveStyles(cat) + ' shadow-md'
                      : `bg-gradient-to-r ${cat.bgColor} text-green-100 border ${cat.borderColor}`
                  }`}
                >
                  <div className={`p-1.5 rounded-lg mb-1 ${activeCategory === cat._id ? 'bg-white/20 text-white' : `bg-white/10 ${cat.iconColor}`}`}>
                    {cat.icon}
                  </div>
                  <span className="text-xs font-medium text-center truncate w-full">{cat.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* View All Categories Button */}
          <div className="flex justify-center mb-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMobileCategories(!showMobileCategories)}
              className="flex items-center gap-1.5 text-xs text-green-200 font-medium px-3 py-1.5 bg-white/5 rounded-full border border-white/10"
            >
              {showMobileCategories ? 'Show Less' : 'All Categories'}
              <ChevronRight className={`w-3 h-3 transition-transform ${showMobileCategories ? 'rotate-90' : ''}`} />
            </motion.button>
          </div>

          {/* Expanded Categories Grid */}
          <AnimatePresence>
            {showMobileCategories && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 mt-2">
                  <div className="grid grid-cols-4 gap-2">
                    {categories.map((cat) => (
                      <motion.button
                        key={cat._id ?? `cat-${cat.name}`}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setActiveCategory(cat._id);
                          setShowMobileCategories(false);
                        }}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium transition-all ${
                          activeCategory === cat._id
                            ? getActiveStyles(cat) + ' shadow-md'
                            : `bg-gradient-to-r ${cat.bgColor} text-green-100 border ${cat.borderColor}`
                        }`}
                      >
                        <div className={`p-1 rounded-md mb-1 ${
                          activeCategory === cat._id 
                            ? 'bg-white/20 text-white' 
                            : `bg-white/10 ${cat.iconColor}`
                        }`}>
                          {cat.icon}
                        </div>
                        <span className="text-center truncate w-full">{cat.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Child Categories Row */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="hidden md:block mb-6 lg:mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <motion.h2 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl lg:text-2xl font-bold text-white flex items-center gap-3"
            >
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <Layers className="w-5 h-5 text-white" />
              </div>
              Browse Specialized Categories
            </motion.h2>
            
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center text-sm bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1.5 rounded-full shadow-lg">
                {categories.length} Specialized
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

          {/* Child Categories Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-3 overflow-x-auto no-scrollbar pb-4 -ml-1 pl-1"
            role="tablist"
            aria-label="Specialized product categories"
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
                  className={`flex-shrink-0 w-36 lg:w-40 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl font-semibold transition-all duration-300 border-2 focus:outline-none focus:ring-2 focus:ring-green-400 ${
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
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-semibold text-center leading-tight">{cat.name}</span>
                    {cat.parentName && cat.parentName !== 'All' && (
                      <span className="text-xs text-green-200/70 mt-1 px-2 py-0.5 bg-black/20 rounded-full">
                        {cat.parentName}
                      </span>
                    )}
                  </div>
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 lg:mb-8 gap-4">
            <div className="flex-1">
              <motion.div 
                initial={{ y: -8, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full mb-3 shadow-lg"
              >
                <Flame className="w-3 md:w-4 h-3 md:h-4" />
                <span className="text-xs md:text-sm font-bold">SPECIALIZED COLLECTION</span>
              </motion.div>

              <motion.h2 
                initial={{ y: 8, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.4 }} 
                className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-2"
              >
                Premium <span className="text-yellow-300">Specialized</span> Products
              </motion.h2>

              <motion.p 
                initial={{ y: 8, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.5 }} 
                className="text-sm md:text-base text-green-100 max-w-2xl"
              >
                Discover specialized products from our curated categories with <span className="font-semibold text-yellow-300">expert-selected quality</span> and premium freshness
              </motion.p>
            </div>

            <div className="mt-2 md:mt-0">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                transition={{ delay: 0.6 }}
              >
                <Link 
                  href="/products" 
                  className="group inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-3 md:px-4 py-2.5 md:py-3 rounded-xl shadow-lg hover:bg-white/20 hover:shadow-xl text-sm font-bold transition-all duration-300"
                >
                  <TrendingUp className="w-3 md:w-4 h-3 md:h-4" />
                  <span>Explore All</span>
                  <ArrowRight className="w-3 md:w-4 h-3 md:h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Products Grid/List */}
          {productsLoading ? (
            <div className={mobileViewMode === 'grid' 
              ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6"
              : "space-y-3 md:space-y-4"
            }>
              {[...Array(8)].map((_, i) => (
                mobileViewMode === 'grid' ? (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 8 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: i * 0.03 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/20 shadow-lg overflow-hidden animate-pulse"
                  >
                    <div className="h-32 md:h-36 lg:h-40 bg-green-600/30" />
                    <div className="p-3 md:p-4 space-y-2">
                      <div className="h-3 bg-green-600/30 rounded w-3/4" />
                      <div className="h-3 bg-green-600/30 rounded w-1/2" />
                      <div className="h-8 bg-green-600/30 rounded-lg md:rounded-xl w-full" />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: i * 0.03 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-3 animate-pulse flex items-center gap-3"
                  >
                    <div className="w-20 h-20 bg-green-600/30 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-green-600/30 rounded w-3/4" />
                      <div className="h-3 bg-green-600/30 rounded w-1/2" />
                      <div className="h-6 bg-green-600/30 rounded-lg w-full" />
                    </div>
                  </motion.div>
                )
              ))}
            </div>
          ) : products.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl p-6 md:p-8 text-center border border-white/20 shadow-xl"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-2">No Products Found</h3>
              <p className="text-sm md:text-base text-green-100 mb-4">We're preparing amazing specialized products for this category. Check back soon or explore other specialized categories!</p>
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={() => setActiveCategory(null)} 
                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-5 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-sm md:text-base"
              >
                Show All Products
              </motion.button>
            </motion.div>
          ) : mobileViewMode === 'list' ? (
            // Mobile List View
            <div className="space-y-3 md:hidden">
              {products.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg overflow-hidden"
                >
                  <div className="flex items-stretch">
                    {/* Product Image */}
                    <Link href={`/product/${product.slug}`} className="flex-shrink-0 w-28 h-28 relative">
                      <Image
                        src={buildImageUrl(product.image)}
                        alt={product.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-product.png";
                        }}
                      />
                      {/* Stock Badge */}
                      <div className="absolute top-2 left-2">
                        {product.inStock ? (
                          <div className="flex items-center gap-1 bg-green-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold shadow-md">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            <span>In Stock</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold shadow-md">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            <span>Out of Stock</span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 p-3 flex flex-col justify-between">
                      <div>
                        <Link href={`/product/${product.slug}`}>
                          <h3 className="text-sm font-semibold text-white line-clamp-2 mb-1">{product.name}</h3>
                        </Link>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-2">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-2.5 h-2.5 ${i < (product.rating || 4) ? 'fill-yellow-400 text-yellow-400' : 'fill-white/30 text-white/30'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-xs text-green-100">({product.reviewCount || 24})</span>
                        </div>

                        {/* Price */}
                        <div className="mb-2">
                          <p className="text-lg font-bold text-yellow-300">
                            {product.price} PKR
                          </p>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <p className="text-xs line-through text-green-200">{product.originalPrice} PKR</p>
                          )}
                        </div>
                      </div>

                      {/* Add to Cart Button */}
                      <motion.button 
                        whileTap={{ scale: 0.97 }} 
                        onClick={() => addToCart(product)} 
                        disabled={!product.inStock}
                        className={`w-full py-2 px-3 rounded-lg font-semibold shadow-md transition-all duration-200 text-sm ${
                          product.inStock
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
                            : 'bg-white/20 text-white/70 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <ShoppingCart className="w-3.5 h-3.5" />
                          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                        </div>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            // Grid View (Desktop & Mobile Grid)
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
              <AnimatePresence>
                {products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 8, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: index * 0.02, type: 'spring', stiffness: 120, damping: 16 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    onHoverStart={() => setHoveredProduct(product._id)}
                    onHoverEnd={() => setHoveredProduct(null)}
                    className="relative group"
                  >
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/20 shadow-lg hover:shadow-xl md:hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col relative">
                      
                      {/* Stock Status */}
                      <div className="absolute top-2 md:top-3 left-2 md:left-3 z-20">
                        {product.inStock ? (
                          <div className="flex items-center gap-1 bg-green-500 text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-bold shadow-lg">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            <span className="text-xs">In Stock</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 bg-red-500 text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-bold shadow-lg">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            <span className="text-xs">Out of Stock</span>
                          </div>
                        )}
                      </div>

                      {/* Badges */}
                      <div className="absolute top-2 md:top-3 right-2 md:right-3 z-20 flex flex-col gap-1 md:gap-2">
                        {product.coupons?.length > 0 && (
                          <motion.div 
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-bold shadow-lg"
                          >
                            <Zap className="w-2.5 md:w-3 h-2.5 md:h-3" />
                            <span className="text-xs">{product.coupons[0]?.discount || '10%'} OFF</span>
                          </motion.div>
                        )}
                        {product.isOnSale && (
                          <motion.div 
                            initial={{ scale: 0, rotate: 180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-bold shadow-lg"
                          >
                            <Flame className="w-2.5 md:w-3 h-2.5 md:h-3" />
                            <span className="text-xs">HOT DEAL</span>
                          </motion.div>
                        )}
                      </div>

                      {/* Product Image */}
                      <Link href={`/product/${product.slug}`} className="block flex-shrink-0">
                        <div className="relative h-32 md:h-36 lg:h-40 w-full overflow-hidden bg-white/10">
                          <Image
                            src={buildImageUrl(product.image)}
                            alt={product.name}
                            fill
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder-product.png";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </Link>

                      {/* Product Info */}
                      <div className="p-3 md:p-4 flex-1 flex flex-col">
                        <div className="flex-1">
                          <Link href={`/product/${product.slug}`}>
                            <h3 className="text-sm md:text-base font-semibold text-white leading-tight line-clamp-2 mb-1 md:mb-2 hover:text-yellow-300 transition-colors duration-200">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-xs text-green-100 mb-2 md:mb-3 line-clamp-1">by {product.seller?.user?.name || 'Premium Seller'}</p>

                          {/* Rating */}
                          <div className="flex items-center justify-between mb-2 md:mb-3">
                            <div className="flex items-center gap-1 md:gap-2">
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-2.5 md:w-3 h-2.5 md:h-3 ${i < (product.rating || 4) ? 'fill-yellow-400 text-yellow-400' : 'fill-white/30 text-white/30'}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-green-100">({product.reviewCount || 24})</span>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="flex items-center justify-between mb-3 md:mb-4">
                            <div>
                              <p className="text-base md:text-lg font-bold text-yellow-300">
                                {product.price} PKR
                              </p>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <p className="text-xs md:text-sm line-through text-green-200">{product.originalPrice} PKR</p>
                              )}
                            </div>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <div className="text-right hidden md:block">
                                <p className="text-xs text-green-100">You save</p>
                                <p className="text-xs md:text-sm font-bold text-amber-300">
                                  {product.originalPrice - product.price} PKR
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Add to Cart Button */}
                        <div className="mt-auto pt-2 md:pt-3">
                          <motion.button 
                            whileHover={{ scale: 1.03 }} 
                            whileTap={{ scale: 0.97 }} 
                            onClick={() => addToCart(product)} 
                            disabled={!product.inStock}
                            className={`w-full py-2.5 md:py-3 px-3 md:px-4 rounded-lg md:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden text-sm md:text-base ${
                              product.inStock
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600'
                                : 'bg-white/20 text-white/70 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <ShoppingCart className="w-3.5 md:w-4 h-3.5 md:h-4" />
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