'use client';

import { useEffect, useState } from 'react';
import { getApiErrorMessage, getMentorAnalytics } from '@/lib/api';
import type { MentorAnalytics } from '@/types';
import { StatusMessage } from '@/components/ui/StatusMessage';

export default function MentorAnalyticsPage() {
  const [analytics, setAnalytics] = useState<MentorAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const data = await getMentorAnalytics();
        setAnalytics(data);
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Failed to load mentor analytics'));
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  if (loading) return <StatusMessage tone="loading" message="Loading mentor analytics..." className="max-w-sm" />;
  if (error || !analytics) return <StatusMessage tone="error" message={error || 'Failed to load mentor analytics'} className="max-w-md" />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Mentor Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">Managed Interns: {analytics.interns_count}</div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">Total Tasks: {analytics.tasks.total}</div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">Task Completion: {analytics.tasks.completion_rate}%</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">Pending Reviews: {analytics.reports.pending_review}</div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">Reviewed Reports: {analytics.reports.reviewed}</div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">Feedback Entries: {analytics.feedback_count}</div>
      </div>
    </div>
  );
}
