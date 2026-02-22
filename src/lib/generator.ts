import { Card, Difficulty, Settings, Topic, STUDY_TOPICS } from './types';

interface GeneratorConfig {
  settings: Settings;
}

interface UserState {
  topicStats: Record<string, { correct: number; total: number }>;
  scoreHistory: { propertyPct: number; casualtyPct: number; overallPct: number; date: string }[];
}

const topicConcepts: Record<Topic, string[]> = {
  'Insurance Regulation': ['producer licensing', 'market conduct', 'consumer protection'],
  'General Insurance': ['indemnity', 'insurable interest', 'utmost good faith'],
  'Property and Casualty Insurance Basics': ['peril', 'hazard', 'policy structure'],
  'Dwelling (2014) Policy': ['coverage forms', 'other structures', 'covered perils'],
  'Homeowners (2011) Policy': ['liability section', 'additional living expense', 'deductibles'],
  'Auto Insurance': ['liability limits', 'no-fault concepts', 'physical damage'],
  'Commercial Package Policy (CPP)': ['common policy conditions', 'declarations', 'interline flexibility'],
  'Businessowners (2010) Policy': ['eligible businesses', 'built-in property', 'business liability'],
  "Workers' Compensation Insurance": ['medical benefits', 'employer liability', 'exclusive remedy'],
  'Other Coverages and Options': ['endorsements', 'umbrella concepts', 'specialty forms'],
  'Accident and Health Insurance': ['disability income', 'policy renewability', 'benefit triggers'],
};

const mulberry32 = (seed: number) => {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const sectionTopics = {
  property: [
    'Dwelling (2014) Policy',
    'Homeowners (2011) Policy',
    'Commercial Package Policy (CPP)',
    'Businessowners (2010) Policy',
    'Other Coverages and Options',
  ],
  casualty: ['Auto Insurance', "Workers' Compensation Insurance", 'General Insurance', 'Insurance Regulation'],
} as const;

const pickWeightedTopic = (topics: Topic[], userState: UserState, rand: () => number): Topic => {
  const recent = userState.scoreHistory.at(-1);
  const propertyBoost = recent && recent.propertyPct < 75 ? 1.35 : 1;
  const casualtyBoost = recent && recent.casualtyPct < 75 ? 1.35 : 1;

  const weights = topics.map((topic) => {
    const stats = userState.topicStats[topic];
    const topicAcc = stats && stats.total > 0 ? stats.correct / stats.total : 0.7;
    const weaknessBoost = 1 + (1 - topicAcc);
    const sectionBoost = sectionTopics.property.includes(topic as never)
      ? propertyBoost
      : sectionTopics.casualty.includes(topic as never)
        ? casualtyBoost
        : 1;
    return weaknessBoost * sectionBoost;
  });

  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = rand() * total;
  for (let i = 0; i < topics.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) return topics[i];
  }
  return topics[topics.length - 1];
};

const chooseDifficulty = (base: Difficulty, userState: UserState, rand: () => number): Difficulty => {
  const entries = userState.scoreHistory;
  const recent = entries.slice(-3);
  const avgOverall = recent.length ? recent.reduce((s, r) => s + r.overallPct, 0) / recent.length : 70;
  if (avgOverall > 85 && rand() > 0.35) return base === 'Easy' ? 'Medium' : 'Hard';
  if (avgOverall < 68 && rand() > 0.4) return base === 'Hard' ? 'Medium' : 'Easy';
  return base;
};

const createCard = (topic: Topic, style: 'definition' | 'scenario', difficulty: Difficulty, id: string): Card => {
  const concept = topicConcepts[topic][id.charCodeAt(0) % topicConcepts[topic].length];
  const prompt =
    style === 'definition'
      ? `What is ${concept} under ${topic}?`
      : `What is the best answer about ${concept} under ${topic}?`;
  const options = [
    `It centers on matching coverage terms to the insured exposure and policy conditions.`,
    `It guarantees all losses are paid if any premium was collected.`,
    `It removes the need to review exclusions once coverage is triggered.`,
    `It means only property claims can be considered under any circumstance.`,
  ] as [string, string, string, string];

  if (difficulty === 'Hard') {
    options[1] = 'It generally requires broader analysis, including conditions, exclusions, and triggering language.';
    options[2] = 'It applies only after every endorsement is ignored in favor of declarations.';
  }

  const answerIndex = difficulty === 'Hard' ? 1 : 0;
  return {
    id,
    type: 'mcq',
    prompt,
    options,
    answerIndex: answerIndex as 0 | 1,
    explanation:
      answerIndex === 0
        ? 'Correct because exam-style reasoning starts with scope of coverage and policy conditions. A common trap is assuming premium payment guarantees every loss is covered.'
        : 'Correct because harder items test nuanced reading of conditions and exclusions. A common trap is believing declarations override all exclusions.',
    topic,
    difficulty,
    style,
    createdAt: new Date().toISOString(),
  };
};

export const generateCards = (config: GeneratorConfig, userState: UserState, count: number, seed = Date.now()): Card[] => {
  const rand = mulberry32(seed);
  const topics = config.settings.selectedTopics.length ? config.settings.selectedTopics : [...STUDY_TOPICS];

  return Array.from({ length: count }, (_, i) => {
    const topic = pickWeightedTopic(topics, userState, rand);
    const style = rand() * 100 < config.settings.definitionRatio ? 'definition' : 'scenario';
    const difficulty = chooseDifficulty(config.settings.difficulty, userState, rand);
    return createCard(topic, style, difficulty, `${seed}-${i}-${Math.floor(rand() * 9999)}`);
  });
};
