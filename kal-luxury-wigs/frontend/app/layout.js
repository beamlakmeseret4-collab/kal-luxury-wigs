import { Fraunces, Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import Toaster from '@/components/layout/Toaster';
import { siteConfig } from '@/lib/siteConfig';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz', 'SOFT', 'WONK'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icon-180.png',
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    images: ['/icon-512.png'],
    locale: 'en_US',
    type: 'website',
  },
};

export const viewport = {
  themeColor: '#14100D',
};

// Root layout is intentionally minimal: it wraps BOTH the storefront
// (app/(storefront)/layout.js — Header/Footer/Cart) and the admin
// dashboard (app/admin/layout.js — sidebar nav), so it only holds what
// truly belongs on every single page.
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
