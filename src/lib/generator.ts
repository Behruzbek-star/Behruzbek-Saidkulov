import { Card, Difficulty, Settings, Topic, STUDY_TOPICS } from './types';

interface GeneratorConfig {
  settings: Settings;
}

interface UserState {
  topicStats: Record<string, { correct: number; total: number }>;
  scoreHistory: { propertyPct: number; casualtyPct: number; overallPct: number; date: string }[];
}

interface TopicTemplate {
  concept: string;
  definitionPrompt: string;
  scenarioPrompt: string;
  correct: string;
  distractors: [string, string, string];
  hardCorrect?: string;
  hardDistractors?: [string, string, string];
  explanation: string;
  trap: string;
}

const topicTemplates: Record<Topic, TopicTemplate[]> = {
  'Insurance Regulation': [
    {
      concept: 'producer licensing',
      definitionPrompt: 'What is the best description of producer licensing?',
      scenarioPrompt: 'A person wants to sell coverage to the public. What is the best answer about producer licensing?',
      correct: 'A producer generally needs proper authority before selling, soliciting, or negotiating insurance.',
      distractors: [
        'A producer only needs authority after collecting the first premium.',
        'A producer can skip authority when selling personal lines only.',
        'A producer never needs continuing compliance after licensing.',
      ],
      explanation: 'Licensing focuses on consumer protection and authorized activity before transactions occur.',
      trap: 'A common trap is thinking authority is optional until after the sale is completed.',
    },
    {
      concept: 'market conduct',
      definitionPrompt: 'What is market conduct oversight in insurance?',
      scenarioPrompt: 'An insurer marketing pattern raises concerns. What is the best answer about market conduct?',
      correct: 'It reviews how insurers and producers treat consumers in sales, underwriting, and claims handling.',
      distractors: [
        'It only reviews insurer investment strategy and capital growth.',
        'It applies only when a policyholder files a lawsuit.',
        'It replaces policy language when disputes arise.',
      ],
      explanation: 'Market conduct focuses on fair treatment and compliance in customer-facing practices.',
      trap: 'A common trap is confusing market conduct with financial solvency analysis only.',
    },
  ],
  'General Insurance': [
    {
      concept: 'indemnity',
      definitionPrompt: 'What is indemnity in insurance terms?',
      scenarioPrompt: 'After a covered loss, what is the best answer about indemnity?',
      correct: 'It aims to restore the insured to approximately the pre-loss financial position, not create profit.',
      distractors: [
        'It guarantees payment above the actual loss amount whenever a claim is filed.',
        'It eliminates all deductibles once coverage is confirmed.',
        'It allows duplicate recovery from multiple policies for the same interest.',
      ],
      explanation: 'Indemnity is about financial restoration within policy terms, not enrichment.',
      trap: 'A common trap is assuming insurance is designed to provide a gain after loss.',
    },
    {
      concept: 'insurable interest',
      definitionPrompt: 'What does insurable interest mean?',
      scenarioPrompt: 'A person wants insurance on property they do not financially depend on. What is the best answer?',
      correct: 'The insured must have a legitimate financial stake in preventing the loss.',
      distractors: [
        'The insured only needs to know the owner personally.',
        'Insurable interest is optional if premium is paid in full.',
        'Insurable interest applies only to liability policies.',
      ],
      explanation: 'Insurable interest ties coverage to real financial exposure and helps prevent wagering.',
      trap: 'A common trap is believing premium payment alone creates insurable interest.',
    },
  ],
  'Property and Casualty Insurance Basics': [
    {
      concept: 'peril and hazard',
      definitionPrompt: 'What is the best distinction between a peril and a hazard?',
      scenarioPrompt: 'A student mixes up peril and hazard. What is the best clarification?',
      correct: 'A peril is the cause of loss, while a hazard increases the chance or severity of loss.',
      distractors: [
        'A hazard is the direct cause of loss, while peril is the deductible amount.',
        'Peril and hazard are interchangeable policy terms.',
        'Peril is only used for liability claims and hazard for property claims.',
      ],
      explanation: 'Exam items frequently test this basic distinction across many lines.',
      trap: 'A common trap is treating peril and hazard as synonyms.',
    },
    {
      concept: 'policy structure',
      definitionPrompt: 'What is the best way to read policy structure?',
      scenarioPrompt: 'A candidate asks how to analyze policy language. What is the best answer?',
      correct: 'Start with insuring agreement, then definitions, exclusions, conditions, and endorsements.',
      distractors: [
        'Read endorsements first and ignore the base form.',
        'Only the declarations page matters for claim decisions.',
        'Conditions override every exclusion automatically.',
      ],
      explanation: 'Coverage analysis follows a consistent order to avoid missing limitations.',
      trap: 'A common trap is assuming declarations alone determine final coverage.',
    },
  ],
  'Dwelling (2014) Policy': [
    {
      concept: 'dwelling coverage focus',
      definitionPrompt: 'What is the primary focus of a dwelling policy?',
      scenarioPrompt: 'A property owner asks when a dwelling policy is typically used.',
      correct: 'It is generally used to insure residential dwelling property interests with defined covered causes of loss.',
      distractors: [
        'It is designed only for large manufacturing operations.',
        'It automatically includes broad business income coverage.',
        'It always covers every personal liability exposure without limits.',
      ],
      explanation: 'Dwelling forms focus on residential property coverage structure.',
      trap: 'A common trap is confusing dwelling forms with broader commercial package coverage.',
    },
    {
      concept: 'dwelling policy forms',
      definitionPrompt: 'Which statement best describes basic, broad, and special dwelling forms?',
      scenarioPrompt: 'A candidate compares dwelling form options for covered causes of loss.',
      correct: 'They generally vary by how broad the covered causes of loss are, with broader forms covering more named causes or open-peril structure for selected property.',
      distractors: [
        'They only differ by premium billing schedule, not by covered causes of loss.',
        'All forms automatically include identical liability and medical payments limits.',
        'The broadest form always removes every exclusion and condition.',
      ],
      explanation: 'Exam questions often test how form selection changes the scope of covered causes of loss.',
      trap: 'A common trap is assuming broader forms eliminate exclusions and conditions.',
    },
  ],
  'Homeowners (2011) Policy': [
    {
      concept: 'additional living expense',
      definitionPrompt: 'What is additional living expense under a homeowners policy?',
      scenarioPrompt: 'A home is temporarily uninhabitable after a covered loss.',
      correct: 'It helps pay reasonable extra costs to maintain normal living standards while repairs are underway.',
      distractors: [
        'It pays for all home upgrades chosen by the insured during repairs.',
        'It pays only routine expenses the insured already had before loss.',
        'It replaces the policy deductible for every claim automatically.',
      ],
      hardCorrect: 'It generally reimburses necessary increases in living costs due to a covered loss that makes the residence unfit to live in.',
      hardDistractors: [
        'It reimburses any expense increase even when no covered cause of loss triggered the claim.',
        'It pays only mortgage principal reduction while the property is repaired.',
        'It provides unlimited funds for renovations unrelated to restoring habitability.',
      ],
      explanation: 'Additional living expense is tied to necessary temporary increases in living costs from a covered loss.',
      trap: 'A common trap is selecting options that include upgrades or unrelated discretionary expenses.',
    },
    {
      concept: 'homeowners liability section',
      definitionPrompt: 'Which statement best describes personal liability coverage in homeowners policies?',
      scenarioPrompt: 'A visitor alleges bodily injury at an insured residence and seeks damages.',
      correct: 'It generally responds to covered claims for bodily injury or property damage for which an insured is legally liable, subject to terms and exclusions.',
      distractors: [
        'It automatically pays every injury claim regardless of legal liability.',
        'It applies only when damage occurs to the insured dwelling itself.',
        'It replaces the need to satisfy policy conditions after a claim.',
      ],
      explanation: 'Homeowners liability addresses legal liability exposures to others, not every loss scenario.',
      trap: 'A common trap is confusing liability coverage with first-party property coverage.',
    },
  ],
  'Auto Insurance': [
    {
      concept: 'liability coverage purpose',
      definitionPrompt: 'What is the purpose of auto liability coverage?',
      scenarioPrompt: 'An insured causes an accident that injures another person.',
      correct: 'It helps cover bodily injury or property damage the insured is legally responsible for.',
      distractors: [
        'It pays for routine maintenance like tires and oil changes.',
        'It guarantees payment for every damage to the insured vehicle regardless of cause.',
        'It removes all legal responsibility once a policy is active.',
      ],
      explanation: 'Liability coverage addresses legal obligations for harm to others.',
      trap: 'A common trap is mixing liability coverage with first-party maintenance or wear-and-tear costs.',
    },
    {
      concept: 'deductible application',
      definitionPrompt: 'How is a deductible generally used in physical damage coverage?',
      scenarioPrompt: 'An insured files a covered collision claim on their own vehicle.',
      correct: 'The deductible is typically the portion of covered loss the insured pays before policy payment applies.',
      distractors: [
        'The deductible is paid only by the insurer after settlement.',
        'Deductibles usually apply to liability damages paid to others.',
        'Selecting a deductible guarantees lower total out-of-pocket costs in every claim.',
      ],
      explanation: 'Deductibles are a cost-sharing feature commonly tested in auto property damage claims.',
      trap: 'A common trap is incorrectly applying deductibles to third-party liability damages.',
    },
  ],
  'Commercial Package Policy (CPP)': [
    {
      concept: 'common policy conditions',
      definitionPrompt: 'What do common policy conditions do in a commercial package policy?',
      scenarioPrompt: 'A business asks what ties multiple CPP coverage parts together.',
      correct: 'They provide shared rules, duties, and administrative conditions across applicable coverage parts.',
      distractors: [
        'They replace all coverage-part exclusions with broad all-risk wording.',
        'They apply only to personal auto endorsements within the package.',
        'They guarantee identical limits across every coverage part.',
      ],
      explanation: 'CPP uses common conditions plus specific coverage part forms.',
      trap: 'A common trap is assuming common conditions erase differences among coverage parts.',
    },
    {
      concept: 'coverage part structure',
      definitionPrompt: 'Which statement best describes how CPP coverage parts work?',
      scenarioPrompt: 'A business bundles property and liability under one CPP policy.',
      correct: 'Each coverage part has its own insuring agreement, conditions, and exclusions while sharing overarching common policy conditions.',
      distractors: [
        'All coverage parts become one identical form once included in a package.',
        'Coverage parts cannot have separate limits once combined under CPP.',
        'Adding a coverage part removes the need for declarations and endorsements.',
      ],
      explanation: 'CPP is modular: common conditions are shared, but each coverage part remains distinct.',
      trap: 'A common trap is thinking package format means all coverage language is identical.',
    },
  ],
  'Businessowners (2010) Policy': [
    {
      concept: 'BOP eligibility idea',
      definitionPrompt: 'What is a key idea behind Businessowners coverage?',
      scenarioPrompt: 'A small business wants a simplified package.',
      correct: 'It combines core property and liability protection for eligible small-to-mid-size businesses.',
      distractors: [
        'It is only available to very large multi-state industrial operations.',
        'It removes the need for any conditions, exclusions, or limits.',
        'It only provides workers compensation benefits and nothing else.',
      ],
      explanation: 'BOP is designed as a streamlined package for eligible business risks.',
      trap: 'A common trap is treating BOP as a universal fit for every large complex exposure.',
    },
    {
      concept: 'BOP package design',
      definitionPrompt: 'Why do many eligible businesses choose a BOP form?',
      scenarioPrompt: 'A retail owner asks why BOP is often used for smaller operations.',
      correct: 'It is designed to package commonly needed property and liability coverages in a simplified format for qualifying risks.',
      distractors: [
        'It is primarily designed to replace all specialty endorsements with no underwriting review.',
        'It guarantees acceptance for any business regardless of size or operations.',
        'It is intended only for personal lines insureds and not business entities.',
      ],
      explanation: 'BOP emphasizes eligibility and bundled core business protection.',
      trap: 'A common trap is assuming every business risk automatically qualifies for BOP.',
    },
  ],
  "Workers' Compensation Insurance": [
    {
      concept: 'workers compensation core function',
      definitionPrompt: 'What is the core function of workers compensation insurance?',
      scenarioPrompt: 'An employee has a work-related injury.',
      correct: 'It generally provides statutory-style benefits for covered job-related injuries and illnesses.',
      distractors: [
        'It only pays benefits when the employer admits negligence in writing.',
        'It replaces all employer legal obligations under every policy type.',
        'It covers any off-duty injury regardless of work connection.',
      ],
      explanation: 'Workers compensation focuses on work-related injury benefits under applicable rules.',
      trap: 'A common trap is requiring proof of negligence as a condition for basic benefits.',
    },
    {
      concept: 'employers liability relationship',
      definitionPrompt: 'How does employers liability generally relate to workers compensation coverage?',
      scenarioPrompt: 'A work injury leads to potential liability not fully addressed by statutory benefits.',
      correct: 'Employers liability can help address certain employer liability exposures associated with covered employment injuries, subject to policy terms.',
      distractors: [
        'It replaces statutory workers compensation benefits for all claims.',
        'It applies only to non-work injuries occurring at home.',
        'It eliminates the need for reporting and claim handling duties.',
      ],
      explanation: 'Exam questions often distinguish statutory benefit response from employer liability exposure.',
      trap: 'A common trap is assuming one part completely replaces the other in every claim.',
    },
  ],
  'Other Coverages and Options': [
    {
      concept: 'endorsement purpose',
      definitionPrompt: 'What is the purpose of an endorsement?',
      scenarioPrompt: 'A client needs to modify standard policy terms.',
      correct: 'An endorsement changes policy terms by adding, removing, clarifying, or limiting coverage.',
      distractors: [
        'An endorsement cancels the policy and starts a brand-new contract automatically.',
        'An endorsement only changes premium and never changes coverage wording.',
        'An endorsement applies only after a claim has been denied.',
      ],
      explanation: 'Endorsements are formal policy amendments that alter contract language.',
      trap: 'A common trap is assuming endorsements affect price only and not coverage scope.',
    },
    {
      concept: 'umbrella concept',
      definitionPrompt: 'What is a general purpose of umbrella liability coverage?',
      scenarioPrompt: 'An insured wants broader liability protection above underlying limits.',
      correct: 'It is commonly used to provide additional liability limit protection above qualifying underlying policies, subject to its own terms.',
      distractors: [
        'It replaces property deductibles on homeowners and auto physical damage claims.',
        'It automatically converts all underlying coverage to no-exclusion wording.',
        'It covers routine maintenance costs once an underlying policy expires.',
      ],
      explanation: 'Umbrella coverage is tested as excess-style liability protection with policy-specific conditions.',
      trap: 'A common trap is treating umbrella coverage as a substitute for first-party property coverage.',
    },
  ],
  'Accident and Health Insurance': [
    {
      concept: 'disability income trigger',
      definitionPrompt: 'What generally triggers disability income benefits?',
      scenarioPrompt: 'An insured cannot work due to a covered condition.',
      correct: 'Benefits are generally triggered when policy definitions of disability are satisfied.',
      distractors: [
        'Benefits begin immediately for any minor discomfort without meeting policy definitions.',
        'Benefits are based only on age and never on occupational ability.',
        'Benefits are paid only if the insured has no other income source at all.',
      ],
      explanation: 'Coverage depends on the contract definition and qualification rules for disability.',
      trap: 'A common trap is ignoring policy definitions and assuming automatic benefit eligibility.',
    },
    {
      concept: 'renewability concept',
      definitionPrompt: 'What is an important idea in health policy renewability provisions?',
      scenarioPrompt: 'An applicant compares health policy renewability wording.',
      correct: 'Renewability terms describe how and when a policy may continue, be changed, or be nonrenewed under contract rules.',
      distractors: [
        'Renewability guarantees permanent level premiums under all circumstances.',
        'Renewability means claims can be denied once the first policy period ends.',
        'Renewability applies only to accidental death benefits and not health coverage.',
      ],
      explanation: 'Renewability wording is a common exam topic in accident and health insurance.',
      trap: 'A common trap is assuming renewability language guarantees fixed premiums forever.',
    },
  ],
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

const shuffle = <T,>(items: T[], rand: () => number): T[] => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const normalizePrompt = (text: string): string => {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\?\?/g, '?')
    .trim();
};

