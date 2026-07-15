'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Package, MapPin, Heart, LogOut, Trash2, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import { PageSpinner, EmptyState } from '@/components/ui/Feedback';
import { Input, Field } from '@/components/ui/FormFields';
import { useMe, useMyOrders, useWishlist, useAddAddress, useDeleteAddress, useChangePassword } from '@/lib/hooks';
import { useAuthStore, useToastStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';

const tabs = [
  { key: 'orders', label: 'Orders', icon: Package },
  { key: 'addresses', label: 'Addresses', icon: MapPin },
  { key: 'wishlist', label: 'Wishlist', icon: Heart },
  { key: 'settings', label: 'Settings', icon: Lock },
];

export default function AccountPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const showToast = useToastStore((s) => s.showToast);
  const [tab, setTab] = useState('orders');

  const { data: me, isLoading: meLoading, isError: meError } = useMe();
  const { data: orders, isLoading: ordersLoading } = useMyOrders();
  const { data: wishlist, isLoading: wishlistLoading } = useWishlist();
  const addAddress = useAddAddress();
  const deleteAddress = useDeleteAddress();
  const [newAddress, setNewAddress] = useState({ label: 'Home', fullAddress: '' });
  const changePassword = useChangePassword();
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (!token) router.replace('/login?next=/account');
  }, [token, router]);

  useEffect(() => {
    if (meError) {
      logout();
      router.replace('/login?next=/account');
    }
  }, [meError, logout, router]);

  if (!token || meLoading) return <PageSpinner label="Loading your account…" />;

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.fullAddress.trim()) return;
    try {
      await addAddress.mutateAsync(newAddress);
      showToast('Address saved');
      setNewAddress({ label: 'Home', fullAddress: '' });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showToast('New passwords don\u2019t match', 'error');
      return;
    }
    try {
      await changePassword.mutateAsync(pwForm);
      showToast('Password updated');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(err.message || 'Could not update password', 'error');
    }
  };

  return (
    <div className="container-kal max-w-3xl py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold-dark">My Account</p>
          <h1 className="mt-1 font-display text-2xl text-charcoal">{me?.name}</h1>
          <p className="text-sm text-charcoal/50">{me?.phone}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { logout(); router.push('/'); }}
        >
          <LogOut className="h-4 w-4" /> Log Out
        </Button>
      </div>

      <div className="flex gap-1 border-b border-ink/10">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium ${
              tab === t.key ? 'border-ink text-charcoal' : 'border-transparent text-charcoal/40'
            }`}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'orders' && (
          ordersLoading ? <PageSpinner /> : orders?.length ? (
            <ul className="space-y-3">
              {orders.map((o) => (
                <li key={o._id} className="rounded-xl2 border border-ink/10 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-display text-sm text-charcoal">{o.orderNumber}</p>
                    <span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs capitalize text-charcoal/70">{o.orderStatus}</span>
                  </div>
                  <p className="mt-1 text-xs text-charcoal/50">
                    {new Date(o.createdAt).toLocaleDateString()} · {o.items.length} item(s) · {formatPrice(o.total)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No orders yet" description="Your order history will show up here." action={<Button href="/shop" variant="gold">Shop Now</Button>} />
          )
        )}

        {tab === 'addresses' && (
          <div className="space-y-4">
            {me?.addresses?.length > 0 && (
              <ul className="space-y-2">
                {me.addresses.map((a) => (
                  <li key={a._id} className="flex items-center justify-between rounded-xl2 border border-ink/10 bg-white p-4">
                    <div>
                      <p className="text-sm font-medium text-charcoal">{a.label}</p>
                      <p className="text-xs text-charcoal/60">{a.fullAddress}</p>
                    </div>
                    <button onClick={async () => { await deleteAddress.mutateAsync(a._id); router.refresh(); }} className="text-charcoal/40 hover:text-garnet">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <form onSubmit={handleAddAddress} className="flex flex-col gap-3 rounded-xl2 border border-dashed border-ink/20 p-4">
              <Field label="Label">
                <Input value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} placeholder="Home, Office…" />
              </Field>
              <Field label="Address">
                <Input value={newAddress.fullAddress} onChange={(e) => setNewAddress({ ...newAddress, fullAddress: e.target.value })} placeholder="Full address" />
              </Field>
              <Button type="submit" variant="outline" size="sm" loading={addAddress.isPending}>Save Address</Button>
            </form>
          </div>
        )}

        {tab === 'wishlist' && (
          wishlistLoading ? <PageSpinner /> : wishlist?.length ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {wishlist.map((p) => (
                <Link key={p._id} href={`/product/${p.slug}`} className="block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl2 bg-ink/5">
                    {p.images?.[0]?.url && <Image src={p.images[0].url} alt={p.name} fill sizes="200px" className="object-cover" />}
                  </div>
                  <p className="mt-2 text-sm text-charcoal">{p.name}</p>
                  <p className="text-xs text-charcoal/50">{formatPrice(p.price)}</p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="Your wishlist is empty" description="Tap the heart on any product to save it here." action={<Button href="/shop" variant="gold">Browse Wigs</Button>} />
          )
        )}

        {tab === 'settings' && (
          <form onSubmit={handleChangePassword} className="max-w-sm space-y-4">
            <h3 className="font-display text-lg text-ink">Change Password</h3>
            <Field label="Current password" required>
              <Input type="password" required value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
            </Field>
            <Field label="New password" required hint="At least 6 characters">
              <Input type="password" required minLength={6} value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} />
            </Field>
            <Field label="Confirm new password" required>
              <Input type="password" required value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} />
            </Field>
            <Button type="submit" variant="gold" loading={changePassword.isPending}>Update Password</Button>
          </form>
        )}
      </div>
    </div>
  );
}
