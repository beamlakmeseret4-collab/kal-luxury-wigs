import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function ProductNotFound() {
  return (
    <div className="container-kal flex min-h-[50vh] flex-col items-center justify-center gap-4 py-20 text-center">
      <h1 className="font-display text-2xl text-charcoal">We couldn&rsquo;t find that wig</h1>
      <p className="max-w-sm text-sm text-charcoal/60">
        It may have sold out or been renamed. Explore the full collection instead.
      </p>
      <Button href="/shop" variant="gold">Browse All Wigs</Button>
    </div>
  );
}
