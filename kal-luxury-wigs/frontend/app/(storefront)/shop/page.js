import { Suspense } from 'react';
import ShopClient from '@/components/shop/ShopClient';
import { PageSpinner } from '@/components/ui/Feedback';

export const metadata = {
  title: 'Shop All Wigs',
  description: 'Browse human hair and synthetic wigs by texture, lace type, length, colour, and price.',
};

export const dynamic = 'force-dynamic';

export default function ShopPage() {
  return (
    <Suspense fallback={<PageSpinner label="Loading shop…" />}>
      <ShopClient />
    </Suspense>
  );
}
