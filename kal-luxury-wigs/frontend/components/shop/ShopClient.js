'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import FiltersSidebar from './FiltersSidebar';
import ProductGrid from '@/components/product/ProductGrid';
import { PageSpinner } from '@/components/ui/Feedback';
import Button from '@/components/ui/Button';
import { useProducts } from '@/lib/hooks';

const sortOptions = [
  { value: '', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Reviewed' },
];

export default function ShopClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filters = Object.fromEntries(searchParams.entries());
  const { data, isLoading } = useProducts(filters);

  const updateFilters = useCallback(
    (next) => {
      const params = new URLSearchParams();
      Object.entries(next).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') params.set(k, v);
      });
      router.push(`/shop${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
    },
    [router]
  );

  return (
    <div className="container-kal py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-gold-dark">The Full Collection</p>
        <h1 className="mt-2 font-display text-3xl text-charcoal">
          {filters.q ? `Results for “${filters.q}”` : 'Shop All Wigs'}
        </h1>
        {typeof data?.total === 'number' && (
          <p className="mt-1 text-sm text-charcoal/50">{data.total} wigs found</p>
        )}
      </div>

      <div className="flex items-center justify-between border-b border-ink/10 pb-4 lg:hidden">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2 text-sm font-medium text-charcoal"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
        <SortSelect value={filters.sort || ''} onChange={(v) => updateFilters({ ...filters, sort: v || undefined })} />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr]">
        <FiltersSidebar filters={filters} onChange={updateFilters} onClear={() => updateFilters({})} className="hidden lg:block" />

        <div>
          <div className="mb-6 hidden items-center justify-between lg:flex">
            <p className="text-sm text-charcoal/50">{data?.total ?? '—'} results</p>
            <SortSelect value={filters.sort || ''} onChange={(v) => updateFilters({ ...filters, sort: v || undefined })} />
          </div>

          {isLoading ? <PageSpinner label="Finding your perfect wig…" /> : <ProductGrid products={data?.products} />}

          {data?.pages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              {Array.from({ length: data.pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => updateFilters({ ...filters, page: i + 1 })}
                  className={`h-9 w-9 rounded-full text-sm ${
                    Number(filters.page || 1) === i + 1 ? 'bg-ink text-cream' : 'text-charcoal/60 hover:bg-ink/5'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div className="absolute inset-0 bg-ink/60" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-full max-w-xs overflow-y-auto bg-cream p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <FiltersSidebar
              filters={filters}
              onChange={(next) => { updateFilters(next); }}
              onClear={() => { updateFilters({}); setMobileFiltersOpen(false); }}
            />
            <Button fullWidth variant="gold" className="mt-6" onClick={() => setMobileFiltersOpen(false)}>
              Show Results
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SortSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-full border border-ink/15 bg-white px-4 py-2 text-sm outline-none focus:border-gold"
    >
      {sortOptions.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
