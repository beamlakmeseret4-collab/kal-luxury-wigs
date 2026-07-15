'use client';

import { cn } from '@/lib/utils';

/**
 * The site's signature graphic motif: a few flowing strand-like lines,
 * echoing loose hair caught mid-movement. Used as a section divider, a
 * hero backdrop accent, and a footer flourish so the brand has one
 * recognizable device instead of generic gradient blobs.
 */
export default function StrandFlourish({ className, animate = false, tone = 'gold' }) {
  const stroke =
    tone === 'current' ? 'currentColor'
      : tone === 'gold' ? '#AD8544'
      : tone === 'cream' ? '#F8F4EC'
      : '#241F1A';
  return (
    <svg
      viewBox="0 0 600 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-full', animate && 'animate-drift-slow', className)}
      aria-hidden="true"
    >
      <path
        d="M10 60 C 120 10, 180 110, 300 60 S 480 10, 590 60"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M10 75 C 130 30, 190 120, 300 75 S 470 30, 590 75"
        stroke={stroke}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M10 45 C 110 90, 200 5, 300 45 S 490 90, 590 45"
        stroke={stroke}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}
