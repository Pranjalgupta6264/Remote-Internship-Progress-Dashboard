'use client';

import { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '@/lib/api';
import type { Feedback } from '@/types';
import { StatusMessage } from '@/components/ui/StatusMessage';

export default function MentorFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const response = await api.get('/feedback');
        setFeedback(response.data);
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Failed to load feedback'));
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  if (loading) return <StatusMessage tone="loading" message="Loading feedback..." className="max-w-sm" />;
  if (error) return <StatusMessage tone="error" message={error} className="max-w-md" />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Feedback History</h2>
      {feedback.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-slate-500">No feedback entries.</div>
      ) : (
        feedback.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <p className="text-sm text-slate-700 dark:text-slate-300">{item.comment}</p>
            <p className="text-xs text-slate-500 mt-2">Rating: {item.rating}/5</p>
          </div>
        ))
      )}
    </div>
  );
}
