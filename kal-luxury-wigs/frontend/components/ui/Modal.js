'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Shared overlay primitive.
 *   variant="sheet"   -> slides in from the right (cart, quick view, mobile menu)
 *   variant="center"  -> centered dialog (admin forms, confirmations)
 */
export default function Modal({ open, onClose, variant = 'sheet', title, children, widthClass }) {
  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-ink/60 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
          />

          {variant === 'sheet' ? (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={title}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'absolute right-0 top-0 flex h-full w-full flex-col bg-cream shadow-2xl sm:max-w-md',
                widthClass
              )}
            >
              <ModalHeader title={title} onClose={onClose} />
              <div className="flex-1 overflow-y-auto">{children}</div>
            </motion.div>
          ) : (
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                transition={{ duration: 0.22 }}
                className={cn(
                  'relative max-h-[90vh] w-full overflow-y-auto rounded-xl2 bg-cream shadow-2xl sm:max-w-2xl',
                  widthClass
                )}
              >
                <ModalHeader title={title} onClose={onClose} />
                <div className="p-6">{children}</div>
              </motion.div>
            </div>
          )}
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function ModalHeader({ title, onClose }) {
  if (!title && !onClose) return null;
  return (
    <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
      <h2 className="font-display text-lg text-charcoal">{title}</h2>
      <button
        onClick={onClose}
        aria-label="Close"
        className="rounded-full p-2 text-charcoal/60 transition hover:bg-ink/5 hover:text-charcoal"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
