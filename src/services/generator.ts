import type { Card, CardType, Settings, Topic } from '../types';
import { getAdaptiveDifficulty, sectionWeights, shouldGenerateDefinition, topicAccuracy } from './adaptive';
import { createRng, pickWeighted } from '../utils/random';
import { DAY_MS } from '../utils/date';

const TOPIC_BANK: Record<
  Topic,
  {
    section: 'Property' | 'Casualty';
    terms: { term: string; definition: string; trap?: string }[];
    scenarios: { q: string; a: string; distractors: string[]; explain: string }[];
  }
> = {
  Homeowners: {
    section: 'Property',
    terms: [
      { term: 'Insurable Interest', definition: 'A financial stake in preserving property from loss at the time of loss.' },
      { term: 'HO-3 Special Form', definition: 'A homeowners form that commonly insures dwelling on open-peril basis and personal property on named-peril basis.' },
    ],
    scenarios: [
      { q: 'A homeowner reports a kitchen fire. Which part of a typical homeowners policy responds first to damage to cabinets and walls?', a: 'Coverage A - Dwelling', distractors: ['Coverage C - Personal Property', 'Coverage E - Personal Liability', 'Coverage F - Medical Payments'], explain: 'Dwelling structures are generally handled under Coverage A in common homeowners forms.' },
    ],
  },
  'Commercial Property': {
    section: 'Property',
    terms: [
      { term: 'Coinsurance', definition: 'A policy condition requiring insurance to value ratio to avoid a penalty at claim time.' },
      { term: 'Business Income', definition: 'Coverage for lost net income and continuing normal operating expenses after a covered direct physical loss.' },
    ],
    scenarios: [
      { q: 'A shop closes for repairs after a covered wind loss. Which coverage addresses lost revenue during restoration?', a: 'Business Income', distractors: ['Ordinance or Law', 'Employee Dishonesty', 'Accounts Receivable'], explain: 'Business income coverage is designed for suspended operations from covered direct loss.' },
    ],
  },
  'Inland Marine': {
    section: 'Property',
    terms: [{ term: 'Personal Articles Floater', definition: 'A policy/endorsement that schedules valuable movable property with broader causes of loss.' }],
    scenarios: [{ q: 'A camera used by a freelancer is stolen while traveling. Which policy type is commonly used for this movable risk?', a: 'Inland Marine floater', distractors: ['Standard homeowners Coverage D', 'Commercial auto liability', 'Workers’ compensation'], explain: 'Inland marine is built for movable and transit-related property exposures.' }],
  },
  Auto: {
    section: 'Casualty',
    terms: [{ term: 'No-Fault (PIP)', definition: 'Coverage for certain medical and economic losses regardless of fault, subject to policy and state rules.' }],
    scenarios: [{ q: 'An insured rear-ends another car and injures the other driver. Which personal auto coverage typically addresses the insured’s legal liability?', a: 'Bodily Injury Liability', distractors: ['Collision', 'Comprehensive', 'Medical Payments'], explain: 'Liability coverage addresses damages owed to others when the insured is legally responsible.' }],
  },
  'General Liability': {
    section: 'Casualty',
    terms: [{ term: 'Occurrence', definition: 'An accident, including continuous or repeated exposure to substantially the same general harmful conditions.' }],
    scenarios: [{ q: 'A customer slips in a retail store and sues for injury. Which CGL part is most relevant?', a: 'Coverage A - Bodily Injury and Property Damage Liability', distractors: ['Coverage C - Medical Payments only', 'Commercial property form', 'Inland marine form'], explain: 'Slip-and-fall negligence claims are usually handled under CGL Coverage A.' }],
  },
  "Workers' Comp": {
    section: 'Casualty',
    terms: [{ term: 'Exclusive Remedy', definition: 'A workers’ compensation principle limiting most employee injury suits against the employer in exchange for statutory benefits.' }],
    scenarios: [{ q: 'An employee suffers a work injury and seeks benefits without proving employer negligence. Which system is designed for this?', a: 'Workers’ compensation', distractors: ['Commercial auto physical damage', 'Surety bond', 'Ocean marine'], explain: 'Workers’ compensation generally provides statutory benefits for work-related injuries.' }],
  },
  BOP: {
    section: 'Property',
    terms: [{ term: 'Businessowners Policy', definition: 'A package policy designed for eligible small to medium businesses combining property and liability coverages.' }],
    scenarios: [{ q: 'A small boutique seeks combined property and liability protection in one form. Which policy is often suitable if eligible?', a: 'Businessowners Policy (BOP)', distractors: ['Personal umbrella only', 'Dwelling policy', 'Workers’ comp policy only'], explain: 'BOPs package key coverages for qualifying businesses.' }],
  },
  'Umbrella/Excess': {
    section: 'Casualty',
    terms: [{ term: 'Umbrella Liability', definition: 'Liability coverage that provides higher limits above scheduled underlying policies and may broaden some coverages.' }],
    scenarios: [{ q: 'A severe claim exhausts the primary liability policy limit. What policy is intended to respond next if scheduled?', a: 'Umbrella/Excess Liability', distractors: ['Collision coverage', 'Business income', 'Equipment breakdown'], explain: 'Umbrella or excess policies apply after underlying limits are exhausted, subject to terms.' }],
  },
  'Conditions/Endorsements': {
    section: 'Property',
    terms: [{ term: 'Endorsement', definition: 'A written amendment that changes policy terms, conditions, or coverages.' }],
    scenarios: [{ q: 'An insured wants to modify deductible language on renewal. What mechanism typically changes policy terms?', a: 'An endorsement', distractors: ['A loss run report', 'A binder cancellation', 'A premium finance agreement'], explain: 'Endorsements alter policy language and are part of the contract.' }],
  },
  Claims: {
    section: 'Casualty',
    terms: [{ term: 'Subrogation', definition: 'An insurer’s right to pursue a responsible third party after paying a covered loss.' }],
    scenarios: [{ q: 'After paying for water damage caused by a negligent contractor, the insurer seeks recovery from that contractor. What is this called?', a: 'Subrogation', distractors: ['Indemnification by insured', 'Coinsurance waiver', 'Appraisal'], explain: 'Subrogation helps prevent double recovery and can reduce claim costs.' }],
  },
  'Risk Mgmt': {
    section: 'Casualty',
    terms: [{ term: 'Risk Retention', definition: 'A strategy where an entity knowingly keeps some risk instead of transferring all of it through insurance.' }],
    scenarios: [{ q: 'A firm decides to self-insure small predictable losses and buy insurance for severe losses. Which concept is this?', a: 'Risk retention with transfer layering', distractors: ['Pure risk avoidance', 'Subrogation only', 'Reinsurance treaty'], explain: 'Risk management commonly combines retained layers with transferred catastrophic risk.' }],
  },
};

