import React, { useState, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  FileCode,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileUp,
  X,
  Zap,
} from 'lucide-react';
import { SAMPLE_PRESETS } from '../data/samplePresets';
import { StudyDepth } from '../types';

interface InputSectionProps {
  onGenerate: (params: {
    sourceText: string;
    pdfBase64?: string;
    pdfFileName?: string;
    targetCount: number;
    studyDepth: StudyDepth;
    customInstructions?: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onGenerate, isLoading }) => {
  const [sourceText, setSourceText] = useState('');
  const [targetCount, setTargetCount] = useState<number>(10);
  const [studyDepth, setStudyDepth] = useState<StudyDepth>('concepts');
  const [customInstructions, setCustomInstructions] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    base64?: string;
    type: 'pdf' | 'text' | 'markdown';
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0;
  const charCount = sourceText.length;

  const handleFileProcess = (file: File) => {
    setErrorMessage(null);
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.pdf')) {
      if (file.size > 20 * 1024 * 1024) {
        setErrorMessage('PDF file is too large. Please upload files under 20MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setUploadedFile({
          name: file.name,
          size: file.size,
          base64,
          type: 'pdf',
        });
      };
      reader.onerror = () => setErrorMessage('Failed to read PDF file.');
      reader.readAsDataURL(file);
    } else if (fileName.endsWith('.md') || fileName.endsWith('.txt') || fileName.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        setSourceText(text);
        setUploadedFile({
          name: file.name,
          size: file.size,
          type: fileName.endsWith('.md') ? 'markdown' : 'text',
        });
      };
      reader.onerror = () => setErrorMessage('Failed to read text file.');
      reader.readAsText(file);
    } else {
      setErrorMessage('Supported file formats: .pdf, .md, .txt');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = SAMPLE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setSourceText(preset.notes);
      setStudyDepth(preset.depth);
      setUploadedFile(null);
      setErrorMessage(null);
    }
  };

  const handleCleanNoise = () => {
    if (!sourceText.trim()) return;
    // Strip date stamps, meeting headers, zoom links, page markers
    const cleaned = sourceText
      .replace(/^(Date|Time|Location|Meeting|Zoom|Page \d+):.*$/gim, '')
      .replace(/^[\s\-_]{3,}$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    setSourceText(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceText.trim() && !uploadedFile?.base64) {
      setErrorMessage('Please enter note contents or upload a document.');
      return;
    }
    setErrorMessage(null);
    await onGenerate({
      sourceText,
      pdfBase64: uploadedFile?.base64,
      pdfFileName: uploadedFile?.name,
      targetCount,
      studyDepth,
      customInstructions,
    });
  };

  return (
    <div className="mx-auto max-w-5xl">
      {/* Editorial Title & Subtitle */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
          Turn Raw Study Notes into Atomic Flashcards
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
          Paste lecture summaries, reading notes, or upload a PDF. Our engine creates atomic, high-retention cards formatted for Anki, complete with KaTeX math.
        </p>
      </div>

      {/* Sample Study Topics */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Sample Study Topics
          </span>
          <span className="text-xs text-slate-400">Select to load sample notes</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleLoadPreset(preset.id)}
              className="text-left p-3 rounded-lg border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-indigo-600">
                  {preset.category}
                </span>
                <Zap className="h-3.5 w-3.5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
              </div>
              <h4 className="mt-1 text-xs font-semibold text-slate-800 line-clamp-1">
                {preset.title}
              </h4>
              <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Box */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Upload Zone & File Indicator */}
        <div className="p-4 sm:p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-600" />
              <span>Input Study Notes or Document</span>
            </label>

            <div className="flex items-center gap-2">
              {sourceText.trim().length > 0 && (
                <button
                  type="button"
                  onClick={handleCleanNoise}
                  className="text-xs font-medium text-slate-600 hover:text-indigo-600 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                  title="Strip date headers, page numbers and meeting markers"
                >
                  Clean Filler Notes
                </button>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 transition-colors"
              >
                <FileUp className="h-3.5 w-3.5" />
                <span>Upload PDF / MD / TXT</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.md,.txt,.json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
              />
            </div>
          </div>

          {/* Active File Banner if uploaded */}
          {uploadedFile && (
            <div className="mb-3 flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50/60 px-3.5 py-2.5 text-xs text-indigo-900">
              <div className="flex items-center gap-2 truncate">
                <FileCode className="h-4 w-4 text-indigo-600 shrink-0" />
                <span className="font-semibold truncate">{uploadedFile.name}</span>
                <span className="text-indigo-500 shrink-0">
                  ({(uploadedFile.size / 1024).toFixed(1)} KB)
                </span>
                {uploadedFile.type === 'pdf' && (
                  <span className="rounded bg-indigo-200/70 px-1.5 py-0.5 text-[11px] font-medium text-indigo-800">
                    Multimodal PDF attached
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setUploadedFile(null)}
                className="text-indigo-700 hover:text-indigo-900 ml-2"
                title="Remove attached file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Drag & drop / Textarea */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative rounded-lg transition-all ${
              isDragging
                ? 'ring-2 ring-indigo-500 bg-indigo-50/20'
                : 'border border-slate-200 bg-slate-50/30'
            }`}
          >
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Paste raw lecture summaries, markdown notes, technical book excerpts, or interview cheat-sheets here... (or drag & drop a .pdf or .md file)"
              rows={9}
              className="w-full resize-y rounded-lg bg-transparent p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans leading-relaxed"
            />

            {/* Micro stats counter */}
            <div className="flex items-center justify-between px-3.5 py-2 border-t border-slate-100 bg-white/80 text-xs text-slate-500 rounded-b-lg">
              <div className="flex items-center gap-3">
                <span>{wordCount.toLocaleString()} words</span>
                <span aria-hidden="true">·</span>
                <span>{charCount.toLocaleString()} characters</span>
                {charCount > 10000 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-600 font-medium">Large note (chunking active)</span>
                  </>
                )}
              </div>

              <span className="text-slate-400">Standard LaTeX ($math$) supported</span>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Configuration Controls Bar */}
        <div className="p-4 sm:p-6 bg-slate-50/70 border-b border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Target Deck Size */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700">
                  Target Card Count: <span className="text-indigo-600">{targetCount} cards</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {[5, 10, 15, 20, 25].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setTargetCount(count)}
                      className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                        targetCount === count
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={targetCount}
                onChange={(e) => setTargetCount(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>5 (Fast Cram)</span>
                <span>15 (Balanced)</span>
                <span>30 (Deep Mastery)</span>
              </div>
            </div>

            {/* Study Depth Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Study Depth & Cognitive Focus
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  {
                    id: 'concepts',
                    label: 'Core Concepts',
                    desc: 'Mechanisms & architecture',
                  },
                  {
                    id: 'interview',
                    label: 'Interview Cram',
                    desc: 'Trade-offs & high-yield FAQs',
                  },
                  {
                    id: 'granular',
                    label: 'Granular Facts',
                    desc: 'Precise terms & metrics',
                  },
                  {
                    id: 'formulas',
                    label: 'Formulas & Math',
                    desc: 'LaTeX equations & bounds',
                  },
                ].map((depth) => (
                  <button
                    key={depth.id}
                    type="button"
                    onClick={() => setStudyDepth(depth.id as StudyDepth)}
                    className={`text-left p-2 rounded-lg border text-xs transition-all ${
                      studyDepth === depth.id
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-medium shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold">{depth.label}</div>
                    <div className="text-[11px] text-slate-400 truncate">{depth.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Custom Focus Prompt */}
          <div className="mt-4">
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Custom Prompt or Specific Focus (Optional)
            </label>
            <input
              type="text"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="e.g. Prioritize consensus safety invariants and dynamic programming recurrence relations..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Submit & Generate Action */}
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Guaranteed Atomic Cards · Zero Duplication · Anki & KaTeX Ready</span>
          </div>

          <button
            type="submit"
            disabled={isLoading || (!sourceText.trim() && !uploadedFile?.base64)}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all shadow-sm ${
              isLoading || (!sourceText.trim() && !uploadedFile?.base64)
                ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Synthesizing Atomic Flashcards...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate {targetCount} Flashcards</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
