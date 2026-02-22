export type ExamMode = 'NY P&C';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type CardType = 'definition' | 'reverse_definition' | 'scenario_mcq' | 'scenario_short';

export type Grade = 'Again' | 'Hard' | 'Good' | 'Easy';

export type Topic =
  | 'Homeowners'
  | 'Commercial Property'
  | 'Inland Marine'
  | 'Auto'
  | 'General Liability'
  | "Workers' Comp"
  | 'BOP'
  | 'Umbrella/Excess'
  | 'Conditions/Endorsements'
  | 'Claims'
  | 'Risk Mgmt';

export interface Card {
  id: string;
  type: CardType;
  prompt: string;
  options?: string[];
  answer: string;
  explanation: string;
  topic: Topic;
  section: 'Property' | 'Casualty';
  difficulty: Difficulty;
  createdAt: string;
}

export interface ReviewHistoryItem {
  reviewedAt: string;
  grade: Grade;
  wasCorrect: boolean;
  msSpent: number;
}

export interface Review {
  cardId: string;
  lastReviewedAt: string | null;
  nextDueAt: string;
  ease: number;
  interval: number;
  repetitions: number;
  history: ReviewHistoryItem[];
}

export interface ScoreEntry {
  id: string;
  date: string;
  propertyPct: number;
  casualtyPct: number;
  overallPct: number;
}

export interface Settings {
  examMode: ExamMode;
  definitionRatio: number;
  focusTopics: Topic[];
  difficulty: Difficulty;
  dailyGoal: number;
  seed: string;
}

export interface SessionStat {
  date: string;
  cardsStudied: number;
  correct: number;
  totalMs: number;
}

export interface AppData {
  settings: Settings;
  cards: Card[];
  reviews: Record<string, Review>;
  scores: ScoreEntry[];
  sessions: SessionStat[];
}
