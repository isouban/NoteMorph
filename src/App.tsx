import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { CardGridEditor } from './components/CardGridEditor';
import { StudyMode } from './components/StudyMode';
import { ExportModal } from './components/ExportModal';
import { DeckLibrary } from './components/DeckLibraryModal';
import { WelcomeGuide } from './components/WelcomeGuide';
import { LearnerDashboard } from './components/LearnerDashboard';
import { Deck, Flashcard, StudyDepth } from './types';
import { INITIAL_DECK } from './data/initialDeck';
import { Check, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'synapsecards_decks_v2';
const ACTIVE_DECK_KEY = 'synapsecards_active_deck_v2';
const ONBOARDING_KEY = 'synapsecards_onboarding_completed_v1';

const DEFAULT_EMPTY_DECK: Deck = {
  id: 'deck_default',
  title: 'My Study Deck',
  summary: 'Your flashcard collection',
  cards: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function App() {
  const [decks, setDecks] = useState<Deck[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  const [currentDeckId, setCurrentDeckId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_DECK_KEY);
      if (savedId) return savedId;
    } catch {}
    return '';
  });

  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    try {
      return !localStorage.getItem(ONBOARDING_KEY);
    } catch {
      return true;
    }
  });

  const [currentTab, setCurrentTab] = useState<'dashboard' | 'generator' | 'editor' | 'study' | 'library'>('dashboard');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
    } catch {}
  }, [decks]);

  useEffect(() => {
    try {
      if (currentDeckId) {
        localStorage.setItem(ACTIVE_DECK_KEY, currentDeckId);
      }
    } catch {}
  }, [currentDeckId]);

  const activeDeck = decks.find((d) => d.id === currentDeckId) || decks[0] || DEFAULT_EMPTY_DECK;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleDismissWelcome = () => {
    setShowWelcome(false);
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {}
  };

  const handleLoadSampleDeck = () => {
    const existing = decks.find((d) => d.id === INITIAL_DECK.id);
    if (!existing) {
      setDecks((prev) => [INITIAL_DECK, ...prev]);
    }
    setCurrentDeckId(INITIAL_DECK.id);
    handleDismissWelcome();
    setCurrentTab('editor');
    showToast('Loaded Distributed Systems sample deck!');
  };

  const handleUpdateActiveDeck = (updatedDeck: Deck) => {
    setDecks((prev) => {
      const exists = prev.some((d) => d.id === updatedDeck.id);
      if (exists) {
        return prev.map((d) => (d.id === updatedDeck.id ? updatedDeck : d));
      }
      return [updatedDeck, ...prev];
    });
  };

  const handleGenerateCards = async (params: {
    sourceText: string;
    pdfBase64?: string;
    pdfFileName?: string;
    targetCount: number;
    studyDepth: StudyDepth;
    customInstructions?: string;
  }) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceText: params.sourceText,
          pdfBase64: params.pdfBase64,
          targetCount: params.targetCount,
          studyDepth: params.studyDepth,
          customInstructions: params.customInstructions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate flashcards. Please check your notes and try again.');
      }

      const data = await response.json();
      if (!data.cards || !Array.isArray(data.cards) || data.cards.length === 0) {
        throw new Error('No flashcards could be generated from the given notes. Please provide more detailed text.');
      }

      const newDeck: Deck = {
        id: `deck_${Date.now()}`,
        title: data.title || (params.pdfFileName ? `Notes: ${params.pdfFileName}` : 'Generated Flashcard Deck'),
        summary: data.summary || 'Generated from study materials',
        cards: data.cards.map((c: any, idx: number) => ({
          id: c.id || `card_${Date.now()}_${idx}`,
          front: c.front || '',
          back: c.back || '',
          topic: c.topic || 'General',
          tags: Array.isArray(c.tags) ? c.tags : ['review'],
          difficulty: c.difficulty || 'Medium',
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sourceType: params.pdfBase64 ? 'pdf' : 'text',
      };

      setDecks((prev) => [newDeck, ...prev]);
      setCurrentDeckId(newDeck.id);
      setCurrentTab('editor');
      showToast(`Created ${newDeck.cards.length} atomic flashcards!`);
    } catch (err: any) {
      showToast(err.message || 'Unable to generate flashcards. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefineCardWithAI = async (card: Flashcard, instruction: string): Promise<Flashcard> => {
    const response = await fetch('/api/regenerate-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card, instruction }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to refine card');
    }

    const data = await response.json();
    showToast('Card refined successfully!');
    return data;
  };

  const handleCreateNewDeck = () => {
    setCurrentTab('generator');
  };

  const handleDeleteDeck = (deckId: string) => {
    const remaining = decks.filter((d) => d.id !== deckId);
    setDecks(remaining);
    if (currentDeckId === deckId) {
      setCurrentDeckId(remaining[0]?.id || '');
    }
    showToast('Deck removed.');
  };

  const handleImportDeck = (deck: Deck) => {
    setDecks((prev) => [deck, ...prev]);
    setCurrentDeckId(deck.id);
    setCurrentTab('editor');
    showToast(`Imported ${deck.title} (${deck.cards.length} cards)`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Bar Contract (3 zones) */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        cardCount={activeDeck.cards.length}
        deckTitle={activeDeck.title}
        onOpenExport={() => setIsExportOpen(true)}
        onNewDeck={handleCreateNewDeck}
        onOpenGuide={() => setShowWelcome(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dashboard' && (
          <LearnerDashboard
            decks={decks}
            activeDeck={activeDeck}
            onSelectDeck={(deckId) => {
              setCurrentDeckId(deckId);
              setCurrentTab('editor');
            }}
            onStartStudy={(deckId) => {
              if (deckId) setCurrentDeckId(deckId);
              setCurrentTab('study');
            }}
            onGoToGenerator={() => setCurrentTab('generator')}
            onGoToEditor={() => setCurrentTab('editor')}
            onLoadSampleTopic={handleLoadSampleDeck}
          />
        )}

        {currentTab === 'generator' && (
          <InputSection onGenerate={handleGenerateCards} isLoading={isGenerating} />
        )}

        {currentTab === 'editor' && (
          <CardGridEditor
            deck={activeDeck}
            onUpdateDeck={handleUpdateActiveDeck}
            onStartStudy={() => setCurrentTab('study')}
            onOpenExport={() => setIsExportOpen(true)}
            onRefineCardWithAI={handleRefineCardWithAI}
            onGoToGenerator={() => setCurrentTab('generator')}
          />
        )}

        {currentTab === 'study' && (
          <StudyMode
            cards={activeDeck.cards}
            deckTitle={activeDeck.title}
            onExit={() => setCurrentTab('editor')}
            onOpenExport={() => setIsExportOpen(true)}
          />
        )}

        {currentTab === 'library' && (
          <DeckLibrary
            decks={decks.length > 0 ? decks : [DEFAULT_EMPTY_DECK]}
            currentDeckId={currentDeckId || DEFAULT_EMPTY_DECK.id}
            onSelectDeck={(id) => {
              setCurrentDeckId(id);
              setCurrentTab('editor');
            }}
            onDeleteDeck={handleDeleteDeck}
            onCreateNew={handleCreateNewDeck}
            onImportDeck={handleImportDeck}
          />
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-medium text-white shadow-lg animate-in fade-in slide-in-from-bottom-2">
          {toastType === 'success' ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-400" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* First-Time User Welcome Modal Guide */}
      <WelcomeGuide
        isOpen={showWelcome}
        onClose={handleDismissWelcome}
        onExploreSample={handleLoadSampleDeck}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        deck={activeDeck}
      />
    </div>
  );
}
