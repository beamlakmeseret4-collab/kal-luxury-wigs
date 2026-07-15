'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Truck, MessageCircle, Sparkles } from 'lucide-react';

const points = [
  {
    icon: ShieldCheck,
    title: 'Verified Payments',
    description: 'Every TeleBirr and CBE payment is checked by a real person before your order ships — never automated guesswork.',
  },
  {
    icon: Truck,
    title: 'Delivery or Pickup',
    description: 'Pin your exact location for delivery across Addis Ababa, or collect your order from our shop yourself.',
  },
  {
    icon: Sparkles,
    title: 'Human Hair & Synthetic',
    description: 'From everyday synthetic textures to full-lace human hair — every texture, length, and cap style in one place.',
  },
  {
    icon: MessageCircle,
    title: 'We Follow Up Personally',
    description: 'Placed a delivery order? We call to confirm details and timing with you directly — no guessing where your package is.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="container-kal py-16 sm:py-20">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-gold-dark">Why Kal</p>
        <h2 className="mt-2 font-display text-2xl text-charcoal sm:text-3xl">Built Around How Addis Shops</h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {points.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: i * 0.06 }}
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 text-gold-dark">
              <p.icon className="h-5 w-5" />
            </div>
            <h3 className="font-display text-base text-charcoal">{p.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-charcoal/60">{p.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
