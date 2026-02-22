export const STUDY_TOPICS = [
  'Insurance Regulation',
  'General Insurance',
  'Property and Casualty Insurance Basics',
  'Dwelling (2014) Policy',
  'Homeowners (2011) Policy',
  'Auto Insurance',
  'Commercial Package Policy (CPP)',
  'Businessowners (2010) Policy',
  "Workers' Compensation Insurance",
  'Other Coverages and Options',
  'Accident and Health Insurance',
] as const;

export type Topic = (typeof STUDY_TOPICS)[number];
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type CardStyle = 'definition' | 'scenario';
export type Rating = 'Again' | 'Hard' | 'Good' | 'Easy';

export interface Card {
  id: string;
  type: 'mcq';
  prompt: string;
  options: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
  explanation: string;
  topic: Topic;
  difficulty: Difficulty;
  style: CardStyle;
  createdAt: string;
}

export interface ReviewHistory {
  selectedIndex: number;
  wasCorrect: boolean;
  rating: Rating;
  timestamp: string;
  timeSpentMs: number;
}

export interface Review {
  cardId: string;
  lastReviewedAt: string | null;
  nextDueAt: string;
  ease: number;
  interval: number;
  repetitions: number;
  history: ReviewHistory[];
}

export interface ScoreEntry {
  date: string;
  propertyPct: number;
  casualtyPct: number;
  overallPct: number;
}

export interface Settings {
  examMode: 'New York P&C';
  selectedTopics: Topic[];
  definitionRatio: number;
  difficulty: Difficulty;
  dailyGoal: number;
  newCardsBatchSize: number;
}

export interface AppState {
  schemaVersion: number;
  cards: Card[];
  reviews: Record<string, Review>;
  settings: Settings;
  scoreHistory: ScoreEntry[];
  createdAt: string;
}
