'use client';

import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { usePublicConfig } from '@/lib/hooks';
import { PageSpinner } from '@/components/ui/Feedback';

export default function ContactPage() {
  const { data: config, isLoading } = usePublicConfig();

  if (isLoading) return <PageSpinner label="Loading contact details…" />;

  return (
    <div className="container-kal max-w-lg py-16">
      <p className="text-xs uppercase tracking-widest text-gold-dark">Get in Touch</p>
      <h1 className="mt-2 font-display text-3xl text-charcoal">Contact Us</h1>
      <p className="mt-3 text-sm text-charcoal/60">
        Questions about an order, sizing, or availability? Reach us directly.
      </p>

      <div className="mt-8 space-y-4">
        {config?.shopPhone && (
          <a href={`tel:${config.shopPhone}`} className="flex items-center gap-3 rounded-xl2 border border-ink/10 bg-white p-4">
            <Phone className="h-5 w-5 text-gold-dark" />
            <div>
              <p className="text-sm font-medium text-ink">Call or WhatsApp</p>
              <p className="text-sm text-charcoal/60">{config.shopPhone}</p>
            </div>
          </a>
        )}
        {config?.shopEmail && (
          <a href={`mailto:${config.shopEmail}`} className="flex items-center gap-3 rounded-xl2 border border-ink/10 bg-white p-4">
            <Mail className="h-5 w-5 text-gold-dark" />
            <div>
              <p className="text-sm font-medium text-ink">Email</p>
              <p className="text-sm text-charcoal/60">{config.shopEmail}</p>
            </div>
          </a>
        )}
        {config?.shopAddress && (
          <div className="flex items-center gap-3 rounded-xl2 border border-ink/10 bg-white p-4">
            <MapPin className="h-5 w-5 text-gold-dark" />
            <div>
              <p className="text-sm font-medium text-ink">Visit the Shop</p>
              <p className="text-sm text-charcoal/60">{config.shopAddress}</p>
              {config.shopPickupInstructions && <p className="mt-0.5 text-xs text-charcoal/45">{config.shopPickupInstructions}</p>}
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 rounded-xl2 border border-dashed border-ink/15 p-4 text-sm text-charcoal/50">
          <MessageCircle className="h-5 w-5 shrink-0 text-charcoal/30" />
          Add your Instagram, TikTok, or Telegram links here once you have them.
        </div>
      </div>
    </div>
  );
}
