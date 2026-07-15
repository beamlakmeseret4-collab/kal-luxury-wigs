'use client';

import ProductCard from './ProductCard';
import { EmptyState } from '@/components/ui/Feedback';
import { Spinner } from '@/components/ui/Feedback';

export default function ProductGrid({ products, isLoading, columns = 4 }) {
  const colClass = {
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  }[columns] || 'sm:grid-cols-2 lg:grid-cols-4';

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        title="No wigs match those filters"
        description="Try widening your search or clearing a filter."
      />
    );
  }

  return (
    <div className={`grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 ${colClass}`}>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
