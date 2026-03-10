import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { generateCards } from './generator';
import { applySrs, scheduleInitialReview } from './srs';
import { loadState, saveState } from './storage';
import { AppState, Card, Rating, ReviewHistory, ScoreEntry, Settings, Topic } from './types';

interface AppCtx {
  state: AppState;
  setSettings: (settings: Settings) => void;
  addScore: (score: ScoreEntry) => void;
  resetScores: () => void;
  generateNewCards: (count: number, seed?: number) => void;
  recordReview: (cardId: string, selectedIndex: number, rating: Rating, timeSpentMs: number) => void;
  dueCards: Card[];
  topicStats: Record<Topic, { correct: number; total: number }>;
}

const Ctx = createContext<AppCtx | null>(null);

const calcTopicStats = (state: AppState): Record<Topic, { correct: number; total: number }> => {
  const stats = {} as Record<Topic, { correct: number; total: number }>;
  state.cards.forEach((c) => {
    if (!stats[c.topic]) stats[c.topic] = { correct: 0, total: 0 };
    state.reviews[c.id]?.history.forEach((h) => {
      stats[c.topic].total += 1;
      if (h.wasCorrect) stats[c.topic].correct += 1;
    });
  });
  return stats;
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AppState>(() => loadState());

  const update = (next: AppState) => {
    setState(next);
    saveState(next);
  };

  const topicStats = useMemo(() => calcTopicStats(state), [state]);
  const dueCards = useMemo(
    () => state.cards.filter((c) => new Date(state.reviews[c.id]?.nextDueAt ?? 0).getTime() <= Date.now()),
    [state],
  );

  useEffect(() => {
    document.body.setAttribute('data-theme', state.settings.theme);
  }, [state.settings.theme]);

  const value: AppCtx = {
    state,
    topicStats,
    dueCards,
    setSettings: (settings) => update({ ...state, settings }),
    addScore: (score) => update({ ...state, scoreHistory: [...state.scoreHistory, score].sort((a, b) => a.date.localeCompare(b.date)) }),
    resetScores: () => update({ ...state, scoreHistory: [] }),
    generateNewCards: (count, seed) => {
      const cards = generateCards({ settings: state.settings }, { topicStats, scoreHistory: state.scoreHistory }, count, seed);
      const reviews = { ...state.reviews };
      cards.forEach((card) => {
        reviews[card.id] = scheduleInitialReview(card.id);
      });
      update({ ...state, cards: [...state.cards, ...cards], reviews });
    },
    recordReview: (cardId, selectedIndex, rating, timeSpentMs) => {
      const card = state.cards.find((c) => c.id === cardId);
      if (!card) return;
      const wasCorrect = card.answerIndex === selectedIndex;
      const current = state.reviews[cardId] ?? scheduleInitialReview(cardId);
      const history: ReviewHistory = { selectedIndex, wasCorrect, rating: wasCorrect ? rating : 'Again', timestamp: new Date().toISOString(), timeSpentMs };
      const updated = applySrs({ ...current, history: [...current.history, history] }, rating, wasCorrect);
      update({ ...state, reviews: { ...state.reviews, [cardId]: updated } });
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useAppState = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppState must be used inside AppProvider');
  return ctx;
};
