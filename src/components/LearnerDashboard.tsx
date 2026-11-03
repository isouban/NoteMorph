import React from 'react';
import {
  Trophy,
  Flame,
  Clock,
  BookOpen,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Zap,
  Plus,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { Deck, Flashcard } from '../types';
import { FormattedContent } from '../utils/mathRenderer';

interface LearnerDashboardProps {
  decks: Deck[];
  activeDeck: Deck;
  onSelectDeck: (deckId: string) => void;
  onStartStudy: (deckId?: string) => void;
  onGoToGenerator: () => void;
  onGoToEditor: () => void;
  onLoadSampleTopic: () => void;
}

export const LearnerDashboard: React.FC<LearnerDashboardProps> = ({
  decks,
  activeDeck,
  onSelectDeck,
  onStartStudy,
  onGoToGenerator,
  onGoToEditor,
  onLoadSampleTopic,
}) => {
  // Aggregate stats across all decks
  const totalCardsAcrossAll = decks.reduce((acc, d) => acc + d.cards.length, 0);

  // Cards that need urgent reinforcement (rated Again or Hard, or Hard difficulty unreviewed)
  const allCards = decks.flatMap((d) =>
    d.cards.map((c) => ({ ...c, deckTitle: d.title, deckId: d.id }))
  );

  const needsAttentionCards = allCards.filter(
    (c) => c.masteryRating === 'Again' || c.masteryRating === 'Hard' || (c.difficulty === 'Hard' && !c.masteryRating)
  );

  const masteredCards = allCards.filter(
    (c) => c.masteryRating === 'Easy' || c.masteryRating === 'Good'
  );

  // Overall readiness score
  const readinessPercentage =
    totalCardsAcrossAll > 0
      ? Math.min(100, Math.round(((masteredCards.length + (totalCardsAcrossAll - needsAttentionCards.length) * 0.7) / totalCardsAcrossAll) * 100))
      : 0;

  // Estimated total study review time (~35s per card)
  const estReviewMinutes = Math.max(1, Math.round((totalCardsAcrossAll * 35) / 60));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Welcome & Exam Prep Readiness Hero */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
              <Trophy className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Learner & Job Seeker Prep Hub
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
            Active Recall & Exam Mastery
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Track your knowledge retention, drill weak spots before interviews, and generate atomic flashcard decks from your study notes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => onStartStudy(activeDeck.id)}
            disabled={activeDeck.cards.length === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white shadow-xs transition-all whitespace-nowrap ${
              activeDeck.cards.length === 0
                ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Start Active Recall Drill</span>
          </button>

          <button
            onClick={onGoToGenerator}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs whitespace-nowrap"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span>+ New Deck from Notes</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Retention Readiness */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">Exam Readiness</span>
              <Trophy className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {totalCardsAcrossAll > 0 ? `${readinessPercentage}%` : '—'}
              </span>
              <span className="text-xs font-semibold text-emerald-600">
                {readinessPercentage >= 75 ? 'Strong' : totalCardsAcrossAll > 0 ? 'Building' : 'New'}
              </span>
            </div>
          </div>
          <div className="mt-3">
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                style={{ width: `${readinessPercentage}%` }}
                className="h-full bg-emerald-500 transition-all duration-500"
              />
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-slate-400">
              <span>{masteredCards.length} Mastered</span>
              <span>Target 85%+</span>
            </div>
          </div>
        </div>

        {/* Needs Attention / Cram Queue */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">Review Queue</span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {needsAttentionCards.length}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>High-Yield & Hard Cards</span>
            <span className="text-amber-600 font-medium">Priority</span>
          </div>
        </div>

        {/* Total Material Scope */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">Study Material</span>
              <Layers className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {totalCardsAcrossAll}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>Across {decks.length} {decks.length === 1 ? 'Deck' : 'Decks'}</span>
            <span className="text-indigo-600 font-medium font-mono tabular-nums">~{estReviewMinutes}m review</span>
          </div>
        </div>

        {/* Active Focus Deck */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">Active Deck</span>
              <Zap className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="text-sm font-bold text-slate-900 truncate mt-0.5" title={activeDeck.title}>
              {activeDeck.title}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-mono tabular-nums">{activeDeck.cards.length} Cards</span>
            <button
              onClick={onGoToEditor}
              className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5"
            >
              <span>Edit Deck</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section: Deck Matrix + Immediate Cram Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Decks & Study Subject Readiness */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FolderOpen className="h-4 w-4 text-indigo-600" />
              <span>Study Subject Decks ({decks.length})</span>
            </h3>
            <button
              onClick={onGoToGenerator}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Topic</span>
            </button>
          </div>

          {decks.length === 0 || (decks.length === 1 && decks[0].cards.length === 0) ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center space-y-3">
              <Layers className="mx-auto h-8 w-8 text-slate-400" />
              <h4 className="text-sm font-semibold text-slate-800">No Study Decks Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Generate your first flashcard deck by pasting lecture notes, or explore sample interview topics.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={onGoToGenerator}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                >
                  Create Deck from Notes
                </button>
                <button
                  onClick={onLoadSampleTopic}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Load Distributed Systems Sample
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {decks.map((deck) => {
                const isActive = deck.id === activeDeck.id;
                const cardCount = deck.cards.length;
                const easy = deck.cards.filter((c) => c.difficulty === 'Easy').length;
                const hard = deck.cards.filter((c) => c.difficulty === 'Hard').length;
                const deckMastery =
                  cardCount > 0
                    ? Math.round(
                        (deck.cards.reduce((acc, c) => {
                          if (c.masteryRating === 'Easy') return acc + 100;
                          if (c.masteryRating === 'Good') return acc + 80;
                          if (c.masteryRating === 'Hard') return acc + 40;
                          return acc + (c.difficulty === 'Easy' ? 90 : c.difficulty === 'Medium' ? 65 : 40);
                        }, 0) /
                          (cardCount * 100)) *
                          100
                      )
                    : 0;

                return (
                  <div
                    key={deck.id}
                    className={`rounded-xl border bg-white p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
                      isActive ? 'border-indigo-600 ring-1 ring-indigo-500/20' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 truncate font-display">
                          {deck.title}
                        </h4>
                        {isActive && (
                          <span className="rounded bg-indigo-50 px-1.5 py-0.2 text-[10px] font-semibold text-indigo-700">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono tabular-nums">{cardCount} Cards</span>
                        <span aria-hidden="true">·</span>
                        <span>{hard} Challenging</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums text-emerald-600">{deckMastery}% Retention</span>
                      </div>

                      {/* Mini Mastery progress */}
                      <div className="h-1 w-48 rounded-full bg-slate-100 overflow-hidden mt-1.5">
                        <div
                          style={{ width: `${deckMastery}%` }}
                          className={`h-full ${deckMastery >= 75 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          onSelectDeck(deck.id);
                          onStartStudy(deck.id);
                        }}
                        className="px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                      >
                        Drill Recall
                      </button>

                      <button
                        onClick={() => {
                          onSelectDeck(deck.id);
                          onGoToEditor();
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
                      >
                        View Cards
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Urgent Cram Focus / Cards Needing Attention */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>Priority Cram Queue</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono tabular-nums">
              {needsAttentionCards.length} items
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            {needsAttentionCards.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
                <h5 className="text-xs font-semibold text-slate-800">Cram Queue Clear!</h5>
                <p className="text-[11px] text-slate-500">
                  No cards currently flagged as Hard or missed. Excellent job staying on top of your recall drills.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {needsAttentionCards.slice(0, 5).map((card) => (
                  <div
                    key={card.id}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-1.5 text-left"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-indigo-600 truncate max-w-[150px]">
                        {card.topic}
                      </span>
                      <span
                        className={`font-medium px-1.5 py-0.2 rounded text-[10px] ${
                          card.difficulty === 'Hard' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {card.masteryRating ? `Recall: ${card.masteryRating}` : card.difficulty}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-900 line-clamp-2 leading-snug">
                      {card.front}
                    </p>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-sans">
                      {card.back}
                    </p>
                  </div>
                ))}

                {needsAttentionCards.length > 5 && (
                  <div className="text-center text-[11px] text-slate-400 py-1">
                    +{needsAttentionCards.length - 5} more cards in queue
                  </div>
                )}

                <button
                  onClick={() => onStartStudy(activeDeck.id)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Drill Active Deck Weak Points</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
