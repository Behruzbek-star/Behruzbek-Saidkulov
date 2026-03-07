import { Card, Difficulty, Settings, Topic, STUDY_TOPICS } from './types';

interface GeneratorConfig {
  settings: Settings;
}

interface UserState {
  topicStats: Record<string, { correct: number; total: number }>;
  scoreHistory: { propertyPct: number; casualtyPct: number; overallPct: number; date: string }[];
}

interface BankQuestion {
  id: string;
  topic: Topic;
  prompt: string;
  options: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

const QUIZ_BANK: BankQuestion[] = [
  {
    id: 'q1b-1',
    topic: 'Insurance Regulation',
    prompt: 'An insurance company incorporated in Wisconsin and conducting business in Wisconsin is known as a domestic company. What kind of company are they considered if they do business in Minnesota?',
    options: ['Alien', 'Domestic', 'Foreign', 'Non-admitted'],
    answerIndex: 2,
    explanation: 'A company is domestic only in its state of incorporation and foreign in another U.S. state.',
  },
  {
    id: 'q1b-2',
    topic: 'General Insurance',
    prompt: 'All of the following statements about a stock insurance company are true EXCEPT',
    options: ['a stock company pays dividends to stockholders', 'a stock company is a participating company', 'a stock company is a nonparticipating company', 'a stock company has shareholders'],
    answerIndex: 1,
    explanation: 'Stock insurers are generally nonparticipating; policyholders usually do not receive dividends.',
  },
  {
    id: 'q1b-3',
    topic: 'General Insurance',
    prompt: 'What do insurance companies use to help predict how many losses will occur in a group or class of individuals?',
    options: ['The law of large numbers', 'Standard and Poor’s Insurance Rating Service', 'Risk retention groups', 'Adverse selection'],
    answerIndex: 0,
    explanation: 'The law of large numbers improves predictability as the exposure group increases.',
  },
  {
    id: 'q1b-4',
    topic: 'Insurance Regulation',
    prompt: 'States require companies to have a license to sell insurance in the state. The license is called',
    options: ['a certificate of authority', 'a reinsurance license', 'a producer’s license', 'an admittance license'],
    answerIndex: 0,
    explanation: 'Insurers need a certificate of authority from the state to transact insurance.',
  },
  {
    id: 'risk-1',
    topic: 'General Insurance',
    prompt: 'All of the following are requirements of an insurable pure risk EXCEPT',
    options: ['premiums must be calculable', 'premiums must be affordable', 'the risk must be catastrophic for the insurance company', 'the loss must have been accidental'],
    answerIndex: 2,
    explanation: 'Insurable risks should not be catastrophic to the insurer.',
  },
  {
    id: 'risk-2',
    topic: 'Insurance Regulation',
    prompt: 'Insurers may be classified according to their financial strength. This includes all of the following factors EXCEPT',
    options: ['number of clients', 'loss experience', 'investment performance', 'operating expenses'],
    answerIndex: 0,
    explanation: 'Financial strength focuses on financial and operating metrics, not client count alone.',
  },
  {
    id: 'u2-1',
    topic: 'General Insurance',
    prompt: 'An insurance contract is prepared by one party (the insurance company) with little or no opportunity for the other party (the insured) to bargain. This characteristic is called',
    options: ['conditional', 'unilateral', 'aleatory', 'adhesion'],
    answerIndex: 3,
    explanation: 'Insurance contracts are contracts of adhesion.',
  },
  {
    id: 'u2-2',
    topic: 'General Insurance',
    prompt: 'In insurance, an insured may pay premiums for many years without having a loss, or an insured may suffer a loss and get a larger amount of money from the insurance company than he has paid in premiums. For this reason, an insurance contract is',
    options: ['aleatory', 'unilateral', 'personal', 'conditional'],
    answerIndex: 0,
    explanation: 'Aleatory means unequal exchange values depending on uncertain loss.',
  },
  {
    id: 'u2-3',
    topic: 'General Insurance',
    prompt: 'In an insurance contract, the consideration that the insured gives is called',
    options: ['the premium payment', 'the offer', 'the acceptance', 'the agreement'],
    answerIndex: 0,
    explanation: 'The insured’s consideration is the premium and truthful application statements.',
  },
  {
    id: 'u2-4',
    topic: 'General Insurance',
    prompt: 'Which of the following individuals would be considered a competent party in an insurance contract?',
    options: ['Curt, who turns 12 at the end of year', 'Stephen, who is 21, does not have a job, and lives at home with his parents', 'Maria, who has been drinking heavily at a bar prior to meeting with her insurance agent', 'Alexis, who recently was diagnosed as mentally insane'],
    answerIndex: 1,
    explanation: 'Competence generally requires legal age and mental capacity; employment status is irrelevant.',
  },
  {
    id: 'u2-5',
    topic: 'General Insurance',
    prompt: 'An agreement between two parties is also called',
    options: ['adhesion', 'aleatory', 'offer and acceptance', 'unilateral'],
    answerIndex: 2,
    explanation: 'A valid contract includes offer and acceptance.',
  },
  {
    id: 'u2-6',
    topic: 'Insurance Regulation',
    prompt: 'Anthony intentionally lied on his insurance application to obtain coverage. This is an example of',
    options: ['concealment', 'fraud', 'estoppel', 'adhesion'],
    answerIndex: 1,
    explanation: 'Intentional deception for gain is fraud.',
  },
  {
    id: 'u2-7',
    topic: 'General Insurance',
    prompt: 'The failure to disclose known facts is',
    options: ['material misrepresentation', 'concealment', 'waiver', 'fraud'],
    answerIndex: 1,
    explanation: 'Concealment is withholding material information.',
  },
  {
    id: 'u2-8',
    topic: 'General Insurance',
    prompt: 'A statement that is guaranteed to be true is',
    options: ['a warranty', 'a representation', 'an impersonation', 'a misrepresentation'],
    answerIndex: 0,
    explanation: 'A warranty is guaranteed true and material to the contract.',
  },
  {
    id: 'u2-9',
    topic: 'General Insurance',
    prompt: 'Allison’s insurer accepted late premiums for years, then tried to cancel for late payment. The reinstatement decision is an example of',
    options: ['waiver', 'adhesion', 'aleatory', 'estoppel'],
    answerIndex: 3,
    explanation: 'Estoppel can prevent an insurer from enforcing a position inconsistent with prior conduct.',
  },
  {
    id: 'u2-10',
    topic: 'General Insurance',
    prompt: 'Misrepresentations do not necessarily void insurance contracts. To do so, they must be',
    options: ['material', 'unilateral', 'personal', 'warranties'],
    answerIndex: 0,
    explanation: 'A misrepresentation generally must be material to affect the contract.',
  },
  {
    id: 'q3b-1',
    topic: 'Insurance Regulation',
    prompt: 'Which of the following is NOT a ratio that the insurer uses to evaluate performance?',
    options: ['Loss ratio', 'Expense ratio', 'Combined ratio', 'Cost ratio'],
    answerIndex: 3,
    explanation: 'Loss, expense, and combined ratios are standard insurer performance measures.',
  },
  {
    id: 'q3b-2',
    topic: 'General Insurance',
    prompt: 'Which term is an oral or written statement made by the agent that gives the insured immediate coverage for a specified time?',
    options: ['A binder', 'An application', 'An insurable interest', 'A contract'],
    answerIndex: 0,
    explanation: 'A binder provides temporary evidence of coverage before policy issuance.',
  },
  {
    id: 'q3b-3',
    topic: 'General Insurance',
    prompt: 'Which of the following is NOT an example of an insurable interest?',
    options: ['A dog groomer’s interest in pets in his building for service', 'A person’s interest in the home she owns', 'A person’s interest in the home that his parents own', 'A person’s interest in home improvements he made to rental property he occupies'],
    answerIndex: 2,
    explanation: 'Without a financial stake, insurable interest usually does not exist.',
  },
  {
    id: 'u3-1',
    topic: 'Property and Casualty Insurance Basics',
    prompt: 'What type of insurance policy protects the insured from loss caused by damage to covered property by a covered peril?',
    options: ['Property insurance policy', 'Casualty insurance policy', 'Accident and health insurance policy', 'Life insurance policy'],
    answerIndex: 0,
    explanation: 'Property policies cover direct physical loss to covered property by covered causes.',
  },
  {
    id: 'u3-2',
    topic: 'Property and Casualty Insurance Basics',
    prompt: 'Which of the following is not a part of the structure of a property or casualty policy?',
    options: ['Endorsements', 'Declarations', 'Explanations', 'Conditions'],
    answerIndex: 2,
    explanation: 'Standard structure includes declarations, insuring agreement, definitions, exclusions, conditions, and endorsements.',
  },
  {
    id: 'u3-3',
    topic: 'Property and Casualty Insurance Basics',
    prompt: 'Which term describes the person listed first on declarations when there is more than one named insured?',
    options: ['Additional insured', 'Named insured', 'Policyholder', 'First-named insured'],
    answerIndex: 3,
    explanation: 'The first-named insured has specific policy administration rights/responsibilities.',
  },
  {
    id: 'u3-4',
    topic: 'Property and Casualty Insurance Basics',
    prompt: 'A policy covers loss only within the U.S. or Canada. This is called',
    options: ['The policy territory provision', 'The policy period provision', 'The location of loss provision', 'The other insurance provision'],
    answerIndex: 0,
    explanation: 'Policy territory states geographic scope where coverage applies.',
  },
  {
    id: 'u3-5',
    topic: 'Property and Casualty Insurance Basics',
    prompt: 'When an insured cancels a policy before expiration, unearned premium is returned on',
    options: ['a flat basis', 'a short rate basis', 'an unearned basis', 'a pro rata basis'],
    answerIndex: 1,
    explanation: 'Insured-requested cancellation commonly uses short-rate return.',
  },
  {
    id: 'u3-6',
    topic: 'Homeowners (2011) Policy',
    prompt: 'Todd and Mary have a $500 deductible and $2,500 covered roof damage. How much does insurer pay?',
    options: ['$500', '$2,000', '$2,500', '$3,000'],
    answerIndex: 1,
    explanation: 'Covered loss minus deductible: $2,500 - $500 = $2,000.',
  },
  {
    id: 'u3-7',
    topic: 'Property and Casualty Insurance Basics',
    prompt: 'Which is NOT a type of merit rating modifying manual premium based on loss experience?',
    options: ['Experience rating', 'Retrospective rating', 'Schedule rating', 'Manual rating'],
    answerIndex: 3,
    explanation: 'Manual rating is the base method before merit modification.',
  },
  {
    id: 'u3-8',
    topic: 'Property and Casualty Insurance Basics',
    prompt: 'Premium rates include loss costs, operating expenses, claims handling costs, and',
    options: ['profits', 'losses', 'cost of living', 'location of insured'],
    answerIndex: 0,
    explanation: 'Rates generally account for expected profit/contingency loading.',
  },
  {
    id: 'u3-9',
    topic: 'Property and Casualty Insurance Basics',
    prompt: 'Marcus has two policies. Company A pays first $15,000 and Company B pays remainder of $20,000 loss. Company A is',
    options: ['excess insurance', 'pro rata insurance', 'primary insurance', 'other insurance'],
    answerIndex: 2,
    explanation: 'The policy paying first is primary; the other is excess.',
  },
  {
    id: 'u3-10',
    topic: 'Property and Casualty Insurance Basics',
    prompt: 'Which provision says policy cannot be transferred without insurer consent unless named insured dies?',
    options: ['Named insured provision', 'Assignment provision', 'Abandonment provision', 'Salvage provision'],
    answerIndex: 1,
    explanation: 'Assignment rights are restricted without insurer consent.',
  },
  {
    id: 'u4-1',
    topic: 'Property and Casualty Insurance Basics',
    prompt: 'A financial loss resulting directly from property damage (e.g., house fire) is called',
    options: ['a direct loss', 'an indirect loss', 'a consequential loss', 'an expense loss'],
    answerIndex: 0,
    explanation: 'Direct loss is immediate damage to covered property itself.',
  },
  {
    id: 'u4-2',
    topic: 'Property and Casualty Insurance Basics',
    prompt: 'Home value $200,000 insured for $100,000 with 80% coinsurance requirement and total destruction. Insurer pays',
    options: ['$100,000', '$125,000', '$160,000', '$200,000'],
    answerIndex: 0,
    explanation: 'Recovery is limited by policy limit when underinsured.',
  },
  {
    id: 'u4-3',
    topic: 'Property and Casualty Insurance Basics',
    prompt: 'Which policy insures property against perils specifically listed?',
    options: ['Named peril policy', 'Specific peril policy', 'Open peril policy', 'Listed peril policy'],
    answerIndex: 0,
    explanation: 'Named peril policies cover only listed causes of loss.',
  },
  {
    id: 'u4-4',
    topic: 'Homeowners (2011) Policy',
    prompt: 'After home damage, family had hotel and food costs while repairs were made. What was indirect loss?',
    options: ['The semi truck', 'The house', 'The hotel bill and cost of food', 'The repairs'],
    answerIndex: 2,
    explanation: 'Additional living costs from displacement are indirect/consequential losses.',
  },
  {
    id: 'u4-5',
    topic: 'Property and Casualty Insurance Basics',
    prompt: 'The term that describes absence of both people and property from premises is',
    options: ['vacant', 'unoccupied', 'abandoned', 'valuation'],
    answerIndex: 0,
    explanation: 'Vacant usually means no occupants and insufficient contents.',
  },
  {
    id: 'u4-6',
    topic: 'Property and Casualty Insurance Basics',
    prompt: 'Which coverage insures against all direct physical loss risks not specifically excluded?',
    options: ['Broad perils', 'Special perils', 'Basic perils', 'Direct perils'],
    answerIndex: 1,
    explanation: 'Special form is typically open-peril except exclusions.',
  },
  {
    id: 'u4-7',
    topic: 'Property and Casualty Insurance Basics',
    prompt: 'Insurer repairs antique boat with less expensive working materials. This settlement type is',
    options: ['Market value', 'Repair cost', 'Replacement cost', 'Functional replacement cost'],
    answerIndex: 3,
    explanation: 'Functional replacement uses less costly functionally equivalent materials.',
  },
  {
    id: 'u4-8',
    topic: 'Property and Casualty Insurance Basics',
    prompt: 'Actual cash value equals replacement cost minus',
    options: ['depreciation', 'repair cost', 'market value', 'agreed value'],
    answerIndex: 0,
    explanation: 'ACV generally equals replacement cost less depreciation.',
  },
  {
    id: 'u4-9',
    topic: 'Property and Casualty Insurance Basics',
    prompt: 'A single limit that applies to all items of a property type is called',
    options: ['Personal', 'Blanket', 'Specific', 'Scheduled'],
    answerIndex: 1,
    explanation: 'Blanket insurance applies one limit across multiple items/classes.',
  },
  {
    id: 'u4-10',
    topic: 'Property and Casualty Insurance Basics',
    prompt: 'Which of the following is an extended coverage peril?',
    options: ['Wind', 'Falling objects', 'Freezing of plumbing', 'Weight of ice, snow, or sleet'],
    answerIndex: 0,
    explanation: 'Windstorm/hail is a classic extended coverage peril.',
  },
  {
    id: 'u5-1',
    topic: 'General Insurance',
    prompt: 'An aggregate limit is the most a company will pay for',
    options: ['any one person or item of property', 'any one event', 'over the policy period', 'an event in the lifetime of the contract'],
    answerIndex: 2,
    explanation: 'Aggregate limit is maximum for all covered losses during policy term.',
  },
  {
    id: 'u5-2',
    topic: 'General Insurance',
    prompt: 'Failure to use care required to protect another person or property from harm is',
    options: ['negligence', 'tort', 'assumption of risk', 'moral hazard'],
    answerIndex: 0,
    explanation: 'Negligence is failure to exercise reasonable care.',
  },
  {
    id: 'u5-3',
    topic: 'General Insurance',
    prompt: 'Liability imposed by law without regard to negligence is',
    options: ['vicarious liability', 'absolute liability', 'imputed liability', 'prejudgment liability'],
    answerIndex: 1,
    explanation: 'Absolute/strict liability applies regardless of negligence.',
  },
  {
    id: 'u5-4',
    topic: 'Auto Insurance',
    prompt: 'Auto policy with $50,000 BI and $25,000 PD limit is an example of',
    options: ['a split limit policy', 'a single limit policy', 'a per accident policy', 'a preoccurrence policy'],
    answerIndex: 0,
    explanation: 'Separate BI and PD amounts are split limits.',
  },
  {
    id: 'u5-5',
    topic: 'General Insurance',
    prompt: 'Lee was 25% negligent. Under comparative negligence laws,',
    options: ['Lee cannot recover any damages', 'Lee’s award is reduced by 75%', 'Lee recovers full amount', 'Lee’s award is reduced by 25%'],
    answerIndex: 3,
    explanation: 'Comparative negligence reduces recovery by claimant’s share of fault.',
  },
  {
    id: 'u5-6',
    topic: 'General Insurance',
    prompt: 'Which is NOT a supplementary payment in a liability policy?',
    options: ['First aid costs', 'Premium for a bail bond', 'Investigation expenses', 'Judgment against insured for bodily injury liability'],
    answerIndex: 3,
    explanation: 'Supplementary payments are costs in addition to damages owed to claimant.',
  },
  {
    id: 'u5-7',
    topic: 'General Insurance',
    prompt: 'Morgan accidentally breaks Tom’s window. The first party to this loss is',
    options: ['Morgan', 'ABC Insurance', 'Tom', 'the window'],
    answerIndex: 0,
    explanation: 'In liability context, first party is insured; third party is injured claimant.',
  },
  {
    id: 'u5-8',
    topic: 'General Insurance',
    prompt: 'A liability insurance policy pays',
    options: ['the first party', 'the second party', 'the third party', 'the insured'],
    answerIndex: 2,
    explanation: 'Liability insurance pays covered damages owed to third parties.',
  },
  {
    id: 'u5-9',
    topic: 'General Insurance',
    prompt: 'If courts find willful conduct causing injury, they may award',
    options: ['punitive damages to the injured party', 'punitive damages to the defendant', 'general damages to injured party', 'compensatory damages to the defendant'],
    answerIndex: 0,
    explanation: 'Punitive damages are intended to punish egregious conduct.',
  },
  {
    id: 'u5-10',
    topic: 'General Insurance',
    prompt: 'Which is NOT a duty after loss in liability policy?',
    options: ['Notify insurer in writing', 'Notify third party’s insurer', 'Forward demands/notices/summonses', 'Assist as needed during case'],
    answerIndex: 1,
    explanation: 'Insured’s duty is to their own insurer, not claimant’s insurer.',
  },
];

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
  const propertyBoost = recent && recent.propertyPct < 75 ? 1.3 : 1;
  const casualtyBoost = recent && recent.casualtyPct < 75 ? 1.3 : 1;

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

export const generateCards = (config: GeneratorConfig, userState: UserState, count: number, seed = Date.now()): Card[] => {
  const rand = mulberry32(seed);
  const allowedTopics = config.settings.selectedTopics.length ? config.settings.selectedTopics : [...STUDY_TOPICS];
  const bank = QUIZ_BANK.filter((q) => allowedTopics.includes(q.topic));
  if (bank.length === 0) return [];

  return Array.from({ length: count }, (_, i) => {
    const chosenTopic = pickWeightedTopic(allowedTopics, userState, rand);
    const topicQuestions = bank.filter((q) => q.topic === chosenTopic);
    const fallback = bank[Math.floor(rand() * bank.length)];
    const source = topicQuestions.length ? topicQuestions[Math.floor(rand() * topicQuestions.length)] : fallback;

    return {
      id: `${source.id}-${seed}-${i}-${Math.floor(rand() * 9999)}`,
      type: 'mcq',
      prompt: source.prompt,
      options: source.options,
      answerIndex: source.answerIndex,
      explanation: source.explanation,
      topic: source.topic,
      difficulty: 'Medium',
      style: /\?|which|what/i.test(source.prompt) ? 'definition' : 'scenario',
      createdAt: new Date().toISOString(),
    };
  });
};
