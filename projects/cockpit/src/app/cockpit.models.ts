export const STAGES = ['Discovery', 'Qualified', 'Proposal', 'Negotiation', 'Won'] as const;
export type Stage = (typeof STAGES)[number];

export interface Message {
  readonly id: string;
  readonly from: 'contact' | 'agent' | 'seller';
  readonly text: string;
  readonly at: number;
}

export interface Conversation {
  readonly id: string;
  readonly contact: string;
  readonly role: string;
  readonly company: string;
  readonly stage: Stage;
  readonly value: number;
  readonly status: 'live' | 'waiting' | 'idle';
  readonly intent: 'Pricing' | 'Security review' | 'Integration' | 'Renewal' | 'Demo request';
  /** -1 (frustrated) … 1 (delighted) */
  readonly sentiment: number;
  readonly unread: number;
  readonly messages: readonly Message[];
  readonly suggestion: string;
}

export type StatusFilter = 'all' | 'live' | 'waiting';
