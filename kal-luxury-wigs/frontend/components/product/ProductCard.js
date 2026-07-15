'use client';

import Image from 'next/image';
import { Star, Eye } from 'lucide-react';
import { ProductBadge } from '@/components/ui/Feedback';
import { useUIStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { textureLabels } from '@/lib/siteConfig';

export default function ProductCard({ product }) {
  const openQuickView = useUIStore((s) => s.openQuickView);
  const image = product.images?.[0]?.url;

  return (
    <div className="group relative flex flex-col">
      <button
        onClick={() => openQuickView(product.slug)}
        className="relative block aspect-[4/5] w-full overflow-hidden rounded-xl2 bg-ink/5"
      >
        {image && (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          <ProductBadge badge={product.badge} />
        </div>
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-ink/90 py-2.5 text-center text-xs font-medium uppercase tracking-wider text-cream transition duration-300 group-hover:translate-y-0 flex items-center justify-center gap-1.5">
          <Eye className="h-3.5 w-3.5" /> Quick View
        </div>
      </button>

      <button onClick={() => openQuickView(product.slug)} className="mt-3 text-left">
        <p className="text-[11px] uppercase tracking-wider text-gold-dark">{product.brand}</p>
        <h3 className="mt-0.5 line-clamp-2 font-display text-base text-ink">{product.name}</h3>
        <p className="mt-1 text-xs text-charcoal/50">
          {textureLabels[product.texture]} · {product.length}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-medium text-ink">{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-xs text-charcoal/40 line-through">{formatPrice(product.compareAtPrice)}</span>
          )}
        </div>
        {product.numReviews > 0 && (
          <div className="mt-1 flex items-center gap-1 text-xs text-charcoal/50">
            <Star className="h-3 w-3 fill-gold text-gold" />
            {product.rating} ({product.numReviews})
          </div>
        )}
      </button>
    </div>
  );
}
