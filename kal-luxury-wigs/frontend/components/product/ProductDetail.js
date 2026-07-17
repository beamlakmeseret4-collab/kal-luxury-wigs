'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, Check, ExternalLink, Heart } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ProductBadge } from '@/components/ui/Feedback';
import ReviewsSection from './ReviewsSection';
import ProductGrid from './ProductGrid';
import { useRelatedProducts, useWishlist, useToggleWishlist } from '@/lib/hooks';
import { useCartStore, useToastStore, useRecentlyViewedStore, useAuthStore, useUIStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { textureLabels, laceLabels } from '@/lib/siteConfig';

/**
 * The full rich product view — shared by the quick-view side panel AND the
 * dedicated /product/[slug] page, so both stay in sync automatically.
 */
export default function ProductDetail({ product, isPage = false }) {
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState(product.availableSizes?.[0] || '');
  const [color, setColor] = useState(product.availableColors?.[0] || product.colorName || '');
  const [qty, setQty] = useState(1);

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const closeQuickView = useUIStore((s) => s.closeQuickView);
  const showToast = useToastStore((s) => s.showToast);
  const addRecentlyViewed = useRecentlyViewedStore((s) => s.addRecentlyViewed);
  const { data: related } = useRelatedProducts(product._id);
  const token = useAuthStore((s) => s.token);
  const { data: wishlist } = useWishlist();
  const toggleWishlist = useToggleWishlist();
  const isWishlisted = Boolean(wishlist?.some((p) => p._id === product._id));

  const handleToggleWishlist = async () => {
    if (!token) {
      showToast('Log in to save items to your wishlist', 'info');
      return;
    }
    try {
      await toggleWishlist.mutateAsync(product._id);
      showToast(isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist');
    } catch (err) {
      showToast(err.message || 'Could not update wishlist', 'error');
    }
  };

  useEffect(() => {
    addRecentlyViewed({
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url,
    });
    setActiveImage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product._id]);

  const cartItem = () => ({
    productId: product._id,
    slug: product.slug,
    name: product.name,
    image: product.images?.[0]?.url,
    price: product.price,
    size,
    color,
    qty,
  });

 const handleAddToCart = () => {
    addItem(cartItem());
    showToast(`Added ${product.name} to your bag`);
    closeQuickView();
    openCart();
  };

  const handleBuyNow = () => {
    addItem(cartItem());
    closeQuickView();
    router.push('/checkout');
  };

  return (
    <div className={isPage ? 'container-kal py-10' : 'px-5 py-5'}>
      <div className={isPage ? 'grid grid-cols-1 gap-10 lg:grid-cols-2' : 'flex flex-col gap-6'}>
        {/* Gallery */}
        <div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl2 bg-ink/5">
            {product.images?.[activeImage]?.url && (
              <Image
                src={product.images[activeImage].url}
                alt={product.name}
                fill
                sizes={isPage ? '50vw' : '400px'}
                className="object-cover"
              />
            )}
            <div className="absolute left-3 top-3">
              <ProductBadge badge={product.badge} />
            </div>
          </div>
          {product.images?.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img.url}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-16 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    i === activeImage ? 'border-gold' : 'border-transparent opacity-70'
                  }`}
                >
                  <Image src={img.url} alt="" fill sizes="56px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
          {!isPage && (
            <Link
              href={`/product/${product.slug}`}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-gold-dark hover:underline"
            >
              View full page <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-gold-dark">{product.brand}</p>
              <h1 className="mt-1 font-display text-2xl text-ink sm:text-3xl">{product.name}</h1>
            </div>
            <button
              onClick={handleToggleWishlist}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              className="mt-1 shrink-0 rounded-full border border-charcoal/15 p-2.5 transition hover:border-garnet"
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-garnet text-garnet' : 'text-charcoal/50'}`} />
            </button>
          </div>

          {product.numReviews > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-sm text-charcoal/60">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`h-4 w-4 ${i <= Math.round(product.rating) ? 'fill-gold text-gold' : 'text-charcoal/20'}`} />
                ))}
              </div>
              {product.rating} ({product.numReviews} review{product.numReviews !== 1 ? 's' : ''})
            </div>
          )}

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-2xl text-ink">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-charcoal/40 line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-charcoal/80">{product.shortDescription}</p>

          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-ink/5 px-3 py-1.5 text-charcoal/70">{textureLabels[product.texture]}</span>
            <span className="rounded-full bg-ink/5 px-3 py-1.5 text-charcoal/70">{laceLabels[product.laceType]}</span>
            <span className="rounded-full bg-ink/5 px-3 py-1.5 text-charcoal/70">{product.length}</span>
            <span className="rounded-full bg-ink/5 px-3 py-1.5 text-charcoal/70">{product.density} density</span>
          </div>

          {product.availableColors?.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-ink">Color: <span className="font-normal text-charcoal/60">{color}</span></p>
              <div className="flex flex-wrap gap-2">
                {product.availableColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                      color === c ? 'border-gold bg-gold/10 text-ink' : 'border-charcoal/20 text-charcoal/70 hover:border-charcoal/40'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.availableSizes?.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-ink">Cap Size: <span className="font-normal text-charcoal/60">{size}</span></p>
              <div className="flex flex-wrap gap-2">
                {product.availableSizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                      size === s ? 'border-gold bg-gold/10 text-ink' : 'border-charcoal/20 text-charcoal/70 hover:border-charcoal/40'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-full border border-charcoal/20 px-3 py-2">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="text-charcoal/60 hover:text-ink" aria-label="Decrease">−</button>
              <span className="w-5 text-center text-sm">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="text-charcoal/60 hover:text-ink" aria-label="Increase">+</button>
            </div>
            {product.stock > 0 ? (
              <span className="flex items-center gap-1 text-xs text-charcoal/50"><Check className="h-3.5 w-3.5 text-gold-dark" /> In stock</span>
            ) : (
              <span className="text-xs text-garnet">Out of stock</span>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" size="lg" className="flex-1" onClick={handleAddToCart} disabled={product.stock === 0}>
              Add to Cart
            </Button>
            <Button variant="gold" size="lg" className="flex-1" onClick={handleBuyNow} disabled={product.stock === 0}>
              Buy Now
            </Button>
          </div>

          <details className="mt-8 border-t border-charcoal/10 pt-5" open={isPage}>
            <summary className="cursor-pointer font-display text-lg text-ink">Description</summary>
            <p className="mt-3 text-sm leading-relaxed text-charcoal/70">{product.description}</p>
          </details>

          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <details className="mt-5 border-t border-charcoal/10 pt-5" open={isPage}>
              <summary className="cursor-pointer font-display text-lg text-ink">Specifications</summary>
              <dl className="mt-3 divide-y divide-charcoal/10 text-sm">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4 py-2">
                    <dt className="text-charcoal/50">{key}</dt>
                    <dd className="text-right font-medium text-charcoal">{value}</dd>
                  </div>
                ))}
              </dl>
            </details>
          )}
        </div>
      </div>

      <div className="mt-12 border-t border-charcoal/10 pt-10">
        <ReviewsSection product={product} />
      </div>

      {related?.length > 0 && (
        <div className="mt-12 border-t border-charcoal/10 pt-10">
          <h2 className="mb-5 font-display text-xl text-ink">You May Also Like</h2>
          <ProductGrid products={related} columns={4} />
        </div>
      )}
    </div>
  );
}
