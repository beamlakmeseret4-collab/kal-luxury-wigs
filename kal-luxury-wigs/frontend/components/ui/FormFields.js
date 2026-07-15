'use client';

import { cn } from '@/lib/utils';

export function Field({ label, hint, error, required, children, className }) {
  return (
    <label className={cn('block', className)}>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-charcoal">
          {label}
          {required && <span className="text-garnet"> *</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-charcoal/60">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-garnet">{error}</span>}
    </label>
  );
}

const baseInputClass =
  'w-full rounded-lg border border-charcoal/15 bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/40 outline-none transition focus:border-gold';

export function Input({ className, error, ...props }) {
  return (
    <input
      className={cn(baseInputClass, error && 'border-garnet', className)}
      {...props}
    />
  );
}

export function Textarea({ className, error, rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      className={cn(baseInputClass, 'resize-none', error && 'border-garnet', className)}
      {...props}
    />
  );
}

export function Select({ className, error, children, ...props }) {
  return (
    <select className={cn(baseInputClass, 'bg-white', error && 'border-garnet', className)} {...props}>
      {children}
    </select>
  );
}

export function Checkbox({ label, className, ...props }) {
  return (
    <label className={cn('flex cursor-pointer items-center gap-2 text-sm text-charcoal', className)}>
      <input type="checkbox" className="h-4 w-4 rounded border-charcoal/30 accent-gold" {...props} />
      {label}
    </label>
  );
}

/** A single option in a radio-style choice group, styled as a selectable card.
 * `icon` takes an already-rendered element, e.g. icon={<Truck className="h-4 w-4" />}. */
export function RadioCard({ title, description, checked, onChange, icon, name, value }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      name={name}
      value={value}
      onClick={onChange}
      className={cn(
        'flex w-full items-start gap-3 rounded-xl border p-4 text-left transition',
        checked ? 'border-gold bg-gold/5 ring-1 ring-gold' : 'border-charcoal/15 hover:border-charcoal/30'
      )}
    >
      {icon && (
        <span className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full', checked ? 'bg-gold text-ink' : 'bg-charcoal/5 text-charcoal/60')}>
          {icon}
        </span>
      )}
      <span>
        <span className="block text-sm font-semibold text-charcoal">{title}</span>
        {description && <span className="mt-0.5 block text-xs text-charcoal/60">{description}</span>}
      </span>
    </button>
  );
}
