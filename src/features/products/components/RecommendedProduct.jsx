'use client'
import { useMemo, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useGetApprovedProductsQuery } from "@/store/features/productApi"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Sparkles, Heart, Zap, ArrowRight, TrendingUp, Flame } from "lucide-react"

export default function RecommendedProducts() {
  const { data: productsData, isLoading, error } = useGetApprovedProductsQuery({ limit: 100 })
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredCard, setHoveredCard] = useState(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const recommendedProducts = useMemo(() => {
    let products = []
    if (productsData) {
      if (Array.isArray(productsData)) {
        products = productsData
      } else if (productsData.products && Array.isArray(productsData.products)) {
        products = productsData.products
      }
    }
    if (products.length === 0) return []

    const withCounts = products.map(p => ({
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
      <div className="relative min-h-[400px] xs:min-h-[500px] sm:min-h-[600px] w-full overflow-hidden bg-gradient-to-r from-green-700 to-emerald-800 py-8 xs:py-12 sm:py-16 px-2 xs:px-3 sm:px-4">
        <div className="max-w-7xl mx-auto">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-32 xs:-top-40 -right-24 xs:-right-32 w-64 xs:w-80 h-64 xs:h-80 bg-green-600/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-32 xs:-bottom-40 -left-24 xs:-left-32 w-64 xs:w-80 h-64 xs:h-80 bg-emerald-600/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative">
            <div className="mb-8 xs:mb-10 sm:mb-12 text-center">
              <div className="h-6 xs:h-8 w-40 xs:w-48 sm:w-64 bg-green-600/50 rounded-full mx-auto mb-3 xs:mb-4 animate-pulse"></div>
              <div className="h-3 xs:h-4 w-32 xs:w-40 sm:w-48 bg-green-600/50 rounded-full mx-auto animate-pulse"></div>
            </div>
            
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="relative bg-white/10 backdrop-blur-sm rounded-xl xs:rounded-2xl sm:rounded-3xl border border-white/20 shadow-lg xs:shadow-xl hover:shadow-xl xs:hover:shadow-2xl transition-all duration-500 animate-pulse"
                >
                  <div className="h-32 xs:h-40 sm:h-60 bg-green-600/30 rounded-t-xl xs:rounded-t-2xl sm:rounded-t-3xl"></div>
                  <div className="p-2 xs:p-4 sm:p-6 space-y-2 xs:space-y-3 sm:space-y-4">
                    <div className="h-3 xs:h-4 bg-green-600/30 rounded-full w-3/4"></div>
                    <div className="h-4 xs:h-6 bg-green-600/30 rounded-full w-1/2"></div>
                    <div className="h-6 xs:h-8 sm:h-10 bg-green-600/30 rounded-xl xs:rounded-2xl"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || recommendedProducts.length === 0) {
    return (
      <div className="relative min-h-[300px] xs:min-h-[400px] w-full overflow-hidden bg-gradient-to-r from-green-700 to-emerald-800 py-8 xs:py-12 sm:py-16 px-2 xs:px-3 sm:px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 xs:w-80 sm:w-96 h-64 xs:h-80 sm:h-96 bg-green-600/20 rounded-full blur-3xl"></div>
          </div>
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative px-3 xs:px-4"
          >
            <div className="inline-flex items-center justify-center w-12 xs:w-16 sm:w-20 h-12 xs:h-16 sm:h-20 bg-white/20 rounded-xl xs:rounded-2xl mb-4 xs:mb-6">
              <Sparkles className="w-6 xs:w-8 sm:w-10 h-6 xs:h-8 sm:h-10 text-white" />
            </div>
            <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-white mb-2 xs:mb-3">
              Curating Your Recommendations
            </h3>
            <p className="text-green-100 max-w-xs xs:max-w-md mx-auto text-xs xs:text-sm sm:text-base">
              We're preparing some amazing products just for you. Check back soon for personalized recommendations!
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-[80vh] xs:min-h-screen w-full overflow-hidden bg-gradient-to-r from-green-700 to-emerald-800 py-8 xs:py-10 sm:py-12 px-2 xs:px-3 sm:px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          key="background-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute -top-32 xs:-top-40 -right-24 xs:-right-32 w-48 xs:w-64 sm:w-80 h-48 xs:h-64 sm:h-80 bg-green-600/20 rounded-full blur-3xl"
        />
        <motion.div
          key="background-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute -bottom-32 xs:-bottom-40 -left-24 xs:-left-32 w-48 xs:w-64 sm:w-80 h-48 xs:h-64 sm:h-80 bg-emerald-600/20 rounded-full blur-3xl"
        />

        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 xs:w-1.5 sm:w-2 h-1 xs:h-1.5 sm:h-2 bg-green-300/30 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 xs:mb-12 sm:mb-16 px-1 xs:px-2"
        >
          {/* Header badge */}
          <motion.div 
            initial={{ y: -8, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1.5 rounded-full mb-2 xs:mb-3"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-bold">RECOMMENDED</span>
          </motion.div>

          <motion.h2 
            initial={{ y: 8, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.2 }} 
            className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 xs:mb-3 sm:mb-4"
          >
            Made Just For You
          </motion.h2>
          
          <motion.p 
            initial={{ y: 8, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.35 }} 
            className="text-sm xs:text-base sm:text-lg text-green-100 max-w-xl xs:max-w-2xl mx-auto leading-relaxed px-1"
          >
            Discover products loved by the community and perfectly matched to your style
          </motion.p>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ delay: 0.45 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 xs:mt-6 sm:mt-8"
          >
            <Link
              href="/MostLikedProducts"
              className="group inline-flex items-center gap-1 xs:gap-2 sm:gap-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 xs:px-6 sm:px-8 py-2 xs:py-3 sm:py-4 rounded-xl xs:rounded-2xl font-semibold shadow-md xs:shadow-lg hover:shadow-lg xs:hover:shadow-xl transition-all duration-300 hover:bg-white/20 text-xs xs:text-sm sm:text-base"
            >
              <TrendingUp className="w-3.5 xs:w-4 sm:w-5 h-3.5 xs:h-4 sm:h-5" />
              Explore All Trending
              <ArrowRight className="w-3.5 xs:w-4 sm:w-5 h-3.5 xs:h-4 sm:h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>

        <div className="overflow-x-auto pb-3 xs:pb-4 scrollbar-hide snap-x snap-mandatory">
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-2 xs:gap-3 sm:gap-6 md:gap-8 min-w-max md:min-w-0">
            <AnimatePresence>
              {recommendedProducts.map((product, index) => (
                <motion.div
                  key={product.id || `product-${index}`}
                  initial={{ y: 50, opacity: 0, scale: 0.9 }}
                  animate={{ 
                    y: 0, 
                    opacity: 1, 
                    scale: 1,
                    transition: { delay: index * 0.1, type: "spring", stiffness: 100 }
                  }}
                  whileHover={{ 
                    y: -8,
                    transition: { type: "spring", stiffness: 400, damping: 25 }
                  }}
                  onHoverStart={() => setHoveredCard(index)}
                  onHoverEnd={() => setHoveredCard(null)}
                  className="relative group flex-shrink-0 w-[140px] xs:w-[160px] sm:w-auto snap-start"
                >
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-xl xs:rounded-2xl sm:rounded-3xl border border-white/20 shadow-lg xs:shadow-xl hover:shadow-xl xs:hover:shadow-2xl transition-all duration-500 overflow-hidden">
                    
                    {/* Popular badge */}
                    {product.engagementScore > 10 && (
                      <div className="absolute top-2 xs:top-3 sm:top-4 left-2 xs:left-3 sm:left-4 z-20">
                        <div className="flex items-center gap-0.5 xs:gap-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-1.5 xs:px-2 sm:px-3 py-0.5 xs:py-1 sm:py-1.5 rounded-full text-[9px] xs:text-[10px] sm:text-xs font-bold shadow-md xs:shadow-lg">
                          <Flame className="w-2.5 xs:w-3 h-2.5 xs:h-3 fill-current" />
                          Popular
                        </div>
                      </div>
                    )}

                    {/* Engagement metrics */}
                    <div className="absolute top-2 xs:top-3 sm:top-4 right-2 xs:right-3 sm:right-4 z-20 flex items-center gap-1 xs:gap-2 sm:gap-3">
                      {(product.likesCount > 0 || product.reviewCount > 0) && (
                        <>
                          {product.likesCount > 0 && (
                            <div className="flex items-center gap-0.5 xs:gap-1 bg-white/20 backdrop-blur-sm px-1.5 xs:px-2 py-0.5 rounded-full text-[9px] xs:text-[10px] sm:text-xs font-medium text-white shadow-sm xs:shadow-md">
                              <Heart className="w-2.5 xs:w-3 h-2.5 xs:h-3 fill-white text-white" />
                              {product.likesCount}
                            </div>
                          )}
                          {product.reviewCount > 0 && (
                            <div className="flex items-center gap-0.5 xs:gap-1 bg-white/20 backdrop-blur-sm px-1.5 xs:px-2 py-0.5 rounded-full text-[9px] xs:text-[10px] sm:text-xs font-medium text-white shadow-sm xs:shadow-md">
                              <Star className="w-2.5 xs:w-3 h-2.5 xs:h-3 fill-yellow-400 text-yellow-400" />
                              {product.reviewCount}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Product image */}
                    <div className="relative h-32 xs:h-44 sm:h-60 w-full overflow-hidden bg-white/10">
                      <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                        <Image
                          src={buildUrl(product.image)}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-700"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      </motion.div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Product info */}
                    <div className="p-2 xs:p-4 sm:p-6 space-y-2 xs:space-y-3 sm:space-y-4">
                      <div>
                        <h3 className="font-bold text-white text-xs xs:text-sm sm:text-lg leading-tight line-clamp-2 group-hover:text-yellow-300 transition-colors duration-300 mb-1 xs:mb-1.5 sm:mb-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <p className="text-base xs:text-lg sm:text-2xl font-bold text-yellow-300">
                            ${product.price.toFixed(2)}
                          </p>
                          {product.engagementScore > 15 && (
                            <div className="flex items-center gap-0.5 xs:gap-0.5 sm:gap-1">
                              {[...Array(3)].map((_, i) => (
                                <Star key={`star-${product.id}-${i}`} className="w-2.5 xs:w-3 sm:w-4 h-2.5 xs:h-3 sm:h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Discover button */}
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link
                          href={`/products/${product.slug}`}
                          className="block w-full py-2 xs:py-2.5 sm:py-3.5 px-3 xs:px-5 sm:px-6 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-lg xs:rounded-xl font-semibold shadow-md xs:shadow-lg hover:shadow-lg xs:hover:shadow-xl transition-all duration-300 text-center group/btn relative overflow-hidden text-xs xs:text-sm sm:text-base"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                          <span className="relative flex items-center justify-center gap-1 xs:gap-1 sm:gap-2">
                            Discover More
                            <ArrowRight className="w-3.5 xs:w-4 h-3.5 xs:h-4 transition-transform group-hover/btn:translate-x-1" />
                          </span>
                        </Link>
                      </motion.div>
                    </div>

                    {/* Hover glow effect */}
                    <div className="absolute inset-0 rounded-xl xs:rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-md" />
                  </div>

                  {/* Floating hover effects */}
                  <AnimatePresence>
                    {hoveredCard === index && (
                      <>
                        <motion.div
                          key={`float-top-${product.id}`}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute -top-0.5 xs:-top-1 sm:-top-2 -right-0.5 xs:-right-1 sm:-right-2 w-3 xs:w-4 sm:w-6 h-3 xs:h-4 sm:h-6 bg-yellow-400/50 rounded-full blur-sm"
                        />
                        <motion.div
                          key={`float-bottom-${product.id}`}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ delay: 0.1 }}
                          className="absolute -bottom-0.5 xs:-bottom-1 sm:-bottom-2 -left-0.5 xs:-left-1 sm:-left-2 w-2.5 xs:w-3 sm:w-4 h-2.5 xs:h-3 sm:h-4 bg-amber-400/50 rounded-full blur-sm"
                        />
                      </>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom CTA section */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 xs:mt-12 sm:mt-16 px-1 xs:px-2"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-lg xs:rounded-xl sm:rounded-2xl p-4 xs:p-6 sm:p-8 border border-white/20 shadow-md xs:shadow-lg max-w-xs xs:max-w-md sm:max-w-2xl mx-auto">
            <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-white mb-1 xs:mb-2 sm:mb-3">
              Can't Find What You're Looking For?
            </h3>
            <p className="text-green-100 mb-3 xs:mb-4 sm:mb-6 text-xs xs:text-sm sm:text-base">
              Explore our entire collection of handpicked products
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/products"
                className="inline-flex items-center gap-1 xs:gap-2 sm:gap-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 xs:px-6 sm:px-8 py-2 xs:py-3 sm:py-4 rounded-lg xs:rounded-xl sm:rounded-2xl font-semibold shadow-md xs:shadow-lg hover:shadow-lg xs:hover:shadow-xl transition-all duration-300 text-xs xs:text-sm sm:text-base"
              >
                <Sparkles className="w-3.5 xs:w-4 sm:w-5 h-3.5 xs:h-4 sm:h-5" />
                Browse Full Collection
                <ArrowRight className="w-3.5 xs:w-4 sm:w-5 h-3.5 xs:h-4 sm:h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}