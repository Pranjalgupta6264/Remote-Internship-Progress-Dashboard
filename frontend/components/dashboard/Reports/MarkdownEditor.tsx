'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { Send, Loader2, Eye, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

type ViewMode = 'live' | 'preview' | 'edit';

interface MarkdownEditorProps {
  initialValue: string;
  onSubmit: (content: string) => Promise<void> | void;
}

export function MarkdownEditor({ initialValue, onSubmit }: MarkdownEditorProps) {
  const [value, setValue] = useState<string | undefined>(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('live');

  const handleSubmit = async () => {
    if (!value) return;
    setIsSubmitting(true);
    try {
      await onSubmit(value);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {[
            { id: 'edit', label: 'Edit', icon: Edit3 },
            { id: 'live', label: 'Split', icon: Send }, // placeholder icon
            { id: 'preview', label: 'Preview', icon: Eye }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as ViewMode)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                viewMode === mode.id 
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              <mode.icon className="w-3.5 h-3.5" />
              {mode.label}
            </button>
          ))}
        </div>

        <button 
          onClick={handleSubmit}
          disabled={isSubmitting || !value}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Submit Reflection
        </button>
      </div>

      {/* Editor Instance */}
      <div className="flex-1 overflow-hidden" data-color-mode="light">
        <MDEditor
          value={value}
          onChange={setValue}
          preview={viewMode}
          height="100%"
          className="rounded-none border-none"
          visibleDragbar={false}
          style={{ 
            backgroundColor: 'transparent',
            height: '100%'
          }}
          previewOptions={{
             disallowedElements: ['script'],
          }}
        />
      </div>

      <style jsx global>{`
        .w-md-editor {
          box-shadow: none !important;
          border: none !important;
        }
        .w-md-editor-toolbar {
          display: none !important;
        }
        .w-md-editor-content {
          background-color: transparent !important;
        }
        .dark .w-md-editor {
           background-color: #0f172a !important;
           color: #f8fafc !important;
        }
        .dark .wmde-markdown {
           background-color: transparent !important;
           color: #cbd5e1 !important;
        }
        [data-color-mode='light'] .w-md-editor {
          --color-canvas-default: transparent !important;
        }
      `}</style>
    </div>
  );
}
