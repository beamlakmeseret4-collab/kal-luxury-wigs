'use client';

import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import StrandFlourish from '@/components/ui/StrandFlourish';

// NOTE: these are placeholder quotes written to show the layout — not real
// customer reviews. Replace with genuine customer feedback once you have
// some (or remove this section entirely until you do). Publishing fabricated
// testimonials as if they were real customer reviews is misleading and, in
// many places, against consumer-protection rules — so treat this section as
// a template, not launch-ready copy.
const placeholderTestimonials = [
  {
    quote: 'This is placeholder text — swap in a real customer quote about fit, quality, or delivery once you have one.',
    name: '— Add customer name —',
  },
  {
    quote: 'Placeholder review copy. Real testimonials build far more trust than template text, so prioritize collecting a few before launch.',
    name: '— Add customer name —',
  },
  {
    quote: 'Another placeholder quote. Consider asking happy customers to leave a review after delivery to fill this section naturally.',
    name: '— Add customer name —',
  },
];

export default function Testimonials() {
  return (
    <section className="bg-ink py-16 sm:py-20">
      <div className="container-kal">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-widest text-gold-light/70">In Their Words</p>
          <h2 className="mt-2 font-display text-2xl text-cream sm:text-3xl">Customer Stories</h2>
          <p className="mx-auto mt-2 max-w-md text-xs text-cream/40">
            Template content below — replace with real reviews before launch.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {placeholderTestimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="rounded-xl2 border border-cream/10 bg-cream/5 p-6"
            >
              <div className="mb-3 flex gap-0.5 text-gold">
                {[1, 2, 3, 4, 5].map((n) => <Star key={n} className="h-4 w-4 fill-gold" />)}
              </div>
              <p className="text-sm italic leading-relaxed text-cream/70">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-4 text-xs uppercase tracking-wider text-gold-light/70">{t.name}</p>
            </motion.div>
          ))}
        </div>
        <StrandFlourish tone="gold" className="mt-12 h-8 opacity-25" />
      </div>
    </section>
  );
}
