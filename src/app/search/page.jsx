// Updated src/app/search/page.jsx
import { Suspense } from 'react';
import SearchResultsPage from './SearchResultsPage';

export default function Search() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading search results...</p>
        </div>
      </div>
    }>
      <SearchResultsPage />
    </Suspense>
  );
}