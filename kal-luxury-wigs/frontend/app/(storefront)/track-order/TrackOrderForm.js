'use client';

import { useState } from 'react';
import { Search, CheckCircle2 } from 'lucide-react';
import { Input, Field } from '@/components/ui/FormFields';
import Button from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Feedback';
import { useTrackOrder } from '@/lib/hooks';
import { formatPrice } from '@/lib/utils';

export default function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [query, setQuery] = useState(null);
  const { trackOrder, isLoading } = useTrackOrder();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await trackOrder({ orderNumber, phone });
      setQuery(result);
    } catch (err) {
      setQuery({ error: err.message || 'Order not found' });
    }
  };

  return (
    <div className="max-w-lg mx-auto py-12 px-4">
      <h1 className="text-3xl font-serif text-brand-gold mb-2 text-center">Track Your Order</h1>
      <p className="text-brand-cream/60 text-center mb-8">
        Enter your order number and phone number to check status
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Order Number">
          <Input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. KAL-123456"
            required
          />
        </Field>

        <Field label="Phone Number">
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="09xxxxxxxx"
            required
          />
        </Field>

        <Button type="submit" fullWidth disabled={isLoading}>
          <Search className="w-4 h-4 mr-2" />
          {isLoading ? 'Searching...' : 'Track Order'}
        </Button>
      </form>

      {query && !query.error && (
        <div className="mt-8 bg-brand-charcoal border border-brand-gold/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-medium">Order Found</span>
          </div>
          <div className="space-y-2 text-sm">
            <p><span className="text-brand-cream/60">Status:</span> <span className="text-brand-gold font-medium">{query.status}</span></p>
            <p><span className="text-brand-cream/60">Total:</span> {formatPrice(query.total)}</p>
            <p><span className="text-brand-cream/60">Date:</span> {new Date(query.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      )}

      {query?.error && (
        <div className="mt-8 bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg">
          {query.error}
        </div>
      )}
    </div>
  );
}