import { Rating, Review } from './types';

const dayMs = 24 * 60 * 60 * 1000;

export const scheduleInitialReview = (cardId: string): Review => ({
  cardId,
  lastReviewedAt: null,
  nextDueAt: new Date().toISOString(),
  ease: 2.5,
  interval: 0,
  repetitions: 0,
  history: [],
});

export const applySrs = (review: Review, rating: Rating, wasCorrect: boolean): Review => {
  const effectiveRating: Rating = wasCorrect ? rating : 'Again';
  let ease = review.ease;
  let repetitions = review.repetitions;
  let interval = review.interval;

  if (effectiveRating === 'Again') {
    repetitions = 0;
    interval = 1 / 24;
    ease = Math.max(1.3, ease - 0.2);
  } else {
    repetitions += 1;
    const mult = effectiveRating === 'Hard' ? 1.2 : effectiveRating === 'Good' ? ease : ease * 1.3;
    interval = repetitions === 1 ? 1 : Math.max(1, interval * mult);
    ease =
      effectiveRating === 'Easy' ? ease + 0.15 : effectiveRating === 'Hard' ? Math.max(1.3, ease - 0.05) : ease + 0.02;
  }

  return {
    ...review,
    ease,
    repetitions,
    interval,
    lastReviewedAt: new Date().toISOString(),
    nextDueAt: new Date(Date.now() + interval * dayMs).toISOString(),
  };
};
