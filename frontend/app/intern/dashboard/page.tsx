'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InternDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/intern');
  }, [router]);

  return <div className="p-6 text-slate-500">Redirecting...</div>;
}