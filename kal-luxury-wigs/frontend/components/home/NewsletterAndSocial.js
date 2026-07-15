'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Instagram, Send } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/FormFields';
import { useSubscribeNewsletter } from '@/lib/hooks';
import { useToastStore } from '@/lib/store';

const galleryPlaceholders = Array.from({ length: 6 }).map((_, i) =>
  `https://placehold.co/400x400/1F1912/AD8544?text=%40kalluxurywigshop`
);

export default function NewsletterAndSocial() {
  const [email, setEmail] = useState('');
  const subscribe = useSubscribeNewsletter();
  const showToast = useToastStore((s) => s.showToast);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await subscribe.mutateAsync(email.trim());
      showToast("You're on the list — thank you!");
      setEmail('');
    } catch (err) {
      showToast(err.message || 'Could not subscribe right now', 'error');
    }
  };

  return (
    <section className="border-t border-ink/5 py-16 sm:py-20">
      <div className="container-kal grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold-dark">Stay in the Loop</p>
          <h2 className="mt-2 font-display text-2xl text-charcoal sm:text-3xl">New Arrivals &amp; Restocks</h2>
          <p className="mt-3 max-w-sm text-sm text-charcoal/60">
            Be first to know when new textures, colours, and limited pieces land.
          </p>
          <form onSubmit={handleSubmit} className="mt-5 flex max-w-sm gap-2">
            <Input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" variant="gold" loading={subscribe.isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-sm text-charcoal/60">
            <Instagram className="h-4 w-4" /> Follow along — swap these tiles for your real posts
          </div>
          <div className="grid grid-cols-3 gap-2">
            {galleryPlaceholders.map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-ink/5">
                <Image src={src} alt="Instagram placeholder" fill sizes="150px" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
