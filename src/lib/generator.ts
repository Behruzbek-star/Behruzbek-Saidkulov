import { Card, Settings, Topic, STUDY_TOPICS } from './types';

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
}

// NOTE: Only user-provided textbook questions are stored here.
const QUIZ_BANK: BankQuestion[] = [
  { id: 'q1b-1', topic: 'Insurance Regulation', prompt: 'An insurance company incorporated in Wisconsin and conducting business in Wisconsin is known as a domestic company. What kind of company are they considered if they do business in Minnesota?', options: ['Alien', 'Domestic', 'Foreign', 'Non-admitted'], answerIndex: 2 },
  { id: 'q1b-2', topic: 'General Insurance', prompt: 'All of the following statements about a stock insurance company are true EXCEPT', options: ['a stock company pays dividends to stockholders', 'a stock company is a participating company', 'a stock company is a nonparticipating company', 'a stock company has shareholders'], answerIndex: 1 },
  { id: 'q1b-3', topic: 'General Insurance', prompt: 'What do insurance companies use to help predict how many losses will occur in a group or class of individuals?', options: ['The law of large numbers', 'Standard and Poor’s Insurance Rating Service', 'Risk retention groups', 'Adverse selection'], answerIndex: 0 },
  { id: 'q1b-4', topic: 'Insurance Regulation', prompt: 'States require companies to have a license to sell insurance in the state. The license is called', options: ['a certificate of authority', 'a reinsurance license', 'a producer’s license', 'an admittance license'], answerIndex: 0 },
  { id: 'risk-1', topic: 'General Insurance', prompt: 'All of the following are requirements of an insurable pure risk EXCEPT', options: ['premiums must be calculable', 'premiums must be affordable', 'the risk must be catastrophic for the insurance company', 'the loss must have been accidental'], answerIndex: 2 },
  { id: 'risk-2', topic: 'Insurance Regulation', prompt: 'Insurers may be classified according to their financial strength. This includes all of the following factors EXCEPT', options: ['number of clients', 'loss experience', 'investment performance', 'operating expenses'], answerIndex: 0 },
  { id: 'u2-1', topic: 'General Insurance', prompt: 'An insurance contract is prepared by one party (the insurance company) with little or no opportunity for the other party (the insured) to bargain. This characteristic is called', options: ['conditional', 'unilateral', 'aleatory', 'adhesion'], answerIndex: 3 },
  { id: 'u2-2', topic: 'General Insurance', prompt: 'In insurance, an insured may pay premiums for many years without having a loss, or an insured may suffer a loss and get a larger amount of money from the insurance company than he has paid in premiums. For this reason, an insurance contract is', options: ['aleatory', 'unilateral', 'personal', 'conditional'], answerIndex: 0 },
  { id: 'u2-3', topic: 'General Insurance', prompt: 'In an insurance contract, the consideration that the insured gives is called', options: ['the premium payment', 'the offer', 'the acceptance', 'the agreement'], answerIndex: 0 },
  { id: 'u2-4', topic: 'General Insurance', prompt: 'Which of the following individuals would be considered a competent party in an insurance contract?', options: ['Curt, who turns 12 at the end of year', 'Stephen, who is 21, does not have a job, and lives at home with his parents', 'Maria, who has been drinking heavily at a bar prior to meeting with her insurance agent', 'Alexis, who recently was diagnosed as mentally insane'], answerIndex: 1 },
  { id: 'u2-5', topic: 'General Insurance', prompt: 'An agreement between two parties is also called', options: ['adhesion', 'aleatory', 'offer and acceptance', 'unilateral'], answerIndex: 2 },
  { id: 'u2-6', topic: 'Insurance Regulation', prompt: 'Anthony intentionally lied on his insurance application to obtain coverage. This is an example of', options: ['concealment', 'fraud', 'estoppel', 'adhesion'], answerIndex: 1 },
  { id: 'u2-7', topic: 'General Insurance', prompt: 'The failure to disclose known facts is', options: ['material misrepresentation', 'concealment', 'waiver', 'fraud'], answerIndex: 1 },
  { id: 'u2-8', topic: 'General Insurance', prompt: 'A statement that is guaranteed to be true is', options: ['a warranty', 'a representation', 'an impersonation', 'a misrepresentation'], answerIndex: 0 },
  { id: 'u2-9', topic: 'General Insurance', prompt: 'Allison’s auto insurance policy is due on the 10th of each month. Ever since she has had the policy, she has sent the premium in on the 16th of the month. The insurer has been accepting the premium this way for the past 5 years. A new CEO takes over and decides to cancel Allison’s policy for a nonpayment of premium. Allison contests this decision and legally gets the policy reinstated. The decision to reinstate the policy is an example of', options: ['waiver', 'adhesion', 'aleatory', 'estoppel'], answerIndex: 3 },
  { id: 'u2-10', topic: 'General Insurance', prompt: 'Misrepresentations do not necessarily void insurance contracts. To do so, they must be', options: ['material', 'unilateral', 'personal', 'warranties'], answerIndex: 0 },
  { id: 'u3-1', topic: 'Property and Casualty Insurance Basics', prompt: 'What type of insurance policy protects the insured from loss caused by damage to covered property by a covered peril?', options: ['Property insurance policy', 'Casualty insurance policy', 'Accident and health insurance policy', 'Life insurance policy'], answerIndex: 0 },
  { id: 'u3-2', topic: 'Property and Casualty Insurance Basics', prompt: 'Which of the following is not a part of the structure of a property or casualty policy?', options: ['Endorsements', 'Declarations', 'Explanations', 'Conditions'], answerIndex: 2 },
  { id: 'u3-3', topic: 'Property and Casualty Insurance Basics', prompt: 'Which of the following terms describes the person listed first on the declarations page of a policy when there is more than one named insured?', options: ['Additional insured', 'Named insured', 'Policyholder', 'First-named insured'], answerIndex: 3 },
  { id: 'u3-4', topic: 'Property and Casualty Insurance Basics', prompt: 'Greg’s policy states that a loss will not be covered unless it occurs within the United States or Canada. What is the name of this provision in his policy?', options: ['The policy territory provision', 'The policy period provision', 'The location of loss provision', 'The other insurance provision'], answerIndex: 0 },
  { id: 'u3-5', topic: 'Property and Casualty Insurance Basics', prompt: 'When an insured decides to cancel an insurance policy before the expiration date, the unearned premium is returned on', options: ['a flat basis', 'a short rate basis', 'an unearned basis', 'a pro rata basis'], answerIndex: 1 },
  { id: 'u3-6', topic: 'Homeowners (2011) Policy', prompt: 'Todd and Mary have insurance protection for their home with a policy deductible of $500. One night, a thunderstorm knocks a tree onto their roof and causes $2,500 in damage. How much money will the insurance company pay to Todd and Mary to fix their roof?', options: ['$500', '$2,000', '$2,500', '$3,000'], answerIndex: 1 },
  { id: 'u3-7', topic: 'Property and Casualty Insurance Basics', prompt: 'Which of the following is NOT a type of merit rating that modifies the manual premium on the basis of the insured’s loss experience?', options: ['Experience rating', 'Retrospective rating', 'Schedule rating', 'Manual rating'], answerIndex: 3 },
  { id: 'u3-8', topic: 'Property and Casualty Insurance Basics', prompt: 'Factors that determine premium rates set by insurance companies include loss costs, operating expenses, claims handling costs, and', options: ['profits', 'losses', 'cost of living', 'location of insured'], answerIndex: 0 },
  { id: 'u3-9', topic: 'Property and Casualty Insurance Basics', prompt: 'Marcus has two policies that will cover his $20,000 loss. Company A will pay the first $15,000, and Company B pays the remainder. In this example, Company A’s policy is considered', options: ['excess insurance', 'pro rata insurance', 'primary insurance', 'other insurance'], answerIndex: 2 },
  { id: 'u3-10', topic: 'Property and Casualty Insurance Basics', prompt: 'Which provision specifies that an insurance policy may not be transferred to anyone else without the written consent of the insurer unless the named insured dies?', options: ['Named insured provision', 'Assignment provision', 'Abandonment provision', 'Salvage provision'], answerIndex: 1 },
  { id: 'u4-1', topic: 'Property and Casualty Insurance Basics', prompt: 'A financial loss resulting directly from a loss to property, such as a house fire or a diamond ring being stolen, is called', options: ['a direct loss', 'an indirect loss', 'a consequential loss', 'an expense loss'], answerIndex: 0 },
  { id: 'u4-2', topic: 'Property and Casualty Insurance Basics', prompt: 'An insured owns a $200,000 home and insures it for $100,000. If the insured’s home was completely destroyed by a fire, how much money will the insurance company pay if the insured has a policy that requires a minimum of 80% coverage?', options: ['$100,000', '$125,000', '$160,000', '$200,000'], answerIndex: 0 },
  { id: 'u4-3', topic: 'Property and Casualty Insurance Basics', prompt: 'Which peril policy insures a property against all perils specifically listed in the policy?', options: ['Named peril policy', 'Specific peril policy', 'Open peril policy', 'Listed peril policy'], answerIndex: 0 },
  { id: 'u4-4', topic: 'Homeowners (2011) Policy', prompt: 'When a semi truck hit Greg’s house, he and his family had to stay in a nearby hotel for two weeks while repairs were being made. The hotel bill came to $1,000, and the cost of food came to $415. What was the indirect loss?', options: ['The semi truck', 'The house', 'The hotel bill and cost of food', 'The repairs'], answerIndex: 2 },
  { id: 'u4-5', topic: 'Property and Casualty Insurance Basics', prompt: 'The term that describes the absences of both people and property from the premises is', options: ['vacant', 'unoccupied', 'abandoned', 'valuation'], answerIndex: 0 },
  { id: 'u4-6', topic: 'Property and Casualty Insurance Basics', prompt: 'Which of the following coverages insures against all risks of direct physical loss that are not specifically excluded in the policy?', options: ['Broad perils', 'Special perils', 'Basic perils', 'Direct perils'], answerIndex: 1 },
  { id: 'u4-7', topic: 'Property and Casualty Insurance Basics', prompt: 'Timothy has an antique boat, and it was recently damaged while on a fishing trip. The insurance company agreed to repair the boat with less expensive, working materials. This is an example of which type of claim settlement?', options: ['Market value', 'Repair cost', 'Replacement cost', 'Functional replacement cost'], answerIndex: 3 },
  { id: 'u4-8', topic: 'Property and Casualty Insurance Basics', prompt: 'Actual cash value is the replacement cost of the property minus', options: ['depreciation', 'repair cost', 'market value', 'agreed value'], answerIndex: 0 },
  { id: 'u4-9', topic: 'Property and Casualty Insurance Basics', prompt: 'Which of the following terms describes a single limit of insurance that applies to all items of that property type?', options: ['Personal', 'Blanket', 'Specific', 'Scheduled'], answerIndex: 1 },
  { id: 'u4-10', topic: 'Property and Casualty Insurance Basics', prompt: 'Which of the following is an extended coverage peril?', options: ['Wind', 'Falling objects', 'Freezing of plumbing', 'Weight of ice, snow, or sleet'], answerIndex: 0 },
  { id: 'u5-1', topic: 'General Insurance', prompt: 'An aggregate limit is the most a company will pay for', options: ['any one person or item of property', 'any one event', 'over the policy period', 'an event in the lifetime of the contract'], answerIndex: 2 },
  { id: 'u5-2', topic: 'General Insurance', prompt: 'Failure to use care that is required to protect another person or property from harm is', options: ['negligence', 'tort', 'assumption of risk', 'moral hazard'], answerIndex: 0 },
  { id: 'u5-3', topic: 'General Insurance', prompt: 'Liability that is imposed as a matter of law without any regards to negligence is', options: ['vicarious liability', 'absolute liability', 'imputed liability', 'prejudgment liability'], answerIndex: 1 },
  { id: 'u5-4', topic: 'Auto Insurance', prompt: 'Ray’s auto policy has a $50,000 bodily injury limit and a $25,000 property damage limit. This is an example of', options: ['a split limit policy', 'a single limit policy', 'a per accident policy', 'a preoccurrence policy'], answerIndex: 0 },
  { id: 'u5-5', topic: 'General Insurance', prompt: 'Lee sues Matthew for injuries that she sustained in an automobile accident. During the trial, it is determined that Lee’s negligence contributed to 25% of the loss. Under comparative negligence laws,', options: ['Lee cannot recover any damages from Matthew', 'Lee’s award will be reduced by 75% of the loss', 'Lee can recover the full amount of the loss from Matthew', 'Lee’s award will be reduced by 25% of the loss'], answerIndex: 3 },
  { id: 'u5-6', topic: 'General Insurance', prompt: 'Which of the following would NOT be included as a supplementary payment in a liability policy?', options: ['First aid costs', 'Premium for a bail', 'Investigation expenses', 'Judgment against the insured for bodily injury liability'], answerIndex: 3 },
  { id: 'u5-7', topic: 'General Insurance', prompt: 'Morgan, who has a liability policy with ABC Insurance, is playing golf with his daughter and hits a drive through the bedroom window of a neighbor, Tom. In this example, the first party to the loss is', options: ['Morgan', 'ABC Insurance', 'Tom', 'the window'], answerIndex: 0 },
  { id: 'u5-8', topic: 'General Insurance', prompt: 'A liability insurance policy pays', options: ['the first party', 'the second party', 'the third party', 'the insured'], answerIndex: 2 },
  { id: 'u5-9', topic: 'General Insurance', prompt: 'If the courts feel that an individual acted willfully in causing an injured party’s damages, it may award', options: ['punitive damages to the injured party', 'punitive damages to the defendant', 'general damages to injured party', 'compensatory damages to the defendant'], answerIndex: 0 },
  { id: 'u5-10', topic: 'General Insurance', prompt: 'Which of the following is NOT one of the duties after a loss in a liability policy?', options: ['Notify the insurance company in writing of the loss.', 'Notify the third party’s insurance company of the loss.', 'Forward all demands, notices, or summonses about the case.', 'Be of assistance as needed during the case.'], answerIndex: 1 },
];

const mulberry32 = (seed: number) => {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffle = <T,>(items: T[], rand: () => number): T[] => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

export const generateCards = (config: GeneratorConfig, _userState: UserState, count: number, seed = Date.now()): Card[] => {
  const rand = mulberry32(seed);
  const allowedTopics = config.settings.selectedTopics.length ? config.settings.selectedTopics : [...STUDY_TOPICS];
  const bank = QUIZ_BANK.filter((q) => allowedTopics.includes(q.topic));
  if (bank.length === 0) return [];

  const shuffled = shuffle(bank, rand);

  return Array.from({ length: count }, (_, i) => {
    const source = shuffled[i % shuffled.length];
    return {
      id: `${source.id}-${seed}-${i}`,
      type: 'mcq',
      prompt: source.prompt,
      options: source.options,
      answerIndex: source.answerIndex,
      explanation: 'From your provided quiz bank.',
      topic: source.topic,
      difficulty: 'Medium',
      style: 'definition',
      createdAt: new Date().toISOString(),
    };
  });
};
