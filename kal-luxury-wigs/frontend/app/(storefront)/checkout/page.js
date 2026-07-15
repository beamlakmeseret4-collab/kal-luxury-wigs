import CheckoutWizard from '@/components/checkout/CheckoutWizard';

export const metadata = { title: 'Checkout' };
export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
  return <CheckoutWizard />;
}
