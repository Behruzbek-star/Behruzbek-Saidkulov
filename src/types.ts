export type CardType = 'definition' | 'scenario';

export type Topic = {
  id: string;
  name: string;
  category: 'Property' | 'Casualty' | 'Concepts' | 'Ethics/Regulatory' | 'Mixed';
  weight: number;
  score: number;
  attempted: number;
  updatedAt: string;
  subtopics: string[];
};

export type SRSData = {
  interval: number;
  easeFactor: number;
  dueDate: string;
  reps: number;
};

export type CardStats = {
  seen: number;
  correct: number;
  incorrect: number;
  hard: number;
  easy: number;
};

export type CardOption = {
  id: string;
  text: string;
  isCorrect: boolean;
  reason: string;
};

export type Card = {
  id: string;
  topicId: string;
  type: CardType;
  prompt: string;
  options?: CardOption[];
  answer: string;
  explanation: string;
  tags: string[];
  difficulty: number;
  flagged: boolean;
  stats: CardStats;
  srs: SRSData;
};

export type SessionResult = {
  cardId: string;
  rating: 'incorrect' | 'hard' | 'correct' | 'easy';
  timestamp: string;
};

export type StudySession = {
  id: string;
  date: string;
  cardIds: string[];
  results: SessionResult[];
  examMode?: boolean;
};

export type UserSettings = {
  examDate: string;
  sessionLength: number;
  definitionRatio: number;
  difficulty: number;
};
