'use client';

import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { TaskStatus } from '@/types';

interface AnalyticsProps {
  taskStats: { status: TaskStatus; count: number }[];
  activityData: { name: string; reports: number; tasks: number }[];
}

const COLORS = ['#6366f1', '#a855f7', '#f59e0b', '#10b981'];

export function PerformanceAnalytics({ taskStats, activityData }: AnalyticsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Tasks by Status - Pie Chart */}
      <Card title="Tasks by Status" className="lg:col-span-1 border border-slate-200 dark:border-slate-800 p-6 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
          <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
          Task Distribution
        </h3>
        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={taskStats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
                nameKey="status"
              >
                {taskStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Activity Overview - Area Chart */}
      <Card title="Activity Overview" className="lg:col-span-2 border border-slate-200 dark:border-slate-800 p-6 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
          <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
          Weekly Performance
        </h3>
        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#94a3b8' }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#94a3b8' }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="reports" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorReports)" 
              />
              <Area 
                type="monotone" 
                dataKey="tasks" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={0}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
