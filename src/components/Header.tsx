import React from 'react';
import { Layers, Download, Sparkles, BookOpen, Library, HelpCircle, LayoutDashboard } from 'lucide-react';

interface HeaderProps {
  currentTab: 'dashboard' | 'generator' | 'editor' | 'study' | 'library';
  onSelectTab: (tab: 'dashboard' | 'generator' | 'editor' | 'study' | 'library') => void;
  cardCount: number;
  deckTitle: string;
  onOpenExport: () => void;
  onNewDeck: () => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  cardCount,
  deckTitle,
  onOpenExport,
  onNewDeck,
  onOpenGuide,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single Brand Wordmark */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-indigo-600 transition-colors"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
            <Layers className="h-4 w-4" />
          </span>
          <span className="font-display">SynapseCards</span>
        </button>

        {/* Zone 2: Single-line Navigation Controls */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
              currentTab === 'dashboard'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5 text-indigo-500" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onSelectTab('generator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
              currentTab === 'generator'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span>Generator</span>
          </button>

          <button
            onClick={() => onSelectTab('editor')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
              currentTab === 'editor'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-slate-500" />
            <span>Cards ({cardCount})</span>
          </button>

          <button
            onClick={() => onSelectTab('study')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
              currentTab === 'study'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-emerald-500" />
            <span>Study Recall</span>
          </button>

          <button
            onClick={() => onSelectTab('library')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
              currentTab === 'library'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Library className="h-3.5 w-3.5 text-amber-500" />
            <span>Decks</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
            title="App Overview & Guide"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Guide</span>
          </button>

          {cardCount > 0 && (
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors whitespace-nowrap shrink-0"
              title="Export to Anki, Markdown or JSON"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export Deck</span>
            </button>
          )}

          <button
            onClick={onNewDeck}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <span>+ New Deck</span>
          </button>
        </div>
      </div>
    </header>
  );
};

