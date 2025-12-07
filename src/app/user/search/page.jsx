'use client';
import { Suspense } from 'react';
import ProductsPageClient from '@/app/user/search/ProductsPageClient';

export default function ProductsPage({ searchParams }) {
  // Ensure searchParams is always an object with default values
  const safeSearchParams = {
    query: searchParams?.query || '',
    category: searchParams?.category || null,
    sort: searchParams?.sort || 'name',
    minPrice: parseInt(searchParams?.minPrice) || 0,
    maxPrice: parseInt(searchParams?.maxPrice) || 500000,
    view: searchParams?.view || 'grid',
    page: parseInt(searchParams?.page) || 1,
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsPageClient searchParams={safeSearchParams} />
    </Suspense>
  );
}