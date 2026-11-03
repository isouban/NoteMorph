import React, { useState } from 'react';
import {
  RotateCw,
  Edit2,
  Trash2,
  Copy,
  Plus,
  Search,
  Filter,
  Sparkles,
  BookOpen,
  Download,
  Shuffle,
  Check,
  X,
  Layers,
  LayoutGrid,
  List,
  Eye,
  RefreshCw,
  Hash,
  Tag,
} from 'lucide-react';
import { Flashcard, Deck, Difficulty } from '../types';
import { FormattedContent } from '../utils/mathRenderer';
import { DeckStats } from './DeckStats';

interface CardGridEditorProps {
  deck: Deck;
  onUpdateDeck: (updated: Deck) => void;
  onStartStudy: () => void;
  onOpenExport: () => void;
  onRefineCardWithAI: (card: Flashcard, instruction: string) => Promise<Flashcard>;
  onGoToGenerator: () => void;
}

export const CardGridEditor: React.FC<CardGridEditorProps> = ({
  deck,
  onUpdateDeck,
  onStartStudy,
  onOpenExport,
  onRefineCardWithAI,
  onGoToGenerator,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  // Editing state for an individual card
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');
  const [editTopic, setEditTopic] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editDifficulty, setEditDifficulty] = useState<Difficulty>('Medium');

  // AI Refine popup state
  const [refiningCardId, setRefiningCardId] = useState<string | null>(null);
  const [refineInstruction, setRefineInstruction] = useState('Make it more concise and atomic');
  const [isRefining, setIsRefining] = useState(false);

  // New card modal/form
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newTopic, setNewTopic] = useState(deck.cards[0]?.topic || 'General');
  const [newTags, setNewTags] = useState('interview, core');
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>('Medium');

  // Extract unique topics for filter
  const topics = Array.from(new Set(deck.cards.map((c) => c.topic).filter(Boolean)));

  // Extract unique tags and calculate frequency counts
  const tagCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    deck.cards.forEach((card) => {
      (card.tags || []).forEach((rawTag) => {
        const cleanTag = rawTag.trim().replace(/^#/, '');
        if (cleanTag) {
          counts[cleanTag] = (counts[cleanTag] || 0) + 1;
        }
      });
    });
    return counts;
  }, [deck.cards]);

  const allTags = React.useMemo(() => {
    return Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);
  }, [tagCounts]);

  // Filter cards
  const filteredCards = deck.cards.filter((card) => {
    const matchesSearch =
      card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.back.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTopic = selectedTopic === 'all' || card.topic === selectedTopic;
    const matchesDifficulty =
      selectedDifficulty === 'all' || card.difficulty === selectedDifficulty;

    const matchesTag =
      selectedTag === 'all' ||
      card.tags.some(
        (t) => t.trim().replace(/^#/, '').toLowerCase() === selectedTag.toLowerCase()
      );

    return matchesSearch && matchesTopic && matchesDifficulty && matchesTag;
  });

  const toggleFlip = (cardId: string) => {
    setFlippedCards((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const flipAllCards = (flipToBack: boolean) => {
    const newState: Record<string, boolean> = {};
    deck.cards.forEach((c) => {
      newState[c.id] = flipToBack;
    });
    setFlippedCards(newState);
  };

  const handleStartEdit = (card: Flashcard) => {
    setEditingCardId(card.id);
    setEditFront(card.front);
    setEditBack(card.back);
    setEditTopic(card.topic);
    setEditTags(card.tags.join(', '));
    setEditDifficulty(card.difficulty);
  };

  const handleSaveEdit = (cardId: string) => {
    const updatedCards = deck.cards.map((c) => {
      if (c.id === cardId) {
        return {
          ...c,
          front: editFront.trim(),
          back: editBack.trim(),
          topic: editTopic.trim() || 'General',
          tags: editTags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          difficulty: editDifficulty,
        };
      }
      return c;
    });
    onUpdateDeck({ ...deck, cards: updatedCards, updatedAt: new Date().toISOString() });
    setEditingCardId(null);
  };

  const handleDeleteCard = (cardId: string) => {
    const updatedCards = deck.cards.filter((c) => c.id !== cardId);
    onUpdateDeck({ ...deck, cards: updatedCards, updatedAt: new Date().toISOString() });
  };

  const handleDuplicateCard = (card: Flashcard) => {
    const duplicated: Flashcard = {
      ...card,
      id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      front: `${card.front} (Copy)`,
    };
    onUpdateDeck({
      ...deck,
      cards: [...deck.cards, duplicated],
      updatedAt: new Date().toISOString(),
    });
  };

  const handleShuffleCards = () => {
    const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
    onUpdateDeck({ ...deck, cards: shuffled, updatedAt: new Date().toISOString() });
  };

  const handleExecuteRefine = async (card: Flashcard) => {
    setIsRefining(true);
    try {
      const refined = await onRefineCardWithAI(card, refineInstruction);
      const updatedCards = deck.cards.map((c) => (c.id === card.id ? refined : c));
      onUpdateDeck({ ...deck, cards: updatedCards, updatedAt: new Date().toISOString() });
      setRefiningCardId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefining(false);
    }
  };

  const handleAddNewCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const newCard: Flashcard = {
      id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      front: newFront.trim(),
      back: newBack.trim(),
      topic: newTopic.trim() || 'General',
      tags: newTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      difficulty: newDifficulty,
    };

    onUpdateDeck({
      ...deck,
      cards: [...deck.cards, newCard],
      updatedAt: new Date().toISOString(),
    });

    setNewFront('');
    setNewBack('');
    setIsAddingNew(false);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Deck Metadata Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Deck Collection</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{deck.cards.length} Cards</span>
            <span aria-hidden="true">·</span>
            <span>Created {new Date(deck.createdAt).toLocaleDateString()}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 font-display">
            {deck.title}
          </h2>
          {deck.summary && (
            <p className="mt-1 text-xs text-slate-600 max-w-2xl leading-relaxed">
              {deck.summary}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onStartStudy}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-xs whitespace-nowrap"
          >
            <BookOpen className="h-4 w-4" />
            <span>Practice Recall Mode</span>
          </button>

          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs whitespace-nowrap"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export (Anki/MD)</span>
          </button>
        </div>
      </div>

      {/* Deck Study Statistics */}
      <DeckStats
        deck={deck}
        onFilterDifficulty={(diff) => setSelectedDifficulty(diff)}
        selectedDifficulty={selectedDifficulty}
      />

      {/* Filter and Action Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search box */}
            <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prompts or answers..."
                className="w-full rounded-md border border-slate-200 bg-slate-50/50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Topic Filter */}
            {topics.length > 0 && (
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Topics ({deck.cards.length})</option>
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* View Mode & Deck Tools */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => flipAllCards(true)}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap"
              title="Reveal all answers"
            >
              Reveal All
            </button>
            <button
              onClick={() => flipAllCards(false)}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap"
              title="Reset to front of cards"
            >
              Hide All
            </button>

            <button
              onClick={handleShuffleCards}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap"
              title="Shuffle card order"
            >
              <Shuffle className="h-3 w-3" />
              <span>Shuffle</span>
            </button>

            <button
              onClick={() => setIsAddingNew(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Card</span>
            </button>

            {/* View toggle */}
            <div className="flex items-center bg-slate-100 rounded-md p-0.5 border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded ${
                  viewMode === 'grid' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-500'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1 rounded ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-500'
                }`}
                title="Table View"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Dedicated Tag Filter Bar */}
        {allTags.length > 0 && (
          <div className="pt-2.5 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-0.5 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold shrink-0 pr-1">
              <Tag className="h-3.5 w-3.5 text-indigo-500" />
              <span>Filter by Tag:</span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTag('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedTag === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Tags ({deck.cards.length})
            </button>

            {allTags.map((tag) => {
              const isSelected = selectedTag.toLowerCase() === tag.toLowerCase();
              const count = tagCounts[tag];
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(isSelected ? 'all' : tag)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                  title={`Filter cards by #${tag} (${count})`}
                >
                  <span>#{tag}</span>
                  <span
                    className={`text-[10px] font-mono tabular-nums ${
                      isSelected ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    ({count})
                  </span>
                  {isSelected && <X className="h-3 w-3 ml-0.5 opacity-80" />}
                </button>
              );
            })}

            {selectedTag !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedTag('all')}
                className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 underline ml-1 whitespace-nowrap shrink-0"
              >
                Clear tag filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Inline Add Card Drawer */}
      {isAddingNew && (
        <form
          onSubmit={handleAddNewCard}
          className="rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/30 p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
              Add New Flashcard to Deck
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prompt / Question (Front)
              </label>
              <textarea
                value={newFront}
                onChange={(e) => setNewFront(e.target.value)}
                placeholder="e.g. What is the Master Theorem condition for Case 1?"
                rows={3}
                className="w-full rounded-md border border-slate-300 p-2 text-xs text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Concise Answer (Back) — LaTeX $math$ allowed
              </label>
              <textarea
                value={newBack}
                onChange={(e) => setNewBack(e.target.value)}
                placeholder="e.g. Leaf dominated case: if $f(n) = \mathcal{O}(n^c)$ where $c < \log_b a$, then $T(n) = \Theta(n^{\log_b a})$."
                rows={3}
                className="w-full rounded-md border border-slate-300 p-2 text-xs text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Topic</label>
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                className="w-full rounded border border-slate-300 p-1.5 text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                className="w-full rounded border border-slate-300 p-1.5 text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Difficulty</label>
              <select
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value as Difficulty)}
                className="w-full rounded border border-slate-300 p-1.5 text-xs bg-white"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-xs"
            >
              Save Card
            </button>
          </div>
        </form>
      )}

      {/* Grid or Table Card Listing */}
      {deck.cards.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center max-w-md mx-auto my-6 space-y-4 shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 font-display">No Flashcards in this Deck</h4>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Transform your notes into atomic cards using the Generator or create custom cards directly.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={onGoToGenerator}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              Open Generator
            </button>
            <button
              onClick={() => setIsAddingNew(true)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Add Card Manually
            </button>
          </div>
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <Layers className="mx-auto h-8 w-8 text-slate-400" />
          <div>
            <h4 className="text-sm font-semibold text-slate-800">No matching flashcards</h4>
            <p className="mt-1 text-xs text-slate-500">
              {selectedTag !== 'all'
                ? `No cards found with tag #${selectedTag}.`
                : searchQuery || selectedTopic !== 'all' || selectedDifficulty !== 'all'
                ? 'Try resetting your active search or filter criteria.'
                : 'Add a new card or regenerate with new notes.'}
            </p>
          </div>
          {(selectedTag !== 'all' || selectedTopic !== 'all' || selectedDifficulty !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedTag('all');
                setSelectedTopic('all');
                setSelectedDifficulty('all');
                setSearchQuery('');
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card, idx) => {
            const isFlipped = !!flippedCards[card.id];
            const isEditing = editingCardId === card.id;
            const isRefiningThis = refiningCardId === card.id;

            return (
              <div
                key={card.id}
                className="rounded-xl border border-slate-200 bg-white shadow-xs hover:shadow-sm transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Header Info */}
                <div className="border-b border-slate-100 px-4 py-2.5 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-slate-400 tabular-nums">#{idx + 1}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-slate-700 truncate">{card.topic}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                        card.difficulty === 'Easy'
                          ? 'bg-emerald-50 text-emerald-700'
                          : card.difficulty === 'Medium'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {card.difficulty}
                    </span>
                  </div>
                </div>

                {/* Card Body - Flipable or Editable */}
                <div className="p-4 flex-1 flex flex-col justify-center min-h-[160px]">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Front (Question)
                        </label>
                        <textarea
                          value={editFront}
                          onChange={(e) => setEditFront(e.target.value)}
                          rows={2}
                          className="w-full rounded border border-slate-300 p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Back (Answer)
                        </label>
                        <textarea
                          value={editBack}
                          onChange={(e) => setEditBack(e.target.value)}
                          rows={3}
                          className="w-full rounded border border-slate-300 p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <select
                          value={editDifficulty}
                          onChange={(e) => setEditDifficulty(e.target.value as Difficulty)}
                          className="rounded border border-slate-300 px-2 py-1 text-xs"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingCardId(null)}
                            className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(card.id)}
                            className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-xs"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => toggleFlip(card.id)}
                      className="cursor-pointer select-none"
                    >
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                        <span>{isFlipped ? 'Answer (Back)' : 'Prompt (Front)'}</span>
                        <span className="text-[10px] text-indigo-500 flex items-center gap-0.5">
                          <RotateCw className="h-3 w-3" />
                          <span>Click to flip</span>
                        </span>
                      </div>

                      <div className="text-sm font-medium text-slate-900">
                        {isFlipped ? (
                          <FormattedContent
                            content={card.back}
                            textClassName="text-slate-700 text-xs leading-relaxed"
                          />
                        ) : (
                          <FormattedContent
                            content={card.front}
                            textClassName="text-slate-900 font-semibold text-sm leading-snug"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* AI Refine Inline Modal */}
                  {isRefiningThis && (
                    <div className="mt-3 p-3 rounded-lg border border-indigo-200 bg-indigo-50/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Refine with AI</span>
                        </span>
                        <button
                          onClick={() => setRefiningCardId(null)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={refineInstruction}
                        onChange={(e) => setRefineInstruction(e.target.value)}
                        placeholder="e.g. Make more concise, or add LaTeX formula..."
                        className="w-full rounded border border-slate-300 p-1.5 text-xs bg-white text-slate-800"
                      />

                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setRefiningCardId(null)}
                          className="px-2 py-1 text-[11px] text-slate-600 rounded hover:bg-slate-200/50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isRefining}
                          onClick={() => handleExecuteRefine(card)}
                          className="px-3 py-1 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-xs flex items-center gap-1"
                        >
                          {isRefining && <RefreshCw className="h-3 w-3 animate-spin" />}
                          <span>Refine</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="border-t border-slate-100 px-4 py-2 bg-slate-50/30 flex items-center justify-between text-xs">
                  {/* Clean unboxed tags with click-to-filter */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate max-w-[200px]">
                    {card.tags.slice(0, 3).map((tag, tIdx) => {
                      const cleanTag = tag.trim().replace(/^#/, '');
                      const isTagActive = selectedTag.toLowerCase() === cleanTag.toLowerCase();
                      return (
                        <React.Fragment key={tag}>
                          {tIdx > 0 && <span aria-hidden="true">·</span>}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTag(isTagActive ? 'all' : cleanTag);
                            }}
                            className={`truncate hover:text-indigo-600 transition-colors ${
                              isTagActive ? 'text-indigo-600 font-semibold underline' : ''
                            }`}
                            title={`Filter cards by #${cleanTag}`}
                          >
                            #{cleanTag}
                          </button>
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setRefiningCardId(refiningCardId === card.id ? null : card.id);
                      }}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 transition-colors"
                      title="Refine card with AI"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(card)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
                      title="Edit card"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicateCard(card)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
                      title="Duplicate card"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors"
                      title="Delete card"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 w-12 text-center">#</th>
                  <th className="py-2.5 px-4 w-1/3">Prompt (Front)</th>
                  <th className="py-2.5 px-4 w-1/3">Answer (Back)</th>
                  <th className="py-2.5 px-3">Topic</th>
                  <th className="py-2.5 px-3">Difficulty</th>
                  <th className="py-2.5 px-3">Tags</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCards.map((card, idx) => (
                  <tr key={card.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-slate-400 tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <FormattedContent content={card.front} />
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <FormattedContent content={card.back} />
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{card.topic}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                          card.difficulty === 'Easy'
                            ? 'bg-emerald-50 text-emerald-700'
                            : card.difficulty === 'Medium'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {card.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        {card.tags.slice(0, 2).map((tag) => {
                          const cleanTag = tag.trim().replace(/^#/, '');
                          const isTagActive = selectedTag.toLowerCase() === cleanTag.toLowerCase();
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => setSelectedTag(isTagActive ? 'all' : cleanTag)}
                              className={`hover:text-indigo-600 transition-colors ${
                                isTagActive ? 'text-indigo-600 font-semibold underline' : ''
                              }`}
                              title={`Filter cards by #${cleanTag}`}
                            >
                              #{cleanTag}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(card)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
