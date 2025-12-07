'use client';

import { useState } from 'react';
import { Star, Heart, Truck, Shield, RotateCcw, ShoppingCart, Plus, Minus, Check, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetail({ product }) {
  // Fallback for when product is undefined or null
  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Product Not Found</h2>
          <p className="text-blue-600">The product you're looking for is not available.</p>
          <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product?.attributes?.color || null);
  const [selectedSize, setSelectedSize] = useState(product?.attributes?.sizes?.[0] || null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Combine product.image and gallery for images with fallback
  const images = product?.gallery?.length > 0 
    ? [product.image || 'https://via.placeholder.com/300?text=Default+Product', ...product.gallery] 
    : [product?.image || 'https://via.placeholder.com/300?text=Default+Product'];

  const fixedImages = images.map(img => img.startsWith('/') ? img : `${API_BASE}/${img.replace(/\\/g, '/').replace(/^product\//, '')}`);

  const isVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url);

  const renderMedia = (url, className, alt, isThumbnail = false) => {
    if (isVideo(url)) {
      return (
        <video
          src={url}
          className={className}
          alt={alt}
          autoPlay={!isThumbnail}
          loop={!isThumbnail}
          muted
          playsInline
          controls={!isThumbnail}
        />
      );
    } else {
      return <img src={url} className={className} alt={alt} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 pt-16">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="text-sm text-blue-600">
            Home / {product?.brand?.name || 'Products'} / {product?.name || 'Product'}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
              <div className="relative aspect-square mb-4">
                {renderMedia(fixedImages[selectedImage], "w-full h-full object-contain rounded-xl", product?.name || 'Product Image')}
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white p-3 rounded-xl shadow-md transition-all hover:scale-110"
                >
                  <Heart
                    size={20}
                    fill={isWishlisted ? '#ef4444' : 'none'}
                    className={isWishlisted ? 'text-red-500' : 'text-blue-600'}
                  />
                </button>
                {product?.coupons?.length > 0 && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl">
                    {product.coupons[0]?.discount || '-10%'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-3">
                {fixedImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square border-2 rounded-lg overflow-hidden transition-all ${
                      selectedImage === index ? 'border-blue-600 scale-105' : 'border-gray-200'
                    }`}
                  >
                    {renderMedia(image, "w-full h-full object-cover", `Thumbnail ${index + 1}`, true)}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
                <Truck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-900">Free Delivery</p>
                <p className="text-xs text-blue-600">Across Pakistan</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
                <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-900">Warranty</p>
                <p className="text-xs text-blue-600">{product?.warranty || '1 Year'}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
                <RotateCcw className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-900">7 Days Return</p>
                <p className="text-xs text-blue-600">Easy Returns</p>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
              <h1 className="text-2xl font-bold text-blue-900 mb-2">{product?.name || 'Product Name'}</h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < Math.floor(product?.rating || 0) ? '#f59e0b' : 'none'}
                      className={i < Math.floor(product?.rating || 0) ? 'text-amber-400' : 'text-gray-300'}
                    />
                  ))}
                  <span className="text-sm text-blue-600 ml-2">({product?.reviewCount || 0} reviews)</span>
                </div>
                <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  {product?.sold || 0} sold
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-bold text-blue-900">{product?.price || '0'} PKR</span>
                  {product?.originalPrice && (
                    <span className="text-lg line-through text-gray-400">{product?.originalPrice} PKR</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">Inclusive of all taxes</p>
              </div>

              {/* Color Selection */}
              {product?.attributes?.color && (
                <div className="mb-6">
                  <h3 className="font-semibold text-blue-900 mb-3">Color:</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedColor(product.attributes.color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === product.attributes.color ? 'border-blue-600 scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: product.attributes.color }}
                    >
                      {selectedColor === product.attributes.color && (
                        <Check className="w-5 h-5 text-white mx-auto" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product?.attributes?.sizes?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-blue-900 mb-3">Size:</h3>
                  <div className="flex gap-3">
                    {product.attributes.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                          selectedSize === size ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-300 text-gray-600'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selection */}
              <div className="mb-6">
                <h3 className="font-semibold text-blue-900 mb-3">Quantity:</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-blue-200 flex items-center justify-center text-blue-600 hover:bg-blue-50"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg border border-blue-200 flex items-center justify-center text-blue-600 hover:bg-blue-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <button className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
                <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg">
                  Buy Now
                </button>
              </div>
            </div>

            {/* Seller Info */}
            <Link href={`/seller/${product?.seller?._id || 'unknown'}`}>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="font-semibold text-blue-600">
                        {product?.seller?.user?.name?.charAt(0) || 'S'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">{product?.seller?.user?.name || 'Unknown Seller'}</p>
                      <p className="text-sm text-blue-600">98% Positive Seller Rating</p>
                    </div>
                  </div>
                  <ChevronRight className="text-blue-600" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Product Description & Specifications */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 mb-12">
          <h2 className="text-xl font-bold text-blue-900 mb-6">Product Details</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-blue-900 mb-4">Description</h3>
              <p className="text-blue-700 mb-6">{product?.description || 'No description available'}</p>

              {product?.features?.length > 0 && (
                <>
                  <h4 className="font-semibold text-blue-900 mb-3">Key Features:</h4>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-blue-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {product?.attributes && (
              <div>
                <h3 className="font-semibold text-blue-900 mb-4">Specifications</h3>
                <div className="space-y-3">
                  {Object.entries(product.attributes).map(([key, value]) => (
                    <div key={key} className="flex border-b border-blue-100 pb-2">
                      <span className="w-1/3 text-blue-600 font-medium">{key}</span>
                      <span className="w-2/3 text-blue-900">{Array.isArray(value) ? value.join(', ') : value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}