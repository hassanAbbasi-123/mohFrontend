'use client'

import { useMemo, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useGetApprovedProductsQuery } from "@/store/features/productApi"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Star, TrendingUp, Filter, Sparkles, Zap, ArrowRight, Crown, Flame } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function MostLikedProducts() {
  const [sort, setSort] = useState("likesDesc")
  const [activeFilter, setActiveFilter] = useState("all")
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredCard, setHoveredCard] = useState(null)
  const { data: productsData, isLoading, error } = useGetApprovedProductsQuery({ limit: 100 })

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const recommendedProducts = useMemo(() => {
    if (!productsData || !Array.isArray(productsData) || productsData.length === 0) return []

    const withCounts = productsData.map(p => ({
      ...p,
      likesCount: p.likes?.length || 0,
      popularityScore: (p.likes?.length || 0) * 2 + (p.reviewCount || 0) * 3
    }))

    let sortedProducts
    if (sort === "likesDesc") {
      sortedProducts = [...withCounts].sort((a, b) => b.likesCount - a.likesCount || b.reviewCount - a.reviewCount)
    } else if (sort === "reviewsDesc") {
      sortedProducts = [...withCounts].sort((a, b) => b.reviewCount - a.reviewCount || b.likesCount - a.likesCount)
    } else {
      sortedProducts = [...withCounts].sort((a, b) => b.popularityScore - a.popularityScore)
    }

    // Apply filters
    let filtered = sortedProducts
    if (activeFilter === "trending") {
      filtered = sortedProducts.filter(p => p.popularityScore > 20)
    } else if (activeFilter === "topRated") {
      filtered = sortedProducts.filter(p => p.reviewCount > 10)
    }

    return filtered.slice(0, 12)
  }, [productsData, sort, activeFilter])

  const buildUrl = (path) => {
    if (!path) return "/placeholder-product.png"
    if (path.startsWith("http")) return path
    if (path.startsWith("/")) return path
    return `${API_BASE}/${path.replace(/\\/g, "/")}`
  }

  const getPopularityBadge = (product) => {
    if (product.likesCount > 50) return { icon: Crown, color: "from-yellow-500 to-amber-500", text: "Legendary" }
    if (product.likesCount > 25) return { icon: Flame, color: "from-orange-500 to-red-500", text: "Hot" }
    if (product.likesCount > 10) return { icon: Zap, color: "from-purple-500 to-pink-500", text: "Popular" }
    return null
  }

  if (isLoading) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-r from-emerald-200/20 to-cyan-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="text-center mb-12 pt-8">
            <div className="h-12 w-64 bg-gray-200 rounded-2xl mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 w-48 bg-gray-200 rounded-2xl mx-auto mb-8 animate-pulse"></div>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 w-32 bg-gray-200 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Product Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="relative bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl animate-pulse">
                <div className="h-60 bg-gray-200 rounded-t-3xl"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded-2xl"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || recommendedProducts.length === 0) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-orange-50/20 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-rose-100/30 to-orange-100/30 rounded-full blur-3xl"></div>
        </div>
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl max-w-md border border-white/50"
        >
          <div className="w-20 h-20 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-rose-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Community Picks Coming Soon</h3>
          <p className="text-gray-600 mb-6">We're gathering the most loved products from our community. Check back later for amazing discoveries!</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-orange-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Browse Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Advanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-r from-emerald-200/20 to-cyan-200/20 rounded-full blur-3xl"
        />
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-300/30 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 30 - 15, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Enhanced Header Section */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12 pt-8"
        >
          {/* Premium Badge */}
          <motion.div
            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-2xl mb-6 shadow-lg"
          >
            <Crown className="w-5 h-5" />
            <span className="font-bold text-sm">COMMUNITY FAVORITES</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4 leading-tight"
          >
            Most Loved
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Products
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Discover what the community can't stop talking about. Handpicked based on real engagement and love.
          </motion.p>

          {/* Enhanced Filter Tabs */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 mb-8"
          >
            {[
              { id: "all", label: "All Products", icon: TrendingUp },
            //   { id: "trending", label: "Trending", icon: Flame },
            //   { id: "topRated", label: "Top Rated", icon: Star }
            ].map((filter) => {
              const Icon = filter.icon
              return (
                <motion.button
                  key={filter.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                    activeFilter === filter.id
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "bg-white/80 backdrop-blur-sm text-gray-700 border border-white/50 shadow-md hover:shadow-lg"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {filter.label}
                </motion.button>
              )
            })}

            {/* Sort Dropdown */}
            <motion.select
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-6 py-3 bg-white/80 backdrop-blur-sm border border-white/50 text-gray-700 rounded-2xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 appearance-none cursor-pointer"
            >
              <option value="likesDesc">Most Likes</option>
              <option value="reviewsDesc">Most Reviews</option>
              <option value="popularity">Popularity Score</option>
            </motion.select>
          </motion.div>
        </motion.div>

        {/* Revolutionary Product Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mb-16"
        >
          <AnimatePresence>
            {recommendedProducts.map((product, index) => {
              const badge = getPopularityBadge(product)
              const BadgeIcon = badge?.icon
              
              return (
                <motion.div
                  key={product._id}
                  initial={{ y: 60, opacity: 0, scale: 0.9 }}
                  animate={{ 
                    y: 0, 
                    opacity: 1, 
                    scale: 1,
                    transition: { 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 100,
                      damping: 15
                    }
                  }}
                  whileHover={{ 
                    y: -12,
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 400, damping: 25 }
                  }}
                  onHoverStart={() => setHoveredCard(index)}
                  onHoverEnd={() => setHoveredCard(null)}
                  className="relative group"
                >
                  {/* Main Card */}
                  <div className="relative bg-white/90 backdrop-blur-lg rounded-3xl border border-white/50 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden">
                    
                    {/* Premium Popularity Badge */}
                    {badge && (
                      <div className="absolute top-4 left-4 z-20">
                        <div className={`flex items-center gap-2 ${badge.color} text-white px-3 py-2 rounded-2xl text-xs font-black shadow-2xl`}>
                          {BadgeIcon && <BadgeIcon className="w-3 h-3 fill-current" />}
                          {badge.text}
                        </div>
                      </div>
                    )}

                    {/* Engagement Stats */}
                    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                      <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-2xl text-sm font-bold text-gray-800 shadow-lg">
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                        {product.likesCount}
                      </div>
                      {product.reviewCount > 0 && (
                        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-2xl text-sm font-bold text-gray-800 shadow-lg">
                          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                          {product.reviewCount}
                        </div>
                      )}
                    </div>

                    {/* Product Image with Advanced Effects */}
                    <div className="relative h-72 w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100/80">
                      <motion.div
                        whileHover={{ scale: 1.15 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="h-full w-full"
                      >
                        <Image
                          src={buildUrl(product.image)}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-700"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-product.png"
                          }}
                        />
                      </motion.div>
                      
                      {/* Multi-layer Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Advanced Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>

                    {/* Product Info */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="font-black text-gray-900 text-xl leading-tight line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300 mb-3">
                          {product.name}
                        </h3>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            ${product.price.toFixed(2)}
                          </p>
                          
                          {/* Engagement Indicator */}
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <TrendingUp className="w-4 h-4" />
                            <span>Score: {product.popularityScore}</span>
                          </div>
                        </div>
                      </div>

                      {/* Advanced CTA Button */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          href={`/products/${product.slug}`}
                          className="block w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all duration-300 text-center group/btn relative overflow-hidden"
                        >
                          {/* Button Effects */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                          
                          <span className="relative flex items-center justify-center gap-3">
                            Explore Now
                            <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                          </span>
                        </Link>
                      </motion.div>
                    </div>

                    {/* Hover Border Glow */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl" />
                  </div>

                  {/* Floating Hover Effects */}
                  <AnimatePresence>
                    {hoveredCard === index && (
                      <>
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute -top-3 -right-3 w-6 h-6 bg-blue-500 rounded-full blur-md"
                        />
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ delay: 0.1 }}
                          className="absolute -bottom-3 -left-3 w-4 h-4 bg-purple-500 rounded-full blur-md"
                        />
                      </>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>

       
      </div>
    </div>
  )
}