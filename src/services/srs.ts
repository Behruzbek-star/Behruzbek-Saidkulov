import type { Grade, Review } from '../types';
import { DAY_MS } from '../utils/date';

const gradeQuality: Record<Grade, number> = {
  Again: 1,
  Hard: 3,
  Good: 4,
  Easy: 5,
};

export function createInitialReview(cardId: string): Review {
  return {
    cardId,
    lastReviewedAt: null,
    nextDueAt: new Date().toISOString(),
    ease: 2.5,
    interval: 0,
    repetitions: 0,
    history: [],
  };
}

export function applySrs(review: Review, grade: Grade, wasCorrect: boolean, msSpent: number): Review {
  const q = gradeQuality[grade];
  const now = Date.now();
  let reps = review.repetitions;
  let ease = review.ease;
  let interval = review.interval;

  if (grade === 'Again') {
    reps = 0;
    interval = 1;
  } else {
    reps += 1;
    ease = Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 3;
    else interval = Math.round(interval * ease);

    if (grade === 'Hard') interval = Math.max(1, Math.round(interval * 0.7));
    if (grade === 'Easy') interval = Math.round(interval * 1.3);
  }

  return {
    ...review,
    lastReviewedAt: new Date(now).toISOString(),
    nextDueAt: new Date(now + interval * DAY_MS).toISOString(),
    ease,
    interval,
    repetitions: reps,
    history: [
      ...review.history,
      { reviewedAt: new Date(now).toISOString(), grade, wasCorrect, msSpent },
    ],
  };
}
