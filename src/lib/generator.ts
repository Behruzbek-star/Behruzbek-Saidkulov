import { v4 as uuidv4 } from 'uuid';
import { Card, Topic, UserSettings } from '../types';

const nowISO = () => new Date().toISOString();
const srsSeed = () => ({ interval: 1, easeFactor: 2.5, dueDate: nowISO(), reps: 0 });
const statsSeed = () => ({ seen: 0, correct: 0, incorrect: 0, hard: 0, easy: 0 });

type Seed = { topicId: string; term: string; definition: string; tag: string };
type ScenarioSeed = {
  topicId: string;
  caseText: string;
  question: string;
  correct: string;
  wrong: [string, string, string];
  explain: string;
};

const definitionSeeds: Seed[] = [
  { topicId: 'homeowners', term: 'Coverage A', definition: 'Dwelling coverage for the residence structure and attached structures.', tag: 'ho' },
  { topicId: 'homeowners', term: 'Coverage C', definition: 'Personal property coverage for covered belongings subject to limits/conditions.', tag: 'ho' },
  { topicId: 'homeowners', term: 'Coverage D', definition: 'Loss of use coverage for additional living expense after a covered loss.', tag: 'ho' },
  { topicId: 'dwelling', term: 'DP-1', definition: 'Basic dwelling form, usually named perils with more limited protection.', tag: 'dp' },
  { topicId: 'dwelling', term: 'DP-3', definition: 'Special dwelling form typically open perils on dwelling and named perils on personal property.', tag: 'dp' },
  { topicId: 'commercial-property', term: 'Business Personal Property', definition: 'Commercial contents used in business, covered when scheduled in policy.', tag: 'cpp' },
  { topicId: 'commercial-property', term: 'Causes of Loss - Special', definition: 'Broadest commercial causes-of-loss form, generally open perils subject to exclusions.', tag: 'cpp' },
  { topicId: 'valuation', term: 'Actual Cash Value', definition: 'Cost to repair/replace minus depreciation.', tag: 'valuation' },
  { topicId: 'valuation', term: 'Coinsurance', definition: 'Condition requiring insured to carry stated % of value to avoid penalty.', tag: 'valuation' },
  { topicId: 'valuation', term: 'Mortgagee Clause', definition: 'Protects mortgagee interests and outlines rights/obligations under policy.', tag: 'valuation' },
  { topicId: 'cgl', term: 'Coverage A', definition: 'CGL bodily injury/property damage liability coverage.', tag: 'cgl' },
  { topicId: 'cgl', term: 'Coverage B', definition: 'CGL personal and advertising injury liability coverage.', tag: 'cgl' },
  { topicId: 'cgl', term: 'Coverage C', definition: 'CGL medical payments for minor injuries regardless of fault, subject to terms.', tag: 'cgl' },
  { topicId: 'auto', term: 'Symbol 1', definition: 'Business Auto liability symbol for any auto.', tag: 'auto' },
  { topicId: 'auto', term: 'UM/UIM', definition: 'Coverage for injuries caused by uninsured/underinsured motorists, where applicable.', tag: 'auto' },
  { topicId: 'workers-comp', term: 'Exclusive Remedy', definition: 'Workers comp usually limits employee tort claims against employer for job injuries.', tag: 'wc' },
  { topicId: 'workers-comp', term: 'Temporary Total Disability', definition: 'Benefit category replacing wages while employee is fully unable to work short-term.', tag: 'wc' },
  { topicId: 'bop', term: 'BOP Eligibility', definition: 'Business Owners Policy fits smaller, lower-risk businesses meeting carrier rules.', tag: 'bop' },
  { topicId: 'core-concepts', term: 'Insurable Interest', definition: 'Lawful financial interest in not suffering a loss.', tag: 'core' },
  { topicId: 'core-concepts', term: 'Subrogation', definition: 'Insurer right to pursue responsible third party after claim payment.', tag: 'core' },
  { topicId: 'core-concepts', term: 'Indemnity', definition: 'Principle that insurance should restore, not create gain.', tag: 'core' },
  { topicId: 'ethics', term: 'Twisting', definition: 'Improperly inducing policy replacement through misleading comparisons.', tag: 'ethics' },
  { topicId: 'ethics', term: 'Fiduciary Responsibility', definition: 'Producer duty to handle premiums and client matters with trust and care.', tag: 'ethics' }
];

