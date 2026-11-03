import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileSpreadsheet,
  FileText,
  Code,
  Info,
} from 'lucide-react';
import { Deck } from '../types';
import {
  exportToAnkiTsv,
  generateMarkdownCards,
  generateMarkdownTable,
  exportDeckToJson,
} from '../utils/exporters';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck: Deck;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, deck }) => {
  const [activeFormat, setActiveFormat] = useState<'anki' | 'markdown' | 'json'>('anki');
  const [mdStyle, setMdStyle] = useState<'cards' | 'table'>('cards');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const markdownText =
    mdStyle === 'cards'
      ? generateMarkdownCards(deck.cards, deck.title)
      : generateMarkdownTable(deck.cards);

  const jsonText = JSON.stringify(deck, null, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Export Flashcards: {deck.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose your target format for Anki, Markdown, or JSON.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Format Selector Tabs */}
        <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-2.5 flex items-center gap-2">
          <button
            onClick={() => setActiveFormat('anki')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFormat === 'anki'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Anki (.tsv / .csv)</span>
          </button>

          <button
            onClick={() => setActiveFormat('markdown')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFormat === 'markdown'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Markdown</span>
          </button>

          <button
            onClick={() => setActiveFormat('json')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFormat === 'json'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="h-4 w-4" />
            <span>JSON Payload</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeFormat === 'anki' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 text-xs text-indigo-950 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-indigo-900">
                  <Info className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span>How to Import into Anki</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-700">
                  <li>Click <strong>Download Anki TSV</strong> below.</li>
                  <li>Open Anki on your computer and select <strong>File → Import</strong>.</li>
                  <li>Select the downloaded <code className="font-mono bg-white px-1 py-0.5 rounded border border-indigo-200">.tsv</code> file.</li>
                  <li>Ensure Field 1 maps to <strong>Front</strong>, Field 2 to <strong>Back</strong>, and Field 3 to <strong>Tags</strong>.</li>
                </ol>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span>File Preview ({deck.cards.length} cards with HTML line-break formatting)</span>
                </div>
                <div className="max-h-52 overflow-x-auto rounded-lg border border-slate-200 bg-slate-900 p-3 font-mono text-[11px] text-slate-200 leading-relaxed">
                  #separator:tab<br />
                  #html:true<br />
                  #tags column:3<br />
                  {deck.cards.slice(0, 5).map((c, i) => (
                    <div key={i} className="truncate py-0.5">
                      {c.front} {'\t'} {c.back.slice(0, 40)}... {'\t'} {c.tags.join(' ')}
                    </div>
                  ))}
                  {deck.cards.length > 5 && (
                    <div className="text-slate-400 italic">... and {deck.cards.length - 5} more cards</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeFormat === 'markdown' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Style:</span>
                  <button
                    onClick={() => setMdStyle('cards')}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      mdStyle === 'cards'
                        ? 'bg-slate-200 text-slate-800'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Question Cards
                  </button>
                  <button
                    onClick={() => setMdStyle('table')}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      mdStyle === 'table'
                        ? 'bg-slate-200 text-slate-800'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Summary Table
                  </button>
                </div>

                <button
                  onClick={() => handleCopy(markdownText)}
                  className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                </button>
              </div>

              <textarea
                readOnly
                value={markdownText}
                rows={10}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-800 focus:outline-none"
              />
            </div>
          )}

          {activeFormat === 'json' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Standard structured JSON schema (ideal for mobile apps & database storage).
                </span>
                <button
                  onClick={() => handleCopy(jsonText)}
                  className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                </button>
              </div>

              <textarea
                readOnly
                value={jsonText}
                rows={10}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-800 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {deck.cards.length} cards ready to export
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Close
            </button>

            {activeFormat === 'anki' && (
              <button
                onClick={() => exportToAnkiTsv(deck.cards, deck.title)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
              >
                <Download className="h-4 w-4" />
                <span>Download Anki TSV</span>
              </button>
            )}

            {activeFormat === 'markdown' && (
              <button
                onClick={() => handleCopy(markdownText)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
              </button>
            )}

            {activeFormat === 'json' && (
              <button
                onClick={() => exportDeckToJson(deck)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
              >
                <Download className="h-4 w-4" />
                <span>Download JSON</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
