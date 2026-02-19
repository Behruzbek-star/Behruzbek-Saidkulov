import { Card, StudySession, Topic, UserSettings } from '../types';
import { defaultTopics } from '../data/topics';
import { generateCards } from './generator';

const KEYS = {
  topics: 'ny-pc-topics',
  cards: 'ny-pc-cards',
  sessions: 'ny-pc-sessions',
  settings: 'ny-pc-settings'
};

export const defaultSettings: UserSettings = {
  examDate: '',
  sessionLength: 25,
  definitionRatio: 0.65,
  difficulty: 3
};

export function bootstrapData() {
  const topics = load<Topic[]>(KEYS.topics);
  const cards = load<Card[]>(KEYS.cards);
  if (!topics) save(KEYS.topics, defaultTopics);
  if (!cards) {
    const initialCards = generateCards(defaultTopics, 160, defaultSettings);
    save(KEYS.cards, initialCards);
  }
  if (!load<StudySession[]>(KEYS.sessions)) save(KEYS.sessions, []);
  if (!load<UserSettings>(KEYS.settings)) save(KEYS.settings, defaultSettings);
}

export const load = <T>(key: string): T | null => {
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : null;
};

export const save = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const keyMap = KEYS;
