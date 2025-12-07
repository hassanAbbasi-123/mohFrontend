'use client';
import { Suspense } from 'react';
import ProductPageClient from '@/app/user/search/ProductsPageClient';

export default function ProductsPage({ searchParams }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductPageClient initialSearchParams={searchParams} />
    </Suspense>
  );
}