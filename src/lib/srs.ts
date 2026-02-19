import { Card, SessionResult, Topic } from '../types';

export function updateSrs(card: Card, rating: SessionResult['rating']): Card {
  const next = { ...card, stats: { ...card.stats }, srs: { ...card.srs } };
  next.stats.seen += 1;
  if (rating === 'incorrect') {
    next.stats.incorrect += 1;
    next.srs.reps = 0;
    next.srs.interval = 1;
    next.srs.easeFactor = Math.max(1.3, next.srs.easeFactor - 0.2);
  } else if (rating === 'hard') {
    next.stats.hard += 1;
    next.srs.reps += 1;
    next.srs.interval = Math.max(1, Math.round(next.srs.interval * 1.2));
    next.srs.easeFactor = Math.max(1.3, next.srs.easeFactor - 0.15);
  } else if (rating === 'easy') {
    next.stats.easy += 1;
    next.stats.correct += 1;
    next.srs.reps += 1;
    next.srs.interval = Math.round(next.srs.interval * next.srs.easeFactor * 1.35);
    next.srs.easeFactor = Math.min(2.8, next.srs.easeFactor + 0.1);
  } else {
    next.stats.correct += 1;
    next.srs.reps += 1;
    next.srs.interval = Math.round(next.srs.interval * next.srs.easeFactor);
  }
  const due = new Date();
  due.setDate(due.getDate() + next.srs.interval);
  next.srs.dueDate = due.toISOString();
  return next;
}

export function topicPriority(topic: Topic): number {
  const scoreNormalized = (topic.score || 0) / 100;
  const daysAgo = Math.max(1, (Date.now() - new Date(topic.updatedAt).getTime()) / 86_400_000);
  const recencyBoost = Math.min(1.5, 1 + daysAgo / 20);
  return (1 - scoreNormalized) * topic.weight * recencyBoost;
}

export function computeReadiness(topics: Topic[], cards: Card[]): number {
  const avgTopic = topics.reduce((sum, t) => sum + t.score, 0) / Math.max(1, topics.length);
  const coverage = new Set(cards.map((c) => c.topicId)).size / Math.max(1, topics.length);
  const recentPerf = cards.filter((c) => c.stats.seen > 0).reduce((sum, c) => sum + (c.stats.correct / c.stats.seen) * 100, 0) / Math.max(1, cards.filter((c) => c.stats.seen > 0).length);
  return Math.round(avgTopic * 0.45 + coverage * 100 * 0.25 + recentPerf * 0.3);
}
