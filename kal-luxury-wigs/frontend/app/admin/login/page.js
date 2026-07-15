'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogIn } from 'lucide-react';
import { Input, Field } from '@/components/ui/FormFields';
import Button from '@/components/ui/Button';
import { useLogin } from '@/lib/hooks';
import { useAuthStore, useToastStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();
  const authLogin = useAuthStore((s) => s.login);
  const showToast = useToastStore((s) => s.showToast);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login.mutateAsync({ phone, password });
      if (res.user.role !== 'admin') {
        showToast('This account does not have admin access.', 'error');
        return;
      }
      authLogin(res.token, res.user);
      router.push('/admin');
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm rounded-2xl bg-cream p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/logo.png" alt="Kal Luxury Wig Shop" width={56} height={56} className="rounded-full" />
          <h1 className="mt-4 font-display text-xl text-ink">Admin Dashboard</h1>
          <p className="mt-1 text-xs text-charcoal/50">Sign in to manage orders, products, and banners.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Phone number" required>
            <Input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09XXXXXXXX" autoFocus />
          </Field>
          <Field label="Password" required>
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <Button type="submit" variant="gold" fullWidth loading={login.isPending} icon={LogIn}>
            Sign In
          </Button>
        </form>
        <p className="mt-6 text-center text-[11px] text-charcoal/40">
          No account yet? Run <code className="rounded bg-ink/5 px-1 py-0.5">npm run create-admin</code> in the backend first.
        </p>
      </div>
    </div>
  );
}
