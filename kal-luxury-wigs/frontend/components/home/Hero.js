'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import StrandFlourish from '@/components/ui/StrandFlourish';
import { siteConfig } from '@/lib/siteConfig';

const textures = [
  { label: 'Straight', href: '/shop?texture=straight', gradient: 'from-[#3a2f22] to-[#8a6a34]' },
  { label: 'Body Wave', href: '/shop?texture=body-wave', gradient: 'from-[#4a2a2f] to-[#ad8544]' },
  { label: 'Deep Wave', href: '/shop?texture=deep-wave', gradient: 'from-[#2a2419] to-[#6e1f2b]' },
  { label: 'Curly', href: '/shop?texture=curly', gradient: 'from-[#1f1912] to-[#ad8544]' },
  { label: 'Kinky Curly', href: '/shop?texture=kinky-curly', gradient: 'from-[#3a2f22] to-[#e8d4a6]' },
  { label: 'Bob Cuts', href: '/shop?style=bob', gradient: 'from-[#4a2a2f] to-[#8a6a34]' },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-cream">
      <StrandFlourish animate tone="current" className="pointer-events-none absolute -right-8 top-10 h-40 w-72 text-gold opacity-20 sm:h-56 sm:w-96" />
      <div className="container-kal relative grid grid-cols-1 gap-10 py-16 sm:py-20 lg:grid-cols-5 lg:items-end lg:gap-8 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="lg:col-span-3"
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            {siteConfig.tagline}
          </p>
          <h1 className="font-display text-4xl leading-[1.1] text-cream sm:text-5xl lg:text-6xl">
            Hair that feels
            <br />
            like <span className="italic text-gold">yours.</span>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-cream/70 sm:text-base">
            Human hair and premium synthetic wigs — lace fronts, bobs, curls, and colour —
            hand-picked for every texture, worn with confidence in Addis Ababa and beyond.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-ink transition hover:bg-gold-light"
            >
              Shop the Collection <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/shop?badge=bestseller"
              className="inline-flex items-center gap-2 rounded-full border border-cream/30 px-7 py-3.5 text-sm font-semibold text-cream transition hover:border-cream"
            >
              Bestsellers
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <p className="mb-3 text-xs uppercase tracking-widest text-cream/50">Shop by Texture</p>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {textures.map((t, i) => (
              <motion.div
                key={t.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.06 }}
              >
                <Link
                  href={t.href}
                  className={`group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${t.gradient} p-2 text-center shadow-gold`}
                >
                  <svg viewBox="0 0 60 60" className="absolute inset-0 h-full w-full opacity-25">
                    <path d="M0 40C15 20 25 55 40 30C48 18 55 28 60 15" stroke="white" strokeWidth="1" fill="none" />
                    <path d="M0 50C15 35 25 60 40 42C48 32 55 40 60 30" stroke="white" strokeWidth="0.75" fill="none" opacity="0.7" />
                  </svg>
                  <span className="relative text-[11px] font-semibold text-cream drop-shadow sm:text-xs">
                    {t.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
