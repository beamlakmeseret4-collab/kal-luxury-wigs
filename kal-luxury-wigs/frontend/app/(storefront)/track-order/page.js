'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Search, CheckCircle2 } from 'lucide-react';
import { Input, Field } from '@/components/ui/FormFields';
import Button from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Feedback';
import { useTrackOrder } from '@/lib/hooks';
import { formatPrice, isValidEthiopianPhone } from '@/lib/utils';



export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [query, setQuery] = useState(null);

  const { data: order, isLoading, isError } = useTrackOrder(
    query?.orderNumber,
    query?.phone,
    Boolean(query)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!orderNumber.trim() || !isValidEthiopianPhone(phone)) return;
    setQuery({ orderNumber: orderNumber.trim(), phone });
  };

  return (
    <div className="container-kal max-w-lg py-16">
      <p className="text-xs uppercase tracking-widest text-gold-dark">Order Status</p>
      <h1 className="mt-2 font-display text-2xl text-charcoal">Track Your Order</h1>
      <p className="mt-2 text-sm text-charcoal/60">
        Enter your order number and the phone number you checked out with.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field label="Order number" required>
          <Input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="KAL-2026-000123" required />
        </Field>
        <Field label="Phone number" required>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09XXXXXXXX" required />
        </Field>
        <Button type="submit" variant="gold" fullWidth>
          <Search className="h-4 w-4" /> Track Order
        </Button>
      </form>

      {isLoading && <div className="mt-8"><PageSpinner label="Searching…" /></div>}
      {isError && <p className="mt-6 text-sm text-garnet">No matching order found — double check your order number and phone.</p>}

      {order && (
        <div className="mt-8 space-y-4 rounded-xl2 border border-ink/10 bg-white p-6">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium capitalize">Status: {order.orderStatus}</span>
          </div>
          <div className="space-y-1 text-sm text-charcoal/70">
            <p className="capitalize">Payment: {order.paymentStatus.replace('_', ' ')}</p>
            <p>Total: {formatPrice(order.total)}</p>
            <p>{order.deliveryMethod === 'delivery' ? `Delivery to: ${order.deliveryAddress?.fullAddress || 'pinned location'}` : 'Pickup in-store'}</p>
          </div>
          <ul className="divide-y divide-ink/10 border-t border-ink/10 pt-2 text-sm">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between py-2">
                <span>{item.qty}× {item.name}</span>
                <span>{formatPrice(item.price * item.qty)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
