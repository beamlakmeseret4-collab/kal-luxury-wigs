'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const variants = {
  primary: 'bg-ink text-cream hover:bg-ink-2 border border-ink',
  gold: 'bg-gold text-ink hover:bg-gold-dark border border-gold',
  outline: 'bg-transparent text-ink border border-ink/30 hover:border-ink',
  outlineLight: 'bg-transparent text-cream border border-cream/40 hover:border-cream',
  ghost: 'bg-transparent text-ink hover:bg-ink/5 border border-transparent',
  danger: 'bg-garnet text-cream hover:bg-garnet-light border border-garnet',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  type = 'button',
  loading = false,
  disabled = false,
  fullWidth = false,
  className,
  icon: Icon,
  iconRight: IconRight,
  ...props
}) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className
  );

  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {!loading && Icon && <Icon className="h-4 w-4" />}
      {children}
      {!loading && IconRight && <IconRight className="h-4 w-4" />}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
}
