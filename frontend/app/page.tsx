'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') router.push('/admin');
      else if (user.role === 'mentor') router.push('/mentor');
      else router.push('/intern/dashboard');
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);
  
  return (
    <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}