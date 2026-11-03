import React from 'react';
import {
  Sparkles,
  BookOpen,
  FileSpreadsheet,
  Zap,
  ArrowRight,
  X,
  FileText,
  Layers,
} from 'lucide-react';

interface WelcomeGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreSample: () => void;
}

export const WelcomeGuide: React.FC<WelcomeGuideProps> = ({
  isOpen,
  onClose,
  onExploreSample,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-8">
        {/* Decorative Top Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500" />

        {/* Modal Header */}
        <div className="p-6 sm:p-8 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Sparkles className="h-4 w-4" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  Welcome to SynapseCards
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
                Automated Note-to-Flashcard Studio
              </h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Transform dense class notes, textbook chapters, lecture summaries, or PDF slides into atomic, high-retention study flashcards designed for rapid active-recall exam and interview preparation.
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              title="Close guide"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Core Features Grid */}
        <div className="px-6 sm:px-8 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Core Features
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1">
              <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
                <Layers className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>Atomic Card Engine</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Extracts single-concept prompts on the front with crisp 1–3 sentence answers and LaTeX formulas on the back.
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1">
              <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
                <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Multi-Format Ingestion</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Paste raw notes, drop PDF slides or Markdown files, with automatic noise cleaning to strip administrative filler.
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1">
              <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
                <BookOpen className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Active Recall Study Mode</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Practice with 3D flip cards, spaced repetition scoring (Again, Hard, Good, Easy), and full keyboard navigation.
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1">
              <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
                <FileSpreadsheet className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Direct Anki & Markdown Export</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Download Anki-ready TSV files with HTML formatting, copyable Markdown tables, or standard JSON schemas.
              </p>
            </div>
          </div>
        </div>

        {/* Where to Start Steps */}
        <div className="px-6 sm:px-8 py-4 bg-slate-50/60 border-t border-slate-100 mt-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Where to Start
          </h3>
          <ol className="space-y-2 text-xs text-slate-600">
            <li className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-mono text-[11px] font-bold text-indigo-700">
                1
              </span>
              <span>
                <strong>Add your study notes:</strong> In the <strong>Generator</strong> tab, paste raw lecture text or upload a PDF document.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-mono text-[11px] font-bold text-indigo-700">
                2
              </span>
              <span>
                <strong>Customize settings:</strong> Select your desired card count and study depth (e.g. <em>Core Concepts</em>, <em>Interview Cram</em>, or <em>Formulas</em>).
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-mono text-[11px] font-bold text-indigo-700">
                3
              </span>
              <span>
                <strong>Generate & Practice:</strong> Click <strong>Generate Flashcards</strong> to edit cards, drill in <strong>Study Recall Mode</strong>, or export to Anki.
              </span>
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="p-6 sm:p-8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <button
            onClick={onExploreSample}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Zap className="h-3.5 w-3.5 text-indigo-500" />
            <span>Load Sample Topic (Distributed Systems)</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <span>Start Generating Notes</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
