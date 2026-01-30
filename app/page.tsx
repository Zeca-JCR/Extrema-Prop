'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/admin');
      } else {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-primary-50 text-brand-primary-500">
      <div className="text-center relative">
        <div className="inline-block w-8 h-8 bg-brand-accent-500 animate-pulse shadow-swiss"></div>
        <p className="mt-6 font-bold uppercase tracking-widest text-sm">Carregando_</p>
      </div>
    </div>
  );
}
