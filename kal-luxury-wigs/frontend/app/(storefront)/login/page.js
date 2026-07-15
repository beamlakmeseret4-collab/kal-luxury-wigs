import { Suspense } from 'react';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-brand-cream">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}