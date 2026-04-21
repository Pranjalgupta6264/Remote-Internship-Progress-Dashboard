'use client';

import React, { useState } from 'react';
import { MarkdownEditor } from '@/components/dashboard/Reports/MarkdownEditor';
import { Card } from '@/components/ui/Card';
import api, { getApiErrorMessage } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function SubmitReportPage() {
  const [week, setWeek] = useState(1);
  const router = useRouter();

  const handleSubmit = async (content: string) => {
    try {
      await api.post('/reports', {
        week_number: week,
        markdown_content: content
      });
      toast.success('Report submitted successfully!');
      router.push('/intern');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to submit report. Please try again.'));
    }
  };

  return (
    <div className="space-y-6">
        <section>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Submit Weekly Report</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Reflect on your achievements and learning for the week.</p>
        </section>

        <Card className="max-w-4xl border-none shadow-sm h-[calc(100vh-16rem)]">
          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Select Week:</label>
            <select 
              value={week}
              onChange={(e) => setWeek(Number(e.target.value))}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(w => (
                <option key={w} value={w}>Week {w}</option>
              ))}
            </select>
          </div>

          <div className="h-[calc(100%-4rem)]">
            <MarkdownEditor 
              onSubmit={handleSubmit}
              initialValue="# Weekly Progress Report\n\n### Achievements\n- \n\n### Learning Outcomes\n- \n\n### Challenges Faced\n- \n"
            />
          </div>
        </Card>
    </div>
  );
}
