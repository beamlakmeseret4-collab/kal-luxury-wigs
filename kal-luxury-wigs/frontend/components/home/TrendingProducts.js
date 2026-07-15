'use client';

import Link from 'next/link';
import { useFeaturedProducts } from '@/lib/hooks';
import ProductGrid from '@/components/product/ProductGrid';
import { PageSpinner } from '@/components/ui/Feedback';
import Button from '@/components/ui/Button';

export default function TrendingProducts() {
  const { data, isLoading } = useFeaturedProducts();

  return (
    <section className="border-t border-ink/5 bg-white py-16 sm:py-20">
      <div className="container-kal">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold-dark">Loved Right Now</p>
            <h2 className="mt-2 font-display text-2xl text-charcoal sm:text-3xl">Trending Wigs</h2>
          </div>
          <Button href="/shop" variant="ghost" size="sm" className="hidden sm:inline-flex">
            View All →
          </Button>
        </div>

        {isLoading ? (
          <PageSpinner label="Loading trending wigs…" />
        ) : (
          <ProductGrid products={data?.trending?.length ? data.trending : data?.featured} />
        )}

        <div className="mt-8 text-center sm:hidden">
          <Button href="/shop" variant="outline">View All Wigs</Button>
        </div>
      </div>
    </section>
  );
}
