'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin } from 'lucide-react';
import { siteConfig, footerLinks } from '@/lib/siteConfig';
import { usePublicConfig } from '@/lib/hooks';
import StrandFlourish from '@/components/ui/StrandFlourish';

export default function Footer() {
  const { data: config } = usePublicConfig();

  return (
    <footer className="relative overflow-hidden bg-ink text-cream">
      <StrandFlourish tone="current" className="pointer-events-none absolute -top-4 left-0 h-24 w-full text-gold opacity-20" />
      <div className="container-kal relative py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt={siteConfig.name} width={48} height={48} className="rounded-full" />
              <span className="font-display text-xl">{siteConfig.shortName}</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-cream/60">{siteConfig.description}</p>
            <div className="mt-6 space-y-2 text-sm text-cream/70">
              {config?.shopPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gold" /> {config.shopPhone}
                </div>
              )}
              {config?.shopEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gold" /> {config.shopEmail}
                </div>
              )}
              {config?.shopAddress && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gold" /> {config.shopAddress}
                </div>
              )}
            </div>
          </div>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="font-display text-sm uppercase tracking-widest text-gold">{heading}</h4>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-cream/70 transition hover:text-cream">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-cream/10 pt-8 text-xs text-cream/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <p>Made in Addis Ababa 🇪🇹</p>
        </div>
      </div>
    </footer>
  );
}
