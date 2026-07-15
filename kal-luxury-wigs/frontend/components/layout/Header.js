'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Menu, X, Search, User, ShoppingBag, Heart } from 'lucide-react';
import { mainNav, siteConfig } from '@/lib/siteConfig';
import { useCartStore, useUIStore, useAuthStore, useHasHydrated } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const router = useRouter();
  const hydrated = useHasHydrated();

  const itemCount = useCartStore((s) => s.itemCount());
  const openCart = useCartStore((s) => s.openCart);
  const mobileMenuOpen = useUIStore((s) => s.mobileMenuOpen);
  const toggleMobileMenu = useUIStore((s) => s.toggleMobileMenu);
  const closeMobileMenu = useUIStore((s) => s.closeMobileMenu);
  const user = useAuthStore((s) => s.user);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/95 backdrop-blur">
      <div className="container-kal flex h-20 items-center justify-between gap-4">
        <button
          className="lg:hidden -ml-2 rounded-full p-2 text-ink"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <Link href="/" className="flex items-center gap-3 shrink-0" onClick={closeMobileMenu}>
          <Image src="/logo.png" alt={siteConfig.name} width={44} height={44} className="rounded-full" />
          <span className="hidden font-display text-xl tracking-tight text-ink sm:block">
            {siteConfig.shortName}
            <span className="ml-1.5 text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-gold-dark align-middle">
              Luxury Wig Shop
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-charcoal/80 transition hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
            className="rounded-full p-2.5 text-ink transition hover:bg-ink/5"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            href={hydrated && user ? '/account' : '/login'}
            aria-label="Account"
            className="hidden rounded-full p-2.5 text-ink transition hover:bg-ink/5 sm:block"
          >
            <User className="h-5 w-5" />
          </Link>
          {hydrated && user && (
            <Link href="/account?tab=wishlist" aria-label="Wishlist" className="hidden rounded-full p-2.5 text-ink transition hover:bg-ink/5 sm:block">
              <Heart className="h-5 w-5" />
            </Link>
          )}
          <button
            aria-label="Cart"
            onClick={openCart}
            className="relative rounded-full p-2.5 text-ink transition hover:bg-ink/5"
          >
            <ShoppingBag className="h-5 w-5" />
            {hydrated && itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-garnet text-[10px] font-bold text-cream">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-ink/10 bg-cream">
          <form onSubmit={handleSearchSubmit} className="container-kal flex items-center gap-3 py-4">
            <Search className="h-4 w-4 shrink-0 text-charcoal/40" />
            <input
              autoFocus
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search lace fronts, bobs, brands, colors…"
              className="w-full bg-transparent text-sm text-charcoal outline-none placeholder:text-charcoal/40"
            />
          </form>
        </div>
      )}

      <div
        className={cn(
          'overflow-hidden border-t border-ink/10 bg-cream transition-all duration-300 lg:hidden',
          mobileMenuOpen ? 'max-h-96' : 'max-h-0 border-t-0'
        )}
      >
        <nav className="container-kal flex flex-col py-2">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobileMenu}
              className="border-b border-ink/5 py-3 text-sm font-medium text-charcoal/80 last:border-0"
            >
              {item.label}
            </Link>
          ))}
          <Link href={hydrated && user ? '/account' : '/login'} onClick={closeMobileMenu} className="py-3 text-sm font-medium text-charcoal/80">
            {hydrated && user ? 'My Account' : 'Login / Register'}
          </Link>
        </nav>
      </div>
    </header>
  );
}