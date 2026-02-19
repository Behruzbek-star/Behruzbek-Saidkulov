import { Topic } from '../types';

const now = new Date().toISOString();

export const defaultTopics: Topic[] = [
  { id: 'homeowners', name: 'Homeowners Policy', category: 'Property', weight: 1.2, score: 60, attempted: 0, updatedAt: now, subtopics: ['Coverage A/B/C/D', 'Exclusions', 'Conditions'] },
  { id: 'dwelling', name: 'Dwelling Forms DP-1/2/3', category: 'Property', weight: 1.1, score: 58, attempted: 0, updatedAt: now, subtopics: ['Named vs open perils', 'Coverage forms'] },
  { id: 'commercial-property', name: 'Commercial Property Basics', category: 'Property', weight: 1.1, score: 64, attempted: 0, updatedAt: now, subtopics: ['Building/Personal Property', 'Causes of loss'] },
  { id: 'valuation', name: 'Valuation, Coinsurance, Loss Payees', category: 'Property', weight: 1.2, score: 54, attempted: 0, updatedAt: now, subtopics: ['ACV vs RC', 'Coinsurance', 'Mortgagee'] },
  { id: 'cgl', name: 'CGL and Liability Coverages', category: 'Casualty', weight: 1.2, score: 57, attempted: 0, updatedAt: now, subtopics: ['Coverage A/B/C', 'Occurrence vs claims-made'] },
  { id: 'auto', name: 'Personal and Business Auto', category: 'Casualty', weight: 1.15, score: 62, attempted: 0, updatedAt: now, subtopics: ['Liability', 'Physical damage', 'Symbols'] },
  { id: 'workers-comp', name: 'Workers Compensation Basics', category: 'Casualty', weight: 1.1, score: 52, attempted: 0, updatedAt: now, subtopics: ['Exclusive remedy', 'Benefits'] },
  { id: 'bop', name: 'BOP and Package Concepts', category: 'Casualty', weight: 1.0, score: 66, attempted: 0, updatedAt: now, subtopics: ['Eligibility', 'Coverage parts'] },
  { id: 'core-concepts', name: 'Core Insurance Concepts', category: 'Concepts', weight: 1.15, score: 55, attempted: 0, updatedAt: now, subtopics: ['Indemnity', 'Subrogation', 'Insurable interest'] },
  { id: 'ethics', name: 'Ethics and Regulatory Basics', category: 'Ethics/Regulatory', weight: 0.9, score: 68, attempted: 0, updatedAt: now, subtopics: ['Producer responsibilities', 'Unfair practices'] }
];
