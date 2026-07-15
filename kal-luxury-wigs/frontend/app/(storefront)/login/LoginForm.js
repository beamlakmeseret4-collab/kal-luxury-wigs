'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, UserPlus } from 'lucide-react';
import { Input, Field } from '@/components/ui/FormFields';
import Button from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Feedback';
import { useAuth } from '@/lib/hooks';
import { formatPrice } from '@/lib/utils';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login, register: registerUser, isLoading } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', password: '' });
  const [error, setError] = useState('');

  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await registerUser(form);
      } else {
        await login({ phone: form.phone, password: form.password });
      }
      router.push(redirect);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-3xl font-serif text-brand-gold mb-2 text-center">
        {isRegister ? 'Create Account' : 'Welcome Back'}
      </h1>
      <p className="text-brand-cream/60 text-center mb-8">
        {isRegister ? 'Join Kal Luxury Wig Shop' : 'Sign in to your account'}
      </p>

      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {isRegister && (
          <Field label="Full Name">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </Field>
        )}

        <Field label="Phone Number">
          <Input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="09xxxxxxxx"
            required
          />
        </Field>

        <Field label="Password">
          <Input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </Field>

        <Button type="submit" fullWidth>
          {isRegister ? (
            <><UserPlus className="w-4 h-4 mr-2" /> Create Account</>
          ) : (
            <><LogIn className="w-4 h-4 mr-2" /> Sign In</>
          )}
        </Button>
      </form>

      <p className="text-center mt-6 text-brand-cream/60">
        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="text-brand-gold hover:underline"
        >
          {isRegister ? 'Sign In' : 'Create one'}
        </button>
      </p>
    </div>
  );
}