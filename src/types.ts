export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type RecallRating = 'Again' | 'Hard' | 'Good' | 'Easy';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: string;
  tags: string[];
  difficulty: Difficulty;
  masteryRating?: RecallRating;
  lastReviewed?: string;
}

export interface Deck {
  id: string;
  title: string;
  summary: string;
  cards: Flashcard[];
  createdAt: string;
  updatedAt: string;
  sourceType?: 'text' | 'pdf' | 'preset' | 'manual';
  sourceSnippet?: string;
}

export type StudyDepth = 'concepts' | 'granular' | 'interview' | 'formulas';

export interface SampleNotePreset {
  id: string;
  title: string;
  category: string;
  depth: StudyDepth;
  description: string;
  notes: string;
}
