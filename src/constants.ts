import type { AppData, Settings, Topic } from './types';

export const TOPICS: Topic[] = [
  'Homeowners',
  'Commercial Property',
  'Inland Marine',
  'Auto',
  'General Liability',
  "Workers' Comp",
  'BOP',
  'Umbrella/Excess',
  'Conditions/Endorsements',
  'Claims',
  'Risk Mgmt',
];

export const DEFAULT_SETTINGS: Settings = {
  examMode: 'NY P&C',
  definitionRatio: 70,
  focusTopics: TOPICS,
  difficulty: 'Medium',
  dailyGoal: 20,
  seed: 'ny-pc-default',
};

export const STORAGE_KEY = 'ny-pc-flashcards-v1';

export const INITIAL_DATA: AppData = {
  settings: DEFAULT_SETTINGS,
  cards: [],
  reviews: {},
  scores: [
    {
      id: 'score-seed-1',
      date: new Date(Date.now() - 5 * 86400000).toISOString(),
      propertyPct: 68,
      casualtyPct: 61,
      overallPct: 64,
    },
    {
      id: 'score-seed-2',
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
      propertyPct: 74,
      casualtyPct: 66,
      overallPct: 70,
    },
  ],
  sessions: [
    { date: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10), cardsStudied: 14, correct: 9, totalMs: 420000 },
    { date: new Date(Date.now() - 1 * 86400000).toISOString().slice(0, 10), cardsStudied: 18, correct: 13, totalMs: 520000 },
  ],
};
