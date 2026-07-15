'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, UserPlus } from 'lucide-react';
import { Input, Field } from '@/components/ui/FormFields';
import Button from '@/components/ui/Button';
import { useLogin, useRegister } from '@/lib/hooks';
import { useAuthStore, useToastStore } from '@/lib/store';



export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' });

  const login = useLogin();
  const register = useRegister();
  const authLogin = useAuthStore((s) => s.login);
  const showToast = useToastStore((s) => s.showToast);

  const pending = login.isPending || register.isPending;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = mode === 'login'
        ? await login.mutateAsync({ phone: form.phone, password: form.password })
        : await register.mutateAsync(form);
      authLogin(res.token, res.user);
      showToast(mode === 'login' ? 'Welcome back!' : 'Account created!');
      router.push(searchParams.get('next') || '/account');
    } catch (err) {
      showToast(err.message || 'Something went wrong', 'error');
    }
  };

  return (
    <div className="container-kal flex min-h-[70vh] max-w-md flex-col justify-center py-16">
      <h1 className="font-display text-2xl text-charcoal">
        {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
      </h1>
      <p className="mt-2 text-sm text-charcoal/60">
        {mode === 'login' ? 'Log in to view your orders and saved addresses.' : 'Save your details for faster checkout next time.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {mode === 'register' && (
          <Field label="Full name" required>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
        )}
        <Field label="Phone number" required>
          <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="09XXXXXXXX" />
        </Field>
        {mode === 'register' && (
          <Field label="Email (optional)">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
        )}
        <Field label="Password" required>
          <Input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>

        <Button type="submit" variant="gold" fullWidth loading={pending}>
          {mode === 'login' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
          {mode === 'login' ? 'Log In' : 'Create Account'}
        </Button>
      </form>

      <button
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        className="mt-5 text-center text-sm text-gold-dark underline"
      >
        {mode === 'login' ? "New here? Create an account" : 'Already have an account? Log in'}
      </button>

      <button
        onClick={() => router.push('/checkout')}
        className="mt-2 text-center text-xs text-charcoal/50 underline"
      >
        Skip and continue as guest
      </button>
    </div>
  );
}
