import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-4 text-center">
      <p className="font-display text-6xl text-gold">404</p>
      <h1 className="font-display text-2xl text-charcoal">Page not found</h1>
      <p className="max-w-sm text-sm text-charcoal/60">The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.</p>
      <Link href="/" className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream">Back to Home</Link>
    </div>
  );
}
