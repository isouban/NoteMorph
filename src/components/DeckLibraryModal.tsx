import React, { useState } from 'react';
import {
  Library,
  BookOpen,
  Trash2,
  Plus,
  Upload,
  Calendar,
  Layers,
  Check,
  X,
  FileCode,
} from 'lucide-react';
import { Deck } from '../types';

interface DeckLibraryProps {
  decks: Deck[];
  currentDeckId: string;
  onSelectDeck: (deckId: string) => void;
  onDeleteDeck: (deckId: string) => void;
  onCreateNew: () => void;
  onImportDeck: (deck: Deck) => void;
}

export const DeckLibrary: React.FC<DeckLibraryProps> = ({
  decks,
  currentDeckId,
  onSelectDeck,
  onDeleteDeck,
  onCreateNew,
  onImportDeck,
}) => {
  const [importJson, setImportJson] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleProcessImport = () => {
    try {
      setImportError(null);
      const parsed = JSON.parse(importJson);
      if (!parsed.cards || !Array.isArray(parsed.cards)) {
        throw new Error('Invalid deck format: "cards" array is missing.');
      }
      const newDeck: Deck = {
        id: `deck_${Date.now()}`,
        title: parsed.title || 'Imported Deck',
        summary: parsed.summary || 'Imported flashcard collection',
        cards: parsed.cards,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onImportDeck(newDeck);
      setImportJson('');
      setShowImportBox(false);
    } catch (err: any) {
      setImportError(err.message || 'Failed to parse JSON');
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 font-display">
            Your Flashcard Deck Library
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your saved decks, switch between subject matters, or import external JSON decks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportBox((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Upload className="h-3.5 w-3.5 text-slate-500" />
            <span>Import JSON</span>
          </button>

          <button
            onClick={onCreateNew}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Deck</span>
          </button>
        </div>
      </div>

      {/* Import Drawer */}
      {showImportBox && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileCode className="h-4 w-4 text-indigo-600" />
              <span>Import Flashcards from JSON</span>
            </span>
            <button
              onClick={() => setShowImportBox(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <textarea
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            placeholder='Paste exported JSON deck schema here (e.g. { "title": "My Deck", "cards": [...] })...'
            rows={4}
            className="w-full rounded-md border border-slate-300 p-2 text-xs font-mono bg-white text-slate-800"
          />

          {importError && (
            <div className="text-xs text-rose-600 font-medium">{importError}</div>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowImportBox(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleProcessImport}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-xs"
            >
              Load Deck
            </button>
          </div>
        </div>
      )}

      {/* Decks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {decks.map((deck) => {
          const isSelected = deck.id === currentDeckId;
          const sampleTopics = Array.from(new Set(deck.cards.map((c) => c.topic).filter(Boolean)));

          return (
            <div
              key={deck.id}
              className={`rounded-xl border bg-white p-5 shadow-xs transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 ring-1 ring-indigo-500'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-mono tabular-nums">{deck.cards.length} Cards</span>
                  </div>

                  {isSelected && (
                    <span className="rounded bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                      Active Deck
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 line-clamp-1 font-display">
                  {deck.title}
                </h3>

                <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {deck.summary || 'No summary available.'}
                </p>

                {/* Sub-topics */}
                {sampleTopics.length > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                    {sampleTopics.slice(0, 3).map((topic, idx) => (
                      <React.Fragment key={topic}>
                        {idx > 0 && <span aria-hidden="true">·</span>}
                        <span className="truncate">{topic}</span>
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  {new Date(deck.updatedAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-1.5">
                  {decks.length > 1 && (
                    <button
                      onClick={() => onDeleteDeck(deck.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors"
                      title="Delete deck"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => onSelectDeck(deck.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      isSelected
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                    }`}
                  >
                    {isSelected ? 'Open Editor' : 'Select Deck'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
