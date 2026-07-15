import { Suspense } from 'react';
import TrackOrderForm from './TrackOrderForm';

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-brand-cream">Loading...</div>}>
      <TrackOrderForm />
    </Suspense>
  );
}