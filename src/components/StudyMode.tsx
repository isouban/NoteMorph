import React, { useState, useEffect, useCallback } from 'react';
import {
  RotateCw,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  HelpCircle,
  Award,
  Sparkles,
  Trophy,
  RefreshCw,
  Download,
  Flame,
  Clock,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Flashcard, RecallRating } from '../types';
import { FormattedContent } from '../utils/mathRenderer';

interface StudyModeProps {
  cards: Flashcard[];
  deckTitle: string;
  onExit: () => void;
  onOpenExport: () => void;
}

export const StudyMode: React.FC<StudyModeProps> = ({
  cards: initialCards,
  deckTitle,
  onExit,
  onOpenExport,
}) => {
  const [studyQueue, setStudyQueue] = useState<Flashcard[]>([...initialCards]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [ratings, setRatings] = useState<Record<string, RecallRating>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  if (initialCards.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs space-y-4 my-12">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <BookOpen className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 font-display">No Cards to Study</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          This deck does not have any flashcards yet. Generate cards from your notes or load a sample topic to begin.
        </p>
        <button
          onClick={onExit}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
        >
          Go to Generator
        </button>
      </div>
    );
  }

  const currentCard = studyQueue[currentIndex];

  // Timer tick
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isCompleted, startTime]);

  // Flip card handler
  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // Rate card handler
  const handleRate = useCallback(
    (rating: RecallRating) => {
      if (!currentCard) return;

      const newRatings = { ...ratings, [currentCard.id]: rating };
      setRatings(newRatings);

      // Update streak
      if (rating === 'Good' || rating === 'Easy') {
        setStreak((s) => {
          const next = s + 1;
          if (next > maxStreak) setMaxStreak(next);
          return next;
        });
      } else {
        setStreak(0);
      }

      // If "Again", put at the end of the queue for re-testing
      if (rating === 'Again') {
        setStudyQueue((prev) => [...prev, currentCard]);
      }

      // Move to next card
      if (currentIndex + 1 < studyQueue.length) {
        setIsFlipped(false);
        setCurrentIndex((i) => i + 1);
      } else {
        setIsCompleted(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    },
    [currentCard, currentIndex, studyQueue, ratings, maxStreak]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted) return;

      // Don't trigger if user is inside an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (isFlipped) {
        if (e.key === '1') handleRate('Again');
        if (e.key === '2') handleRate('Hard');
        if (e.key === '3') handleRate('Good');
        if (e.key === '4') handleRate('Easy');
      } else {
        if (e.key === 'ArrowRight') handleFlip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleRate, isFlipped, isCompleted]);

  // Restudy only missed cards
  const handleRestudyMissed = () => {
    const missed = initialCards.filter(
      (c) => ratings[c.id] === 'Again' || ratings[c.id] === 'Hard'
    );
    if (missed.length > 0) {
      setStudyQueue(missed);
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsCompleted(false);
      setRatings({});
      setStreak(0);
    } else {
      // If no missed, restart all
      handleRestartAll();
    }
  };

  const handleRestartAll = () => {
    setStudyQueue([...initialCards]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
    setRatings({});
    setStreak(0);
  };

  // Completion summary metrics
  const totalReviewed = Object.keys(ratings).length;
  const goodOrEasyCount = Object.values(ratings).filter(
    (r) => r === 'Good' || r === 'Easy'
  ).length;
  const masteryPercentage =
    totalReviewed > 0 ? Math.round((goodOrEasyCount / totalReviewed) * 100) : 100;

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="mx-auto max-w-3xl py-4 sm:py-6 space-y-6">
      {/* Top Header & Control Strip */}
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Exit to Deck Editor</span>
        </button>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-500 tabular-nums">
          <div className="flex items-center gap-1.5" title="Study Duration">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>{timeFormatted}</span>
          </div>

          <div className="flex items-center gap-1.5" title="Current Correct Streak">
            <Flame className={`h-3.5 w-3.5 ${streak > 2 ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
            <span>{streak} Streak</span>
          </div>

          <span className="font-semibold text-slate-700">
            {currentIndex + 1} / {studyQueue.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full bg-indigo-600 transition-all duration-300"
          style={{
            width: `${((currentIndex + (isCompleted ? 1 : 0)) / studyQueue.length) * 100}%`,
          }}
        />
      </div>

      {/* Completed State */}
      {isCompleted ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-sm space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Trophy className="h-8 w-8" />
          </div>

          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
              Recall Drill Completed!
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              You've completed this active recall session for <strong className="text-slate-700">{deckTitle}</strong>.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto py-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="text-[11px] font-medium text-slate-500">Mastery Score</span>
              <div className="text-xl font-bold font-mono text-emerald-600 tabular-nums mt-0.5">
                {masteryPercentage}%
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="text-[11px] font-medium text-slate-500">Cards Tested</span>
              <div className="text-xl font-bold font-mono text-slate-900 tabular-nums mt-0.5">
                {studyQueue.length}
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="text-[11px] font-medium text-slate-500">Time Spent</span>
              <div className="text-xl font-bold font-mono text-slate-900 tabular-nums mt-0.5">
                {timeFormatted}
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="text-[11px] font-medium text-slate-500">Best Streak</span>
              <div className="text-xl font-bold font-mono text-amber-600 tabular-nums mt-0.5">
                {maxStreak}
              </div>
            </div>
          </div>

          {/* Rating breakdown */}
          <div className="flex items-center justify-center gap-4 text-xs text-slate-600">
            <span>Again: {Object.values(ratings).filter((r) => r === 'Again').length}</span>
            <span aria-hidden="true">·</span>
            <span>Hard: {Object.values(ratings).filter((r) => r === 'Hard').length}</span>
            <span aria-hidden="true">·</span>
            <span>Good: {Object.values(ratings).filter((r) => r === 'Good').length}</span>
            <span aria-hidden="true">·</span>
            <span>Easy: {Object.values(ratings).filter((r) => r === 'Easy').length}</span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRestudyMissed}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Review Missed Cards</span>
            </button>

            <button
              onClick={handleRestartAll}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Restart Entire Deck
            </button>

            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export to Anki</span>
            </button>
          </div>
        </div>
      ) : (
        /* Active Card View */
        <div className="space-y-6">
          {/* Main 3D Card Stage */}
          <div
            onClick={handleFlip}
            className="perspective-1000 cursor-pointer min-h-[340px] sm:min-h-[380px] w-full"
          >
            <div
              className={`relative h-full w-full rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between ${
                isFlipped ? 'border-indigo-200 ring-1 ring-indigo-100' : ''
              }`}
            >
              {/* Card Meta Kicker */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-indigo-600 uppercase tracking-wider text-[11px]">
                    {currentCard?.topic}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-slate-400">
                    Difficulty: {currentCard?.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <RotateCw className="h-3 w-3" />
                  <span>Click or press [Space] to flip</span>
                </div>
              </div>

              {/* Card Content Area */}
              <div className="my-auto py-6">
                {!isFlipped ? (
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Prompt / Question
                    </span>
                    <div className="text-lg sm:text-xl font-semibold text-slate-900 leading-snug">
                      <FormattedContent content={currentCard?.front || ''} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                      Answer / Explanation
                    </span>
                    <div className="text-sm sm:text-base text-slate-800 leading-relaxed font-sans">
                      <FormattedContent content={currentCard?.back || ''} />
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footprint */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  {currentCard?.tags.map((t, idx) => (
                    <React.Fragment key={t}>
                      {idx > 0 && <span aria-hidden="true">·</span>}
                      <span>#{t}</span>
                    </React.Fragment>
                  ))}
                </div>

                <span className="text-[11px]">
                  {isFlipped ? 'Rate your recall below' : 'Flip to inspect answer'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Spaced Repetition Buttons */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            {!isFlipped ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Try to recall the definition or formula before flipping.
                </span>
                <button
                  onClick={handleFlip}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>Reveal Answer (Space)</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-center text-xs font-medium text-slate-500 mb-2">
                  How well did you recall this card?
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleRate('Again')}
                    className="p-2.5 rounded-lg border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors flex flex-col items-center justify-center gap-0.5"
                  >
                    <span className="text-xs">Again (1)</span>
                    <span className="text-[10px] font-normal text-rose-600/80">&lt; 1 min</span>
                  </button>

                  <button
                    onClick={() => handleRate('Hard')}
                    className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-amber-700 text-xs font-semibold transition-colors flex flex-col items-center justify-center gap-0.5"
                  >
                    <span className="text-xs">Hard (2)</span>
                    <span className="text-[10px] font-normal text-amber-600/80">10 mins</span>
                  </button>

                  <button
                    onClick={() => handleRate('Good')}
                    className="p-2.5 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors flex flex-col items-center justify-center gap-0.5"
                  >
                    <span className="text-xs">Good (3)</span>
                    <span className="text-[10px] font-normal text-blue-600/80">1 day</span>
                  </button>

                  <button
                    onClick={() => handleRate('Easy')}
                    className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors flex flex-col items-center justify-center gap-0.5"
                  >
                    <span className="text-xs">Easy (4)</span>
                    <span className="text-[10px] font-normal text-emerald-600/80">4 days</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Micro helper tip */}
          <div className="text-center text-[11px] text-slate-400">
            Keyboard shortcuts: <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px]">Space</kbd> to flip · Keys <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px]">1</kbd>–<kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px]">4</kbd> to rate
          </div>
        </div>
      )}
    </div>
  );
};
