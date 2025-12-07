'use client';

import { use } from 'react';
import ProductDetail from '@/app/(electronics)/components/ProductDetails';
import { useGetProductBySlugQuery } from '@/store/features/productApi';

export default function ProductPage({ params }) {
  const { slug } = use(params); // Unwrap params Promise using React.use()
  const { data: product, isLoading, error } = useGetProductBySlugQuery(slug);

  if (isLoading) {
    return <div className="p-10 text-center text-gray-600">Loading...</div>;
  }

  if (error || !product) {
    return <div className="p-10 text-center text-gray-600">Product not found</div>;
  }

  return <ProductDetail product={product} />;
}