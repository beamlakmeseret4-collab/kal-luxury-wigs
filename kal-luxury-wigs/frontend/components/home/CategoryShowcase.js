'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const collections = [
  {
    title: 'Human Hair',
    blurb: 'Remy human hair lace fronts, full lace, and 360 — style, color, and heat-style it like your own.',
    href: '/shop?hairType=human-hair',
  },
  {
    title: 'Everyday Synthetic',
    blurb: 'Pre-styled, wash-and-wear textures that hold their shape without any heat tools.',
    href: '/shop?hairType=synthetic',
  },
  {
    title: 'Bridal & Occasion',
    blurb: 'Long, dense, camera-ready lengths for weddings, shoots, and big nights out.',
    href: '/shop?style=bridal',
  },
  {
    title: 'Comfort & Medical',
    blurb: 'Seamless, breathable caps built gently for sensitive or healing scalps.',
    href: '/shop?style=medical',
  },
];

export default function CategoryShowcase() {
  return (
    <section className="container-kal py-16 sm:py-20">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold-dark">Collections</p>
          <h2 className="mt-2 font-display text-2xl text-charcoal sm:text-3xl">Shop by Occasion</h2>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {collections.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
          >
            <Link
              href={c.href}
              className="group flex h-full flex-col justify-between rounded-xl2 border border-ink/10 bg-ink p-6 transition hover:border-gold/50"
            >
              <div>
                <h3 className="font-display text-lg text-cream">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/55">{c.blurb}</p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gold-light">
                Shop Now
                <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
