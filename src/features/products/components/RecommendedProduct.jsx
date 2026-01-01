'use client'

import { useMemo, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useGetApprovedProductsQuery } from "@/store/features/productApi"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Sparkles, Heart, ArrowRight, TrendingUp, Flame } from "lucide-react"

export default function RecommendedProducts() {
  const { data: productsData, isLoading, error } = useGetApprovedProductsQuery({ limit: 100 })
  const [hoveredCard, setHoveredCard] = useState(null)

  const recommendedProducts = useMemo(() => {
    if (!productsData || !Array.isArray(productsData) || productsData.length === 0) return []

    const withCounts = productsData.map(p => ({
      ...p,
      likesCount: p.likes?.length || 0,
      engagementScore: (p.likes?.length || 0) * 2 + (p.reviewCount || 0) * 3
    }))

    const hasEngagement = withCounts.filter(p => p.engagementScore > 0)

    let selected
    if (hasEngagement.length > 0) {
      selected = [...hasEngagement]
        .sort((a, b) => b.engagementScore - a.engagementScore)
        .slice(0, 8)
    } else {
      selected = [...withCounts]
        .sort(() => Math.random() - 0.5)
        .slice(0, 8)
    }

    return selected
  }, [productsData])

  const buildUrl = (path) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    if (!path) return "/placeholder-product.png"
    if (path.startsWith("http")) return path
    if (path.startsWith("/")) return path
    return `${API_BASE}/${path.replace(/\\/g, "/")}`
  }

  if (isLoading) {
    return (
      <div className="w-full bg-gradient-to-r from-green-700 to-emerald-800 py-4 md:py-6 px-2 md:px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4 md:mb-6">
            <div className="h-3 md:h-4 w-32 md:w-48 bg-green-600/50 rounded-full mx-auto mb-2 animate-pulse"></div>
            <div className="h-2 md:h-3 w-48 md:w-64 bg-green-600/50 rounded-full mx-auto animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-4 gap-1 md:gap-3">
            {[...Array(8)].map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl border border-white/20 shadow-sm animate-pulse"
              >
                <div className="h-20 md:h-32 bg-green-600/30 rounded-t-lg md:rounded-t-xl"></div>
                <div className="p-1.5 md:p-3 space-y-1 md:space-y-2">
                  <div className="h-2 md:h-3 bg-green-600/30 rounded-full w-3/4"></div>
                  <div className="h-3 md:h-4 bg-green-600/30 rounded-full w-1/2"></div>
                  <div className="h-6 md:h-8 bg-green-600/30 rounded md:rounded-lg"></div>
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
      <div className="w-full bg-gradient-to-r from-green-700 to-emerald-800 py-8 md:py-12 px-2 md:px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-10 md:w-12 h-10 md:h-12 bg-white/20 rounded-lg md:rounded-xl mb-3 md:mb-4">
            <Sparkles className="w-5 md:w-6 h-5 md:h-6 text-white" />
          </div>
          <h3 className="text-base md:text-lg font-bold text-white mb-1 md:mb-2">
            Curating Recommendations
          </h3>
          <p className="text-green-100 max-w-xs md:max-w-md mx-auto text-xs md:text-sm">
            Preparing amazing products for you
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-gradient-to-r from-green-700 to-emerald-800 py-4 md:py-6 px-2 md:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-3 md:mb-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-2.5 md:px-4 py-1 md:py-1.5 rounded-full mb-2 md:mb-3">
            <Sparkles className="w-3 md:w-4 h-3 md:h-4" />
            <span className="text-xs md:text-sm font-bold">RECOMMENDED</span>
          </div>

          {/* Title */}
          <h2 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">
            Made For You
          </h2>
          
          {/* Description */}
          <p className="text-xs md:text-sm text-green-100 max-w-md mx-auto">
            Products loved by the community
          </p>

          {/* Explore All Button */}
          <div className="mt-2 md:mt-4">
            <Link
              href="/MostLikedProducts"
              className="group inline-flex items-center gap-1 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-3 md:px-5 py-1.5 md:py-2.5 rounded-lg md:rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:bg-white/20 text-xs md:text-sm"
            >
              <TrendingUp className="w-3 md:w-4 h-3 md:h-4" />
              Explore Trending
              <ArrowRight className="w-3 md:w-4 h-3 md:h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Products Grid - 4 columns on mobile */}
        <div className="grid grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-1.5 md:gap-3 lg:gap-4">
          <AnimatePresence>
            {recommendedProducts.map((product, index) => (
              <motion.div
                key={product.id || `product-${index}`}
                initial={{ y: 10, opacity: 0 }}
                animate={{ 
                  y: 0, 
                  opacity: 1,
                  transition: { delay: index * 0.05 }
                }}
                whileHover={{ 
                  y: -2,
                  transition: { type: "spring", stiffness: 400 }
                }}
                onHoverStart={() => setHoveredCard(index)}
                onHoverEnd={() => setHoveredCard(null)}
                className="relative group"
              >
                <div className="relative bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl border border-white/20 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full flex flex-col">
                  
                  {/* Popular Badge */}
                  {product.engagementScore > 10 && (
                    <div className="absolute top-1 left-1 z-20">
                      <div className="flex items-center bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
                        <Flame className="w-2.5 h-2.5 fill-current" />
                      </div>
                    </div>
                  )}

                  {/* Engagement Metrics */}
                  <div className="absolute top-1 right-1 z-20 flex items-center gap-0.5">
                    {product.likesCount > 0 && (
                      <div className="flex items-center bg-white/20 backdrop-blur-sm px-1 py-0.5 rounded-full text-[10px] font-medium text-white">
                        <Heart className="w-2.5 h-2.5 fill-white text-white" />
                        <span className="ml-0.5">{product.likesCount}</span>
                      </div>
                    )}
                  </div>

                  {/* Product Image */}
                  <Link href={`/product/${product.slug}`} className="block flex-shrink-0">
                    <div className="relative h-20 md:h-32 lg:h-40 w-full overflow-hidden bg-white/10">
                      <Image
                        src={buildUrl(product.image)}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 25vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-1.5 md:p-3 flex-1 flex flex-col">
                    <div className="flex-1 mb-1.5 md:mb-3">
                      <Link href={`/product/${product.slug}`}>
                        <h3 className="font-semibold text-white text-xs md:text-sm leading-tight line-clamp-2 mb-0.5 md:mb-1 hover:text-yellow-300 transition-colors duration-300">
                          {product.name}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm md:text-base font-bold text-yellow-300">
                          ${product.price.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Discover Button */}
                    <div className="mt-auto">
                      <Link
                        href={`/product/${product.slug}`}
                        className="block w-full py-1 md:py-2 px-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded md:rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-300 text-center text-xs md:text-sm"
                      >
                        <span className="flex items-center justify-center gap-0.5">
                          View
                          <ArrowRight className="w-2.5 md:w-3 h-2.5 md:h-3 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-4 md:mt-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 border border-white/20 shadow-md max-w-md mx-auto">
            <h3 className="text-sm md:text-base font-bold text-white mb-1 md:mb-2">
              Need More Options?
            </h3>
            <p className="text-green-100 mb-2 md:mb-3 text-xs md:text-sm">
              Explore our full collection
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 text-xs md:text-sm"
            >
              <Sparkles className="w-3 md:w-4 h-3 md:h-4" />
              Browse All
              <ArrowRight className="w-3 md:w-4 h-3 md:h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}