'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { badgeLabels } from '@/lib/siteConfig';
import StrandFlourish from './StrandFlourish';

export function Badge({ children, tone = 'gold', className }) {
  const tones = {
    gold: 'bg-gold text-ink',
    garnet: 'bg-garnet text-cream',
    ink: 'bg-ink text-cream',
    outline: 'bg-transparent text-ink border border-ink/30',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide', tones[tone], className)}>
      {children}
    </span>
  );
}

export function ProductBadge({ badge }) {
  if (!badge || badge === 'none') return null;
  const toneMap = { bestseller: 'ink', new: 'gold', sale: 'garnet', medical: 'outline' };
  return <Badge tone={toneMap[badge] || 'gold'}>{badgeLabels[badge] || badge}</Badge>;
}

export function Spinner({ className }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-gold', className)} />;
}

/** Centered loading state for a full page or section (vs. the small inline Spinner). */
export function PageSpinner({ label = 'Loading…', className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-24', className)}>
      <Loader2 className="h-8 w-8 animate-spin text-gold" />
      {label && <p className="text-sm text-charcoal/50">{label}</p>}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <StrandFlourish className="h-10 w-16 text-ink/30" />
      <h3 className="font-display text-xl text-ink">{title}</h3>
      {description && <p className="max-w-sm text-sm text-charcoal/60">{description}</p>}
      {action}
    </div>
  );
}
