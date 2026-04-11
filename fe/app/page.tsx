'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect to dashboard based on role
        router.push(`/dashboard/${user.role}`);
      } else {
        // Redirect to login
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <main className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-slate-600">Đang tải...</p>
      </div>
    </main>
  );
}
