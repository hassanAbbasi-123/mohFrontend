'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGetApprovedProductsQuery } from '@/store/features/productApi';

export default function FeaturedProducts({ categoryId }) {
  const { data: products = [], isLoading } = useGetApprovedProductsQuery({
    category: categoryId,
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <section className="w-full bg-white py-10 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-2">
          <div>
            <h2 className="bg-gradient-to-r text-2xl from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Featured Products
            </h2>
            <p className="text-sm text-gray-500">
              Handpicked items just for you with zero commission for sellers
            </p>
          </div>
          <Link href="/shop/products" className="text-sm text-blue-600 hover:underline">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const imageUrl = product.image ? `${API_BASE}/${product.image.replace(/\\/g, '/')}` : '/default-product.jpg';
            return (
              <Link key={product._id} href={`/product/${product.slug}`}>
                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden border border-gray-100 flex flex-col cursor-pointer">
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    {product.coupons?.length > 0 && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        {product.coupons[0]?.discount || '-10%'}
                      </span>
                    )}
                    {product.isOnSale && (
                      <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                        On Sale
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {product.seller?.user?.name || 'Unknown Seller'}
                    </p>

                    <div className="mb-4">
                      <span className="text-lg font-bold text-green-600">{product.price} PKR</span>{' '}
                      {product.originalPrice && (
                        <span className="text-sm line-through text-gray-400">
                          {product.originalPrice} PKR
                        </span>
                      )}
                    </div>

                    <button className="bg-blue-600 hover:bg-blue-800 text-white text-sm py-2 rounded-md w-full transition">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}