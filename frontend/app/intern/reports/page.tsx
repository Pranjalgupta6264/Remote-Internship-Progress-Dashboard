'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Report } from '@/types';
import Link from 'next/link';
import { StatusMessage } from '@/components/ui/StatusMessage';

export default function InternReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const response = await api.get('/reports');
        setReports(response.data);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  if (loading) return <StatusMessage tone="loading" message="Loading reports..." className="max-w-sm" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Reports</h2>
        <Link href="/intern/reports/submit" className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Submit New Report
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">Total: {reports.length}</div>
        <div className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">Submitted: {reports.filter((r) => r.status === 'submitted').length}</div>
        <div className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">Reviewed: {reports.filter((r) => r.status === 'reviewed').length}</div>
      </div>
      {reports.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-slate-500">No reports submitted yet.</div>
      ) : (
        reports.map((report) => (
          <div key={report.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <p className="font-semibold text-slate-900 dark:text-white">Week {report.week_number}</p>
            <p className="text-xs text-slate-500 mt-1">Status: {report.status}</p>
          </div>
        ))
      )}
    </div>
  );
}
