import type { Difficulty, Review, ScoreEntry, Settings, Topic } from '../types';

export function topicAccuracy(topic: Topic, cardTopicMap: Record<string, Topic>, reviews: Record<string, Review>) {
  const entries = Object.values(reviews)
    .filter((r) => cardTopicMap[r.cardId] === topic)
    .flatMap((r) => r.history);
  if (!entries.length) return 0.65;
  const correct = entries.filter((h) => h.wasCorrect).length;
  return correct / entries.length;
}

export function sectionWeights(scores: ScoreEntry[]) {
  if (!scores.length) return { Property: 1, Casualty: 1 } as const;
  const latest = [...scores].sort((a, b) => b.date.localeCompare(a.date))[0];
  const propertyWeight = Math.max(0.5, (100 - latest.propertyPct) / 20);
  const casualtyWeight = Math.max(0.5, (100 - latest.casualtyPct) / 20);
  return { Property: propertyWeight, Casualty: casualtyWeight } as const;
}

export function getAdaptiveDifficulty(reviews: Record<string, Review>, base: Difficulty): Difficulty {
  const recent = Object.values(reviews)
    .flatMap((r) => r.history)
    .sort((a, b) => b.reviewedAt.localeCompare(a.reviewedAt))
    .slice(0, 20);

  if (recent.length < 8) return base;
  const accuracy = recent.filter((h) => h.wasCorrect).length / recent.length;
  if (accuracy > 0.85) {
    if (base === 'Easy') return 'Medium';
    return 'Hard';
  }
  if (accuracy < 0.55) {
    if (base === 'Hard') return 'Medium';
    return 'Easy';
  }
  return base;
}

export function shouldGenerateDefinition(definitionRatio: number, rng: () => number) {
  return rng() * 100 < definitionRatio;
}

export function recommendedTopics(
  settings: Settings,
  cardTopicMap: Record<string, Topic>,
  reviews: Record<string, Review>,
) {
  return settings.focusTopics
    .map((topic) => ({ topic, acc: topicAccuracy(topic, cardTopicMap, reviews) }))
    .sort((a, b) => a.acc - b.acc)
    .slice(0, 3);
}
