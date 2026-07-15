import { siteConfig } from '@/lib/siteConfig';

export const metadata = { title: 'About Us' };

export default function AboutPage() {
  return (
    <div className="container-kal max-w-2xl py-16">
      <p className="text-xs uppercase tracking-widest text-gold-dark">Our Story</p>
      <h1 className="mt-2 font-display text-3xl text-charcoal">About {siteConfig.name}</h1>
      <div className="prose prose-sm mt-6 max-w-none space-y-4 text-charcoal/70">
        <p>
          {siteConfig.name} is a wig shop based in Addis Ababa, offering human hair and synthetic wigs
          across every texture, lace type, and length — from everyday wear to bridal and occasion pieces.
        </p>
        <p>
          Replace this paragraph with your own story: how you started, what you care about when
          sourcing hair, and what customers can expect when they order from you.
        </p>
      </div>
    </div>
  );
}
