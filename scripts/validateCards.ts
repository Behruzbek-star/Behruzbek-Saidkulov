import { defaultTopics } from '../src/data/topics';
import { generateCards } from '../src/lib/generator';
import { defaultSettings } from '../src/lib/storage';

const cards = generateCards(defaultTopics, 160, defaultSettings);

const scenarioErrors = cards
  .filter((c) => c.type === 'scenario')
  .map((c) => ({ id: c.id, correct: c.options?.filter((o) => o.isCorrect).length ?? 0 }))
  .filter((m) => m.correct !== 1);

const missingExplanation = cards.filter((c) => !c.explanation || c.explanation.trim().length < 4);

const topicCounts = new Map<string, number>();
for (const card of cards) topicCounts.set(card.topicId, (topicCounts.get(card.topicId) ?? 0) + 1);
const minCoverage = Math.floor(cards.length / defaultTopics.length / 2);
const weakCoverage = [...topicCounts.values()].every((count) => count >= minCoverage);

const defRatio = cards.filter((c) => c.type === 'definition').length / cards.length;
const ratioOk = Math.abs(defRatio - defaultSettings.definitionRatio) <= 0.1;

if (scenarioErrors.length || missingExplanation.length || !weakCoverage || !ratioOk) {
  console.error('Validation failed', { scenarioErrors: scenarioErrors.length, missingExplanation: missingExplanation.length, weakCoverage, ratioOk });
  process.exit(1);
}

console.log('Validation passed', { cards: cards.length, scenario: cards.filter((c) => c.type === 'scenario').length, definition: cards.filter((c) => c.type === 'definition').length });
