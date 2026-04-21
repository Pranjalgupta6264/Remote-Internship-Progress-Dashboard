'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import api, { getApiErrorMessage } from '@/lib/api';
import type { Report } from '@/types';
import { StatusMessage } from '@/components/ui/StatusMessage';

export default function MentorReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [message, setMessage] = useState<string | null>(null);
  const [markingReportId, setMarkingReportId] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    try {
      const query = statusFilter === 'all' ? '' : `?status=${statusFilter}`;
      const response = await api.get(`/reports${query}`);
      setReports(response.data);
    } catch (err: unknown) {
      setMessage(getApiErrorMessage(err, 'Failed to load reports'));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    const run = async () => {
      await loadReports();
    };
    void run();
  }, [loadReports]);

  const markReviewed = async (reportId: string) => {
    setMarkingReportId(reportId);
    try {
      await api.post(`/reports/${reportId}/mark-reviewed`);
      setMessage('Report marked as reviewed.');
      await loadReports();
    } catch (err: unknown) {
      setMessage(getApiErrorMessage(err, 'Failed to mark report as reviewed'));
    } finally {
      setMarkingReportId(null);
    }
  };

  if (loading) return <StatusMessage tone="loading" message="Loading reports..." className="max-w-sm" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pending Reports</h2>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900">
          <option value="all">All statuses</option>
          <option value="submitted">Submitted</option>
          <option value="reviewed">Reviewed</option>
        </select>
      </div>
      {message && <StatusMessage tone="info" message={message} />}
      {reports.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-slate-500">No reports found.</div>
      ) : (
        reports.map((report) => (
          <div key={report.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:bg-slate-50 dark:hover:bg-slate-900/40">
            <Link href={`/mentor/reports/${report.id}`} className="block">
              <p className="font-semibold text-slate-900 dark:text-white">Week {report.week_number} Report</p>
              <p className="text-xs text-slate-500 mt-1">Status: {report.status}</p>
            </Link>
            {report.status !== 'reviewed' && (
              <button
                onClick={() => void markReviewed(report.id)}
                disabled={markingReportId === report.id}
                className="mt-3 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {markingReportId === report.id ? 'Marking...' : 'Mark Reviewed'}
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
