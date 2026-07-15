'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToastStore } from '@/lib/store';

const icons = { success: CheckCircle2, error: XCircle, info: Info };

export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismissToast = useToastStore((s) => s.dismissToast);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type] || Info;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-sm text-cream shadow-2xl"
            >
              <Icon className="h-4 w-4 shrink-0 text-gold" />
              <span>{toast.message}</span>
              <button onClick={() => dismissToast(toast.id)} aria-label="Dismiss">
                <X className="h-3.5 w-3.5 text-cream/50 hover:text-cream" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