export function generateCards(params: {
  settings: Settings;
  count: number;
  reviews: Record<string, any>;
  scores: any[];
  existingCards: Card[];
}) {
  const { settings, count, reviews, scores, existingCards } = params;
  const rng = createRng(`${settings.seed}-${Date.now().toString().slice(0, 8)}`);
  const byIdTopic = Object.fromEntries(existingCards.map((c) => [c.id, c.topic]));
  const sectionBias = sectionWeights(scores);
  const difficulty = getAdaptiveDifficulty(reviews, settings.difficulty);

  const topicWeights = settings.focusTopics.map((topic) => {
    const section = TOPIC_BANK[topic].section;
    const secWeight = section === 'Property' ? sectionBias.Property : sectionBias.Casualty;
    const accWeight = 1 + (1 - topicAccuracy(topic, byIdTopic, reviews)) * 1.6;
    return secWeight * accWeight;
  });

  const cards: Card[] = [];
  for (let i = 0; i < count; i += 1) {
    const topic = pickWeighted(settings.focusTopics, topicWeights, rng);
    const bank = TOPIC_BANK[topic];
    const makeDef = shouldGenerateDefinition(settings.definitionRatio, rng);
    const term = bank.terms[Math.floor(rng() * bank.terms.length)];
    const scenario = bank.scenarios[Math.floor(rng() * bank.scenarios.length)];

    let type: CardType;
    let prompt: string;
    let answer: string;
    let options: string[] | undefined;
    let explanation: string;

    if (makeDef) {
      const reverse = rng() > 0.5;
      type = reverse ? 'reverse_definition' : 'definition';
      prompt = reverse ? `Define this concept: ${term.definition}` : `What does "${term.term}" mean in insurance context?`;
      answer = reverse ? term.term : term.definition;
      explanation = `Definition focus: ${term.term} is foundational for ${topic} exam questions.`;
    } else {
      const short = rng() > 0.6;
      type = short ? 'scenario_short' : 'scenario_mcq';
      prompt = scenario.q;
      answer = scenario.a;
      explanation = scenario.explain;
      if (!short) {
        options = [scenario.a, ...scenario.distractors];
        if (difficulty === 'Hard') {
          options[3] = `${scenario.a} (with incorrect trigger)`;
        }
        options = options.sort(() => rng() - 0.5);
      }
    }

    cards.push({
      id: `card-${Date.now()}-${i}-${Math.floor(rng() * 10000)}`,
      type,
      prompt,
      options,
      answer,
      explanation,
      topic,
      section: bank.section,
      difficulty,
      createdAt: new Date(Date.now() - Math.floor(rng() * DAY_MS)).toISOString(),
    });
  }

  return cards;
}
