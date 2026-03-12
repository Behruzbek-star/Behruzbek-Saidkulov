import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { applySrs, scheduleInitialReview } from './srs';
import { loadState, saveState } from './storage';
import { AppState, Card, QuestionBankItem, Rating, ReviewHistory, ScoreEntry, Settings, Topic } from './types';

interface AppCtx {
  state: AppState;
  setSettings: (settings: Settings) => void;
  addScore: (score: ScoreEntry) => void;
  resetScores: () => void;
  addQuestion: (question: QuestionBankItem) => void;
  removeQuestion: (questionId: string) => void;
  recordReview: (cardId: string, selectedIndex: number, rating: Rating, timeSpentMs: number) => void;
  dueCards: Card[];
  topicStats: Record<Topic, { correct: number; total: number }>;
}

const Ctx = createContext<AppCtx | null>(null);

const questionToCard = (question: QuestionBankItem): Card => ({
  id: question.id,
  type: 'mcq',
  prompt: question.prompt,
  options: question.options,
  answerIndex: question.answerIndex,
  explanation: 'From your provided quiz bank.',
  topic: question.topic,
  difficulty: 'Medium',
  style: 'definition',
  createdAt: new Date().toISOString(),
});

const calcTopicStats = (state: AppState): Record<Topic, { correct: number; total: number }> => {
  const stats = {} as Record<Topic, { correct: number; total: number }>;
  state.questionBank.forEach((q) => {
    if (!stats[q.topic]) stats[q.topic] = { correct: 0, total: 0 };
    state.reviews[q.id]?.history.forEach((h) => {
      if (!stats[q.topic]) return;
      stats[q.topic].total += 1;
      if (h.wasCorrect) stats[q.topic].correct += 1;
    });
  });
  return stats;
};

const mapQuestionsByTopic = (state: AppState): Card[] => {
  const selectedTopics = state.settings.selectedTopics.length ? state.settings.selectedTopics : [];
  const filtered = selectedTopics.length
    ? state.questionBank.filter((q) => selectedTopics.includes(q.topic))
    : [...state.questionBank];
  return filtered.map(questionToCard);
};

const calcDueCards = (state: AppState): Card[] => mapQuestionsByTopic(state);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AppState>(() => loadState());

  const update = (next: AppState) => {
    setState(next);
    saveState(next);
  };

  const topicStats = useMemo(() => calcTopicStats(state), [state]);
  const dueCards = useMemo(() => calcDueCards(state), [state]);

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
    addQuestion: (question) => update({ ...state, questionBank: [...state.questionBank, question] }),
    removeQuestion: (questionId) => update({ ...state, questionBank: state.questionBank.filter((q) => q.id !== questionId) }),
    recordReview: (cardId, selectedIndex, rating, timeSpentMs) => {
      const question = state.questionBank.find((q) => q.id === cardId);
      if (!question) return;
      const wasCorrect = question.answerIndex === selectedIndex;
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