const scenarioSeeds: ScenarioSeed[] = [
  {
    topicId: 'homeowners',
    caseText: 'A kitchen fire makes a home uninhabitable for three months while repairs occur.',
    question: 'Which homeowners coverage is most directly intended for temporary housing costs?',
    correct: 'Coverage D (Loss of Use).',
    wrong: ['Coverage B only.', 'Coverage C only.', 'No section addresses living expenses.'],
    explain: 'Coverage D commonly applies to additional living expenses after a covered loss.'
  },
  {
    topicId: 'valuation',
    caseText: 'An insured carries only 50% of required insurance under an 80% coinsurance clause and has a partial loss.',
    question: 'What exam-style result is most likely?',
    correct: 'Claim payment may be reduced by a coinsurance penalty.',
    wrong: ['Automatic full policy limit payment.', 'Claim denied because partial losses are excluded.', 'Coinsurance never affects payments.'],
    explain: 'Coinsurance penalties can reduce payment when carried limits are below required thresholds.'
  },
  {
    topicId: 'cgl',
    caseText: 'A customer alleges bodily injury after slipping on a wet floor in a retail store.',
    question: 'Which CGL section is most likely implicated first?',
    correct: 'Coverage A bodily injury/property damage liability.',
    wrong: ['Coverage B personal and advertising injury.', 'Coverage C employee workers compensation.', 'No CGL coverage can apply to premises losses.'],
    explain: 'Premises bodily injury claims are typically evaluated under Coverage A.'
  },
  {
    topicId: 'auto',
    caseText: 'A company has a business auto policy showing Symbol 1 for liability.',
    question: 'What does Symbol 1 broadly indicate?',
    correct: 'Any auto liability scope.',
    wrong: ['Owned autos only.', 'Hired autos only.', 'Scheduled autos for physical damage only.'],
    explain: 'Symbol 1 is broad for liability and is commonly tested.'
  },
  {
    topicId: 'workers-comp',
    caseText: 'An employee is hurt on the job and receives statutory workers compensation benefits.',
    question: 'Which concept is most directly shown?',
    correct: 'Exclusive remedy generally limits employer tort suits.',
    wrong: ['Automatic umbrella liability activation.', 'Guaranteed punitive damages under WC.', 'Workers compensation never covers medical costs.'],
    explain: 'Workers compensation is generally the employee’s primary remedy for covered job injuries.'
  },
  {
    topicId: 'ethics',
    caseText: 'A producer exaggerates shortcomings of an existing policy to force replacement.',
    question: 'This is best described as:',
    correct: 'Twisting (an unfair sales practice).',
    wrong: ['Permissible comparative advertising.', 'Subrogation procedure.', 'Coinsurance compliance.'],
    explain: 'Misleading replacement tactics are commonly treated as unfair trade practices.'
  }
];

function optionPack(seed: ScenarioSeed) {
  const options = [
    { id: uuidv4(), text: seed.correct, isCorrect: true, reason: seed.explain },
    ...seed.wrong.map((text) => ({ id: uuidv4(), text, isCorrect: false, reason: 'This option conflicts with standard policy intent, structure, or exclusion logic.' }))
  ];
  return options.sort(() => Math.random() - 0.5);
}

function pickTopicsByWeakness(topics: Topic[]) {
  return [...topics].sort((a, b) => a.score - b.score);
}

export function generateCards(topics: Topic[], count: number, settings: UserSettings, focusTopicIds?: string[]): Card[] {
  const scopedTopics = focusTopicIds?.length ? topics.filter((t) => focusTopicIds.includes(t.id)) : topics;
  const weighted = pickTopicsByWeakness(scopedTopics);
  const definitionTarget = Math.round(count * settings.definitionRatio);
  const cards: Card[] = [];

  for (let i = 0; i < count; i += 1) {
    const topic = weighted[i % weighted.length];
    const difficulty = Math.max(1, Math.min(5, settings.difficulty + ((i % 5) - 2 >= 0 ? 1 : 0)));

    if (i < definitionTarget) {
      const seedPool = definitionSeeds.filter((seed) => seed.topicId === topic.id);
      const seed = seedPool[i % Math.max(1, seedPool.length)] ?? definitionSeeds[i % definitionSeeds.length];
      const reverse = i % 3 === 0;
      cards.push({
        id: uuidv4(),
        topicId: topic.id,
        type: 'definition',
        prompt: reverse ? `Identify the insurance term: ${seed.definition}` : `Define: ${seed.term}`,
        answer: reverse ? seed.term : seed.definition,
        explanation: 'High-yield exam concept: be ready to distinguish this term from similar coverage or condition language.',
        tags: [seed.tag, topic.category],
        difficulty,
        flagged: false,
        stats: statsSeed(),
        srs: srsSeed()
      });
    } else {
      const seedPool = scenarioSeeds.filter((seed) => seed.topicId === topic.id);
      const seed = seedPool[(i - definitionTarget) % Math.max(1, seedPool.length)] ?? scenarioSeeds[(i - definitionTarget) % scenarioSeeds.length];
      cards.push({
        id: uuidv4(),
        topicId: topic.id,
        type: 'scenario',
        prompt: `${seed.caseText} ${seed.question}`,
        options: optionPack(seed),
        answer: seed.correct,
        explanation: `${seed.explain} Wrong choices are wrong because they misstate policy purpose, overstate coverage, or ignore limits and exclusions.`,
        tags: ['scenario', topic.category],
        difficulty,
        flagged: false,
        stats: statsSeed(),
        srs: srsSeed()
      });
    }
  }

  return cards;
}
