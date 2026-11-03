import React from 'react';
import { Layers, Target, Clock, Calendar, CheckCircle, BarChart3 } from 'lucide-react';
import { Deck, Difficulty } from '../types';

interface DeckStatsProps {
  deck: Deck;
  onFilterDifficulty?: (difficulty: string) => void;
  selectedDifficulty?: string;
}

export const DeckStats: React.FC<DeckStatsProps> = ({
  deck,
  onFilterDifficulty,
  selectedDifficulty = 'all',
}) => {
  const totalCards = deck.cards.length;

  if (totalCards === 0) {
    return null;
  }

  // Count by difficulty
  const easyCount = deck.cards.filter((c) => c.difficulty === 'Easy').length;
  const mediumCount = deck.cards.filter((c) => c.difficulty === 'Medium').length;
  const hardCount = deck.cards.filter((c) => c.difficulty === 'Hard').length;

  // Calculate Mastery Level based on difficulty tags & recall ratings
  // Easy: 100 pts, Medium: 70 pts, Hard: 40 pts
  // If user reviewed in Study Mode, factor in actual recall performance:
  // Easy: 100%, Good: 85%, Hard: 50%, Again: 20%
  const totalScore = deck.cards.reduce((acc, card) => {
    if (card.masteryRating) {
      switch (card.masteryRating) {
        case 'Easy':
          return acc + 100;
        case 'Good':
          return acc + 85;
        case 'Hard':
          return acc + 50;
        case 'Again':
          return acc + 20;
      }
    }
    // Base difficulty weighting
    switch (card.difficulty) {
      case 'Easy':
        return acc + 100;
      case 'Medium':
        return acc + 70;
      case 'Hard':
        return acc + 40;
      default:
        return acc + 70;
    }
  }, 0);

  const maxPossible = totalCards * 100;
  const masteryPercentage = Math.round((totalScore / maxPossible) * 100);

  // Mastery tier label
  let masteryTier = 'Developing';
  let tierColor = 'text-amber-600';
  let barColor = 'bg-amber-500';

  if (masteryPercentage >= 85) {
    masteryTier = 'High Mastery';
    tierColor = 'text-emerald-600';
    barColor = 'bg-emerald-500';
  } else if (masteryPercentage >= 70) {
    masteryTier = 'Proficient';
    tierColor = 'text-indigo-600';
    barColor = 'bg-indigo-600';
  } else if (masteryPercentage >= 50) {
    masteryTier = 'Balanced';
    tierColor = 'text-blue-600';
    barColor = 'bg-blue-500';
  } else {
    masteryTier = 'Challenging Focus';
    tierColor = 'text-rose-600';
    barColor = 'bg-rose-500';
  }

  // Format Last Modified Date
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Recently';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const formattedModified = formatDate(deck.updatedAt);
  const fullDateTime = deck.updatedAt ? new Date(deck.updatedAt).toLocaleString() : '';

  // Estimated review duration (~35 seconds per atomic card)
  const estMinutes = Math.max(1, Math.round((totalCards * 35) / 60));

  // Count unique topics
  const uniqueTopics = new Set(deck.cards.map((c) => c.topic).filter(Boolean)).size;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-indigo-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Study & Deck Analytics
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">
          Real-time metrics for active deck
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Total Cards */}
        <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">Total Cards</span>
              <Layers className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {totalCards}
            </div>
          </div>

          <div className="mt-2.5 space-y-1.5">
            {/* Proportional difficulty bar */}
            <div className="h-1.5 w-full flex rounded-full overflow-hidden bg-slate-200">
              {easyCount > 0 && (
                <div
                  style={{ width: `${(easyCount / totalCards) * 100}%` }}
                  className="bg-emerald-500 h-full transition-all"
                  title={`${easyCount} Easy`}
                />
              )}
              {mediumCount > 0 && (
                <div
                  style={{ width: `${(mediumCount / totalCards) * 100}%` }}
                  className="bg-amber-400 h-full transition-all"
                  title={`${mediumCount} Medium`}
                />
              )}
              {hardCount > 0 && (
                <div
                  style={{ width: `${(hardCount / totalCards) * 100}%` }}
                  className="bg-rose-500 h-full transition-all"
                  title={`${hardCount} Hard`}
                />
              )}
            </div>

            {/* Difficulty breakdown buttons */}
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <button
                type="button"
                onClick={() => onFilterDifficulty && onFilterDifficulty(selectedDifficulty === 'Easy' ? 'all' : 'Easy')}
                className={`hover:text-emerald-700 transition-colors ${selectedDifficulty === 'Easy' ? 'font-bold text-emerald-700 underline' : ''}`}
              >
                <span className="font-mono tabular-nums">{easyCount}</span> Easy
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => onFilterDifficulty && onFilterDifficulty(selectedDifficulty === 'Medium' ? 'all' : 'Medium')}
                className={`hover:text-amber-700 transition-colors ${selectedDifficulty === 'Medium' ? 'font-bold text-amber-700 underline' : ''}`}
              >
                <span className="font-mono tabular-nums">{mediumCount}</span> Med
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => onFilterDifficulty && onFilterDifficulty(selectedDifficulty === 'Hard' ? 'all' : 'Hard')}
                className={`hover:text-rose-700 transition-colors ${selectedDifficulty === 'Hard' ? 'font-bold text-rose-700 underline' : ''}`}
              >
                <span className="font-mono tabular-nums">{hardCount}</span> Hard
              </button>
            </div>
          </div>
        </div>

        {/* Metric 2: Mastery Level */}
        <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">Mastery Level</span>
              <Target className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {masteryPercentage}%
              </span>
              <span className={`text-xs font-semibold ${tierColor}`}>
                {masteryTier}
              </span>
            </div>
          </div>

          <div className="mt-2.5 space-y-1">
            <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                style={{ width: `${masteryPercentage}%` }}
                className={`h-full ${barColor} transition-all duration-500`}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Weighted by difficulty</span>
              <span>100% Target</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Last Modified */}
        <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">Last Modified</span>
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <div className="text-lg font-bold text-slate-900 leading-tight mt-1" title={fullDateTime}>
              {formattedModified}
            </div>
          </div>

          <div className="mt-2 text-[11px] text-slate-500 truncate" title={fullDateTime}>
            {fullDateTime ? new Date(deck.updatedAt).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            }) : 'Deck saved'}
          </div>
        </div>

        {/* Metric 4: Review Readiness */}
        <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">Review Session</span>
              <Clock className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <div className="text-lg font-bold font-mono text-slate-900 tabular-nums mt-1">
              ~{estMinutes} {estMinutes === 1 ? 'min' : 'mins'}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>{uniqueTopics} {uniqueTopics === 1 ? 'Topic' : 'Topics'}</span>
            <span aria-hidden="true">·</span>
            <span className="text-indigo-600 font-medium">Anki Export Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
