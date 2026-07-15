'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Package, ShoppingBag, Image as ImageIcon, LogOut, ExternalLink } from 'lucide-react';
import { useAuthStore, useToastStore } from '@/lib/store';
import { useAdminRealtimeOrders } from '@/lib/hooks';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const showToast = useToastStore((s) => s.showToast);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage && (!token || user?.role !== 'admin')) {
      router.replace('/admin/login');
    }
  }, [token, user, isLoginPage, router]);

  useAdminRealtimeOrders({
    onNewOrder: (order) => showToast(`🛍️ New order ${order.orderNumber} — ETB ${order.total}`),
  });

  if (isLoginPage) return <>{children}</>;
  if (!token || user?.role !== 'admin') return null;

  return (
    <div className="flex min-h-screen bg-[#F3EFE6]">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-ink/10 bg-ink text-cream lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-6">
          <Image src="/logo.png" alt="" width={32} height={32} className="rounded-full" />
          <span className="font-display text-sm">Kal Admin</span>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active ? 'bg-gold text-ink font-medium' : 'text-cream/70 hover:bg-cream/5'
                }`}
              >
                <item.icon className="h-4 w-4" /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-1 border-t border-cream/10 p-3">
          <Link href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-cream/60 hover:bg-cream/5">
            <ExternalLink className="h-4 w-4" /> View Store
          </Link>
          <button
            onClick={() => { logout(); router.push('/admin/login'); }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-cream/60 hover:bg-cream/5"
          >
            <LogOut className="h-4 w-4" /> Log Out
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
        <header className="flex items-center justify-between border-b border-ink/10 bg-cream px-5 py-3 lg:hidden">
          <span className="font-display text-sm text-ink">Kal Admin</span>
          <div className="flex gap-3 text-xs">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={pathname === item.href ? 'font-semibold text-ink' : 'text-charcoal/50'}>
                {item.label}
              </Link>
            ))}
          </div>
        </header>
        <main className="flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
