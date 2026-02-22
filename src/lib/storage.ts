import { generateCards } from './generator';
import { scheduleInitialReview } from './srs';
import { AppState, Card, Review, ScoreEntry, Settings, STUDY_TOPICS } from './types';

const KEY = 'ny_pc_flashcards_state';
const SCHEMA_VERSION = 1;

export const defaultSettings: Settings = {
  examMode: 'New York P&C',
  selectedTopics: [...STUDY_TOPICS],
  definitionRatio: 70,
  difficulty: 'Medium',
  dailyGoal: 20,
  newCardsBatchSize: 10,
};

const sampleScores: ScoreEntry[] = [
  { date: new Date().toISOString().slice(0, 10), propertyPct: 68, casualtyPct: 74, overallPct: 71 },
];

const seedState = (): AppState => {
  const cards = generateCards(
    { settings: defaultSettings },
    { topicStats: {}, scoreHistory: sampleScores },
    8,
    101,
  );
  const reviews: Record<string, Review> = {};
  cards.forEach((card) => {
    reviews[card.id] = scheduleInitialReview(card.id);
  });
  return {
    schemaVersion: SCHEMA_VERSION,
    cards,
    reviews,
    settings: defaultSettings,
    scoreHistory: sampleScores,
    createdAt: new Date().toISOString(),
  };
};

const migrate = (raw: unknown): AppState => {
  if (!raw || typeof raw !== 'object') return seedState();
  const data = raw as Partial<AppState>;
  return {
    schemaVersion: SCHEMA_VERSION,
    cards: Array.isArray(data.cards) ? (data.cards as Card[]) : [],
    reviews: data.reviews ?? {},
    settings: { ...defaultSettings, ...(data.settings ?? {}) },
    scoreHistory: Array.isArray(data.scoreHistory) ? data.scoreHistory : [],
    createdAt: data.createdAt ?? new Date().toISOString(),
  };
};

export const loadState = (): AppState => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const initial = seedState();
      saveState(initial);
      return initial;
    }
    return migrate(JSON.parse(raw));
  } catch {
    return seedState();
  }
};

export const saveState = (state: AppState): void => {
  localStorage.setItem(KEY, JSON.stringify(state));
};
