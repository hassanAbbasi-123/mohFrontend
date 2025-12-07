'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProductsPageClient from './ProductsPageClient';

export default function ProductsPageWrapper({ initialSearchParams }) {
  const searchParams = useSearchParams();
  const [mergedParams, setMergedParams] = useState(initialSearchParams || {});

  useEffect(() => {
    // Only merge params on the client after the component mounts
    if (searchParams) {
      setMergedParams({
        query: searchParams.get('query') || initialSearchParams?.query || '',
        category: searchParams.get('category') || initialSearchParams?.category || null,
        sort: searchParams.get('sort') || initialSearchParams?.sort || 'name',
        minPrice: parseInt(searchParams.get('minPrice')) || initialSearchParams?.minPrice || 0,
        maxPrice: parseInt(searchParams.get('maxPrice')) || initialSearchParams?.maxPrice || 500000,
        view: searchParams.get('view') || initialSearchParams?.view || 'grid',
        page: parseInt(searchParams.get('page')) || initialSearchParams?.page || 1,
      });
    }
  }, [searchParams, initialSearchParams]);

  return <ProductsPageClient searchParams={mergedParams} />;
}