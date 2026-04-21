'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NewReportRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/intern/reports/submit');
  }, [router]);

  return (
    <div className="p-6 text-slate-500">Redirecting...</div>
  );
}