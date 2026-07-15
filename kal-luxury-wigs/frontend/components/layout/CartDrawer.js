'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Feedback';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';

export default function CartDrawer() {
  const router = useRouter();
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  return (
    <Modal open={isOpen} onClose={closeCart} variant="sheet" title={`Your Bag (${items.length})`}>
      {items.length === 0 ? (
        <EmptyState
          title="Your bag is empty"
          description="Browse the shop and add a few favorites — they'll show up here."
          action={<Button href="/shop" onClick={closeCart}>Shop Wigs</Button>}
        />
      ) : (
        <div className="flex flex-col divide-y divide-charcoal/10 px-5">
          {items.map((item) => (
            <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4 py-5">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-ink/5">
                {item.image && <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />}
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-2">
                  <p className="text-sm font-medium text-ink">{item.name}</p>
                  <button onClick={() => removeItem(item.productId, item.size, item.color)} aria-label="Remove">
                    <Trash2 className="h-4 w-4 text-charcoal/40 hover:text-garnet" />
                  </button>
                </div>
                <p className="mt-0.5 text-xs text-charcoal/50">
                  {[item.size, item.color].filter(Boolean).join(' · ')}
                </p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 rounded-full border border-charcoal/15 px-1">
                    <button
                      className="p-1.5 text-charcoal/60 hover:text-ink"
                      onClick={() => updateQty(item.productId, item.size, item.color, item.qty - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-4 text-center text-sm">{item.qty}</span>
                    <button
                      className="p-1.5 text-charcoal/60 hover:text-ink"
                      onClick={() => updateQty(item.productId, item.size, item.color, item.qty + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="font-medium text-ink">{formatPrice(item.price * item.qty)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="border-t border-charcoal/10 bg-cream p-5">
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-charcoal/60">Subtotal</span>
            <span className="font-display text-lg text-ink">{formatPrice(subtotal)}</span>
          </div>
          <Button variant="gold" size="lg" className="w-full" icon={ShoppingBag} onClick={handleCheckout}>
            Proceed to Checkout
          </Button>
          <p className="mt-3 text-center text-xs text-charcoal/50">Delivery fee (if any) is calculated at checkout.</p>
        </div>
      )}
    </Modal>
  );
}
