"use client";

import { Flame, ArrowRight, ShoppingCart } from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import Link from "next/link";
import { useGetApprovedProductsQuery } from "@/store/features/productApi";

export default function HotSales() {
  const { toast } = useToast();
  const [cart, setCart] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Fetch only approved products that are marked as on sale
  const { data: productsData, isLoading, error } = useGetApprovedProductsQuery({
    isOnSale: true,
  });

  // Prepare hot sale products with robust discount logic
  const hotSaleProducts = useMemo(() => {
    if (!productsData || !Array.isArray(productsData)) return [];

    const shuffled = [...productsData].sort(() => Math.random() - 0.5);

    return shuffled.slice(0, 4).map((product) => {
      const originalPrice = Number(product.price ?? 0);
      const rawDiscount = Number(product.discount ?? 0);

      let salePrice = originalPrice;
      let discountPercentage = 0;

      if (rawDiscount > 0) {
        // Case A: discount value looks like a percentage (1 - 100)
        if (rawDiscount > 0 && rawDiscount <= 100) {
          discountPercentage = rawDiscount;
          salePrice = originalPrice - (originalPrice * discountPercentage) / 100;
        } else {
          // Case B: discount value > 100 -> likely an absolute currency discount (e.g. 10000 => Rs 10,000 off)
          // If rawDiscount <= originalPrice, treat it as absolute amount
          if (rawDiscount <= originalPrice) {
            const absoluteDiscount = rawDiscount;
            salePrice = Math.max(0, originalPrice - absoluteDiscount);
            discountPercentage = Math.round(
              (absoluteDiscount / (originalPrice || 1)) * 100
            );
          } else {
            // Case C: discount is larger than price (nonsensical) -> clamp to free
            salePrice = 0;
            discountPercentage = 100;
          }
        }
      }

      // Safety clamps
      if (!Number.isFinite(salePrice) || salePrice < 0) salePrice = 0;
      // Ensure sale price never exceeds original price
      if (salePrice > originalPrice) {
        salePrice = originalPrice;
        discountPercentage = 0;
      }
      // Ensure discountPercentage is between 0 and 100
      if (!Number.isFinite(discountPercentage) || discountPercentage < 0)
        discountPercentage = 0;
      if (discountPercentage > 100) discountPercentage = 100;

      return {
        id: product._id,
        title: product.name,
        Image: product.image,
        originalPrice,
        salePrice,
        discountPercentage,
        saveAmount: Math.max(0, originalPrice - salePrice),
      };
    });
  }, [productsData]);

  // Add to Cart Handler (local demo; integrate with your cart API/store as needed)
  const handleAddToCart = (product) => {
    setCart((prev) => [...prev, product]);
    toast({
      title: "🔥 Added to Cart!",
      description: `${product.title} has been added to your cart.`,
    });
  };

  const handleViewAllSales = () => {
    // Redirect handled by Link component
  };

  // Build image URL
  const buildUrl = (path) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    if (!path) return "/placeholder-product.png";
    if (path.startsWith("http")) return path;
    if (path.startsWith("/")) return path;
    return `${API_BASE}/${path.replace(/\\/g, "/")}`;
  };

  // Format currency with proper spacing
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-bounce delay-100"></div>
            <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-bounce delay-200"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium mt-4">
            Loading hot sales...
          </p>
        </div>
      </section>
    );
  }

  if (error || hotSaleProducts.length === 0) {
    return (
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
            <Flame className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg font-medium">
            No hot sale products available.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-16 flex-wrap gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-md opacity-30 animate-pulse"></div>
                <Flame className="relative w-12 h-12 text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text animate-pulse" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ml-3">
                HOT SALES
              </h2>
            </div>
            <p className="text-xl md:text-2xl text-gray-700 font-light max-w-2xl">
              Limited-time offers at{" "}
              <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                unbeatable prices
              </span>
            </p>
          </div>

          {/* View All Button */}
          <Link
            href="/hotsales"
            onClick={handleViewAllSales}
            className="hidden md:flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white font-bold shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-500 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="relative z-10">View All Sales</span>
            <ArrowRight className="w-5 h-5 relative z-10 transform group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {hotSaleProducts.map((product, index) => (
            <div
              key={product.id}
              className="relative group"
              onMouseEnter={() => setHoveredCard(product.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Card Container */}
              <div className="relative rounded-3xl overflow-hidden bg-white shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-3 border border-gray-100">
                
                {/* Animated Gradient Border */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                <div className="absolute inset-[2px] bg-white rounded-3xl z-0"></div>

                {/* Discount Badge (only if discount > 0) */}
                {product.discountPercentage > 0 && (
                  <div className="absolute top-5 left-5 z-20">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-sm animate-pulse"></div>
                      <div className="relative bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-black flex items-center gap-2 shadow-2xl">
                        <Flame className="w-4 h-4" />
                        -{product.discountPercentage}% OFF
                      </div>
                    </div>
                  </div>
                )}

                {/* Hot Ribbon for First Product */}
                {index === 0 && (
                  <div className="absolute top-5 right-5 z-20">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-2xl rotate-3 animate-pulse">
                      🔥 HOTTEST DEAL
                    </div>
                  </div>
                )}

                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden z-10">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/10 z-10"></div>
                  <Image
                    src={buildUrl(product.Image)}
                    alt={product.title}
                    fill
                    className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    priority={index === 0}
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder-product.png";
                    }}
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20"></div>
                </div>

                {/* Product Details */}
                <div className="relative p-6 z-10 bg-white">
                  
                  {/* Product Title */}
                  <h3 className="font-bold text-xl mb-4 text-gray-900 group-hover:text-gray-800 transition-colors duration-300 line-clamp-2 min-h-[3rem] leading-tight">
                    {product.title}
                  </h3>

                  {/* Price Section - Improved Layout */}
                  <div className="space-y-3 mb-6">
                    {/* Main Price Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          Rs {formatCurrency(product.salePrice)}
                        </span>

                        {product.discountPercentage > 0 && (
                          <span className="text-lg line-through text-gray-400 font-medium">
                            Rs {formatCurrency(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* You Save Section - Improved Layout */}
                    {product.discountPercentage > 0 && (
                      <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-3 border border-green-100">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                            You Save
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-black text-green-600 leading-tight">
                            Rs {formatCurrency(product.saveAmount)}
                          </div>
                          <div className="text-xs font-semibold text-green-500">
                            ({product.discountPercentage}% OFF)
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-500 group/btn relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 flex items-center justify-center gap-3">
                      <ShoppingCart className="w-5 h-5" />
                      <span className="font-bold">Add to Cart</span>
                    </div>
                    
                    {/* Button Shine Effect */}
                    <div className="absolute inset-0 -left-full group-hover/btn:left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-1000"></div>
                  </button>

                  {/* Limited Time Badge */}
                  {product.discountPercentage > 0 && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        ⏰ Limited Time
                      </div>
                    </div>
                  )}
                </div>

                {/* Floating Particles Effect */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                  {[1, 2, 3].map((particle) => (
                    <div
                      key={particle}
                      className={`absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ${
                        particle === 1 ? "top-4 right-4" :
                        particle === 2 ? "bottom-4 left-4" :
                        "top-1/2 left-1/2"
                      }`}
                      style={{
                        animation: `float${particle} 3s ease-in-out infinite`
                      }}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Glow Effect Behind Card */}
              <div className={`absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-3xl blur-xl transition-all duration-700 -z-10 ${
                hoveredCard === product.id ? 'opacity-100 scale-105' : 'opacity-0 scale-95'
              }`}></div>
            </div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="md:hidden text-center">
          <Link
            href="/hotsales"
            onClick={handleViewAllSales}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white font-bold shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-500 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="relative z-10">View All Sales</span>
            <ArrowRight className="w-5 h-5 relative z-10 transform group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-5px, -5px) scale(1.2); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(5px, 5px) scale(1.1); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(3px, -3px) scale(1.3); }
        }
      `}</style>
    </section>
  );
}