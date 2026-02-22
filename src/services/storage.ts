import { INITIAL_DATA, STORAGE_KEY } from '../constants';
import type { AppData } from '../types';

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_DATA;
    const parsed = JSON.parse(raw) as AppData;
    return {
      ...INITIAL_DATA,
      ...parsed,
      settings: { ...INITIAL_DATA.settings, ...parsed.settings },
      cards: parsed.cards ?? [],
      reviews: parsed.reviews ?? {},
      scores: parsed.scores ?? INITIAL_DATA.scores,
      sessions: parsed.sessions ?? INITIAL_DATA.sessions,
    };
  } catch {
    return INITIAL_DATA;
  }
}

export function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