const buildPrompt = (template: TopicTemplate, style: 'definition' | 'scenario'): string => {
  if (style === 'definition') return normalizePrompt(template.definitionPrompt);

  const base = normalizePrompt(template.scenarioPrompt);
  if (/what is the best answer\?/i.test(base) || /which option is most accurate\?/i.test(base)) {
    return base;
  }
  if (base.endsWith('?')) return base;
  return `${base} What is the best answer?`;
};

const createCard = (topic: Topic, style: 'definition' | 'scenario', difficulty: Difficulty, id: string, rand: () => number): Card => {
  const templates = topicTemplates[topic];
  const template = templates[Math.floor(rand() * templates.length)];

  const correct = difficulty === 'Hard' && template.hardCorrect ? template.hardCorrect : template.correct;
  const distractors = difficulty === 'Hard' && template.hardDistractors ? template.hardDistractors : template.distractors;
  const prompt = buildPrompt(template, style);

  const mixedOptions = shuffle([correct, ...distractors], rand) as [string, string, string, string];
  const answerIndex = mixedOptions.findIndex((option) => option === correct) as 0 | 1 | 2 | 3;

  return {
    id,
    type: 'mcq',
    prompt,
    options: mixedOptions,
    answerIndex,
    explanation: `${template.explanation} ${template.trap}`,
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
    const style = rand() < 0.6 ? 'definition' : 'scenario';
    const difficulty: Difficulty = "Medium";
    return createCard(topic, style, difficulty, `${seed}-${i}-${Math.floor(rand() * 9999)}`, rand);
  });
};
