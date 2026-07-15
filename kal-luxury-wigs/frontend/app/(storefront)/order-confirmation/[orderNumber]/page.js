'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Feedback';
import { Input, Field } from '@/components/ui/FormFields';
import { useTrackOrder } from '@/lib/hooks';
import { formatPrice, isValidEthiopianPhone } from '@/lib/utils';

export default function OrderConfirmationPage({ params }) {
  const { orderNumber } = use(params);
  const [phone, setPhone] = useState('');
  const [submittedPhone, setSubmittedPhone] = useState('');

  const { data: order, isLoading, isError } = useTrackOrder(orderNumber, submittedPhone, Boolean(submittedPhone));

  return (
    <div className="container-kal max-w-lg py-16">
      <h1 className="font-display text-2xl text-charcoal">Order {orderNumber}</h1>
      <p className="mt-2 text-sm text-charcoal/60">
        Enter the phone number used at checkout to view your order status.
      </p>

      <form
        onSubmit={(e) => { e.preventDefault(); if (isValidEthiopianPhone(phone)) setSubmittedPhone(phone); }}
        className="mt-5 flex gap-2"
      >
        <Field label="Phone number" className="flex-1">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09XXXXXXXX" />
        </Field>
        <Button type="submit" variant="gold" className="mt-6 h-fit">View</Button>
      </form>

      {isLoading && <PageSpinner label="Looking up your order…" />}
      {isError && <p className="mt-4 text-sm text-garnet">No matching order found — check the phone number and try again.</p>}

      {order && (
        <div className="mt-8 space-y-4 rounded-xl2 border border-ink/10 bg-white p-6">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">Order Status: {order.orderStatus}</span>
          </div>
          <div className="space-y-1 text-sm text-charcoal/70">
            <p>Payment: {order.paymentStatus.replace('_', ' ')}</p>
            <p>Total: {formatPrice(order.total)}</p>
            <p>{order.deliveryMethod === 'delivery' ? 'Delivery to: ' + (order.deliveryAddress?.fullAddress || 'pinned location') : 'Pickup in-store'}</p>
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

      <div className="mt-8">
        <Link href="/shop" className="text-sm text-gold-dark underline">Continue shopping →</Link>
      </div>
    </div>
  );
}
