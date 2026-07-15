'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Store, ChevronLeft, ChevronRight, PartyPopper } from 'lucide-react';
import { Input, Field, RadioCard } from '@/components/ui/FormFields';
import Button from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Feedback';
import PaymentMethodPanel from './PaymentMethodPanel';
import LocationPicker from './LocationPicker';
import { useCartStore, useAuthStore, useToastStore } from '@/lib/store';
import { usePublicConfig, useCreateOrder } from '@/lib/hooks';
import { formatPrice, isValidEthiopianPhone } from '@/lib/utils';

const steps = ['Details', 'Payment', 'Fulfillment', 'Review'];

export default function CheckoutWizard() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useAuthStore((s) => s.user);
  const showToast = useToastStore((s) => s.showToast);
  const { data: config } = usePublicConfig();
  const createOrder = useCreateOrder();

  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '' });
  const [payment, setPayment] = useState({ method: 'telebirr', payerName: '', payerPhone: '', screenshot: null });
  const [fulfillment, setFulfillment] = useState({ method: 'delivery', location: {} });
  const [placedOrder, setPlacedOrder] = useState(null);

  const deliveryFee = fulfillment.method === 'delivery' ? (config?.deliveryFee || 0) : 0;
  const total = subtotal + deliveryFee;

  if (items.length === 0 && !placedOrder) {
    return (
      <div className="container-kal py-16">
        <EmptyState
          title="Your bag is empty"
          description="Add a wig to your bag before checking out."
          action={<Button href="/shop" variant="gold">Shop Now</Button>}
        />
      </div>
    );
  }

  const validateStep = () => {
    if (step === 0) {
      if (!customer.name.trim()) return 'Please enter your name.';
      if (!isValidEthiopianPhone(customer.phone)) return 'Please enter a valid Ethiopian phone number.';
    }
    if (step === 1) {
      if ((payment.method === 'telebirr' || payment.method === 'cbe')) {
        if (!payment.payerName.trim() || !payment.payerPhone.trim()) return 'Please fill in the payer details.';
        if (!payment.screenshot) return 'Please upload your payment screenshot.';
      }
    }
    if (step === 2) {
      if (fulfillment.method === 'delivery' && !fulfillment.location?.fullAddress?.trim()) {
        return 'Please provide a delivery address or pin your location.';
      }
    }
    return null;
  };

  const goNext = () => {
    const error = validateStep();
    if (error) {
      showToast(error, 'error');
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    const error = validateStep();
    if (error) {
      showToast(error, 'error');
      return;
    }

    const formData = new FormData();
    formData.append('customerName', customer.name);
    formData.append('customerPhone', customer.phone);
    if (customer.email) formData.append('customerEmail', customer.email);
    formData.append(
      'items',
      JSON.stringify(items.map((i) => ({ productId: i.productId, qty: i.qty, size: i.size, color: i.color })))
    );
    formData.append('deliveryMethod', fulfillment.method);
    if (fulfillment.method === 'delivery') {
      formData.append(
        'deliveryAddress',
        JSON.stringify({
          fullAddress: fulfillment.location.fullAddress,
          coordinates: { lat: fulfillment.location.lat, lng: fulfillment.location.lng },
          notes: fulfillment.location.notes,
        })
      );
    }
    formData.append('paymentMethod', payment.method);
    if (payment.method !== 'cash') {
      formData.append('payerName', payment.payerName);
      formData.append('payerPhone', payment.payerPhone);
      if (payment.screenshot) formData.append('paymentScreenshot', payment.screenshot);
    }

    try {
      const res = await createOrder.mutateAsync(formData);
      setPlacedOrder(res.order);
      clearCart();
    } catch (err) {
      showToast(err.message || 'Could not place your order — please try again.', 'error');
    }
  };

  if (placedOrder) {
    return <OrderPlacedConfirmation order={placedOrder} onDone={() => router.push('/')} />;
  }

  return (
    <div className="container-kal max-w-3xl py-10">
      <Stepper current={step} />

      <div className="mt-8 rounded-xl2 border border-ink/10 bg-white p-6 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25 }}
          >
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl text-charcoal">Your Details</h2>
                <Field label="Full name" required>
                  <Input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} required />
                </Field>
                <Field label="Phone number" required hint="Used to confirm and coordinate your order.">
                  <Input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder="09XXXXXXXX" required />
                </Field>
                <Field label="Email (optional)">
                  <Input type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
                </Field>
                {!user && (
                  <p className="text-xs text-charcoal/50">
                    Checking out as a guest. <a href="/login" className="text-gold-dark underline">Log in</a> to save your details for next time.
                  </p>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl text-charcoal">Payment Method</h2>
                <PaymentMethodPanel config={config} value={payment} onChange={setPayment} />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl text-charcoal">Delivery or Pickup?</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <RadioCard
                    name="fulfillment"
                    value="delivery"
                    checked={fulfillment.method === 'delivery'}
                    onChange={() => setFulfillment({ ...fulfillment, method: 'delivery' })}
                    title="Delivery"
                    description="We'll bring it to your door in Addis Ababa"
                    icon={<Truck className="h-4 w-4 text-gold-dark" />}
                  />
                  <RadioCard
                    name="fulfillment"
                    value="pickup"
                    checked={fulfillment.method === 'pickup'}
                    onChange={() => setFulfillment({ ...fulfillment, method: 'pickup' })}
                    title="Pickup"
                    description="Collect your order from our shop"
                    icon={<Store className="h-4 w-4 text-gold-dark" />}
                  />
                </div>

                {fulfillment.method === 'delivery' ? (
                  <LocationPicker
                    apiKey={config?.googleMapsApiKey}
                    value={fulfillment.location}
                    onChange={(loc) => setFulfillment({ ...fulfillment, location: loc })}
                  />
                ) : (
                  <div className="rounded-xl2 border border-ink/10 bg-cream p-5 text-sm text-charcoal/70">
                    <p className="font-medium text-charcoal">Pickup address:</p>
                    <p className="mt-1">{config?.shopAddress}</p>
                    {config?.shopPickupInstructions && <p className="mt-2 text-xs text-charcoal/50">{config.shopPickupInstructions}</p>}
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl text-charcoal">Review Your Order</h2>
                <ul className="divide-y divide-ink/10 rounded-xl2 border border-ink/10">
                  {items.map((item) => (
                    <li key={`${item.productId}-${item.size}-${item.color}`} className="flex justify-between px-4 py-3 text-sm">
                      <span>{item.qty}× {item.name} {item.size ? `(${item.size})` : ''}</span>
                      <span className="font-medium">{formatPrice(item.price * item.qty)}</span>
                    </li>
                  ))}
                </ul>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-charcoal/60">
                    <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-charcoal/60">
                    <span>Delivery fee</span><span>{deliveryFee ? formatPrice(deliveryFee) : 'Free'}</span>
                  </div>
                  <div className="flex justify-between border-t border-ink/10 pt-2 font-display text-lg text-charcoal">
                    <span>Total</span><span>{formatPrice(total)}</span>
                  </div>
                </div>
                <div className="rounded-xl2 bg-cream p-4 text-xs text-charcoal/60">
                  Paying with <strong className="text-charcoal">{payment.method.toUpperCase()}</strong> ·{' '}
                  {fulfillment.method === 'delivery' ? 'Delivery' : 'Pickup'}
                  {payment.method !== 'cash' && ' · Your order will show as "Pending Payment Verification" until we confirm your screenshot.'}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between border-t border-ink/10 pt-6">
          <Button variant="ghost" onClick={goBack} disabled={step === 0}>
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          {step < steps.length - 1 ? (
            <Button variant="gold" onClick={goNext}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="gold" onClick={handleSubmit} loading={createOrder.isPending}>
              Place Order — {formatPrice(total)}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stepper({ current }) {
  return (
    <ol className="flex items-center justify-between">
      {steps.map((label, i) => (
        <li key={label} className="flex flex-1 items-center">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                i <= current ? 'bg-ink text-cream' : 'bg-ink/10 text-charcoal/40'
              }`}
            >
              {i + 1}
            </span>
            <span className={`text-[11px] ${i <= current ? 'text-charcoal' : 'text-charcoal/40'}`}>{label}</span>
          </div>
          {i < steps.length - 1 && <span className={`mx-2 mt-[-18px] h-px flex-1 ${i < current ? 'bg-ink' : 'bg-ink/10'}`} />}
        </li>
      ))}
    </ol>
  );
}

function OrderPlacedConfirmation({ order, onDone }) {
  return (
    <div className="container-kal flex max-w-lg flex-col items-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold-dark">
        <PartyPopper className="h-8 w-8" />
      </div>
      <h1 className="font-display text-2xl text-charcoal">Order Placed!</h1>
      <p className="mt-2 text-sm text-charcoal/60">
        Your order number is <strong className="text-charcoal">{order.orderNumber}</strong>. Save it to track your order anytime.
      </p>
      {order.paymentStatus === 'pending_verification' && (
        <p className="mt-3 rounded-xl2 bg-gold/10 px-4 py-3 text-sm text-charcoal/70">
          We&rsquo;re verifying your payment screenshot — you&rsquo;ll be contacted once it&rsquo;s confirmed.
        </p>
      )}
      {order.deliveryMethod === 'delivery' && (
        <p className="mt-2 text-sm text-charcoal/60">We&rsquo;ll call you shortly to arrange delivery timing.</p>
      )}
      <div className="mt-6 flex gap-3">
        <Button href={`/order-confirmation/${order.orderNumber}`} variant="gold">View Order</Button>
        <Button onClick={onDone} variant="outline">Continue Shopping</Button>
      </div>
    </div>
  );
}
