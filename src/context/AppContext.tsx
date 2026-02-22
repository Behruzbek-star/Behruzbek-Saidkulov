import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AppData, Card, Grade, ScoreEntry, Settings, Topic } from '../types';
import { loadData, saveData } from '../services/storage';
import { generateCards } from '../services/generator';
import { createInitialReview, applySrs } from '../services/srs';
import { startOfTodayMs, toDayKey } from '../utils/date';

interface AppContextValue extends AppData {
  dueToday: Card[];
  updateSettings: (settings: Partial<Settings>) => void;
  addScore: (entry: Omit<ScoreEntry, 'id'>) => void;
  ensureDueQueue: () => void;
  gradeCard: (cardId: string, grade: Grade, wasCorrect: boolean, msSpent: number) => void;
  resetAll: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadData);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const dueToday = useMemo(() => {
    const today = startOfTodayMs();
    return data.cards.filter((card) => new Date(data.reviews[card.id]?.nextDueAt ?? 0).getTime() <= today + 86400000);
  }, [data.cards, data.reviews]);

  const updateSettings = useCallback((settings: Partial<Settings>) => {
    setData((prev) => ({ ...prev, settings: { ...prev.settings, ...settings } }));
  }, []);

  const addScore = useCallback((entry: Omit<ScoreEntry, 'id'>) => {
    setData((prev) => ({ ...prev, scores: [...prev.scores, { ...entry, id: `score-${Date.now()}` }] }));
  }, []);

  const ensureDueQueue = useCallback(() => {
    setData((prev) => {
      const todayCount = prev.cards.filter((card) => new Date(prev.reviews[card.id]?.nextDueAt ?? 0).getTime() <= Date.now()).length;
      const needed = Math.max(0, prev.settings.dailyGoal - todayCount);
      if (!needed) return prev;
      const newCards = generateCards({
        settings: prev.settings,
        count: needed,
        reviews: prev.reviews,
        scores: prev.scores,
        existingCards: prev.cards,
      });
      const reviews = { ...prev.reviews };
      newCards.forEach((c) => {
        reviews[c.id] = createInitialReview(c.id);
      });
      return { ...prev, cards: [...prev.cards, ...newCards], reviews };
    });
  }, []);

  const gradeCard = useCallback((cardId: string, grade: Grade, wasCorrect: boolean, msSpent: number) => {
    setData((prev) => {
      const review = prev.reviews[cardId] ?? createInitialReview(cardId);
      const next = applySrs(review, grade, wasCorrect, msSpent);
      const dayKey = toDayKey(new Date().toISOString());
      const sessions = [...prev.sessions];
      const idx = sessions.findIndex((s) => s.date === dayKey);
      if (idx === -1) {
        sessions.push({ date: dayKey, cardsStudied: 1, correct: wasCorrect ? 1 : 0, totalMs: msSpent });
      } else {
        sessions[idx] = {
          ...sessions[idx],
          cardsStudied: sessions[idx].cardsStudied + 1,
          correct: sessions[idx].correct + (wasCorrect ? 1 : 0),
          totalMs: sessions[idx].totalMs + msSpent,
        };
      }
      return { ...prev, reviews: { ...prev.reviews, [cardId]: next }, sessions };
    });
  }, []);

  const resetAll = useCallback(() => setData(loadData()), []);

  return (
    <AppContext.Provider value={{ ...data, dueToday, updateSettings, addScore, ensureDueQueue, gradeCard, resetAll }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}

export function useCardTopicMap() {
  const { cards } = useApp();
  return useMemo(() => Object.fromEntries(cards.map((card) => [card.id, card.topic as Topic])), [cards]);
}
