import { Conversation } from './cockpit.models';

const now = Date.now();
const m = (id: string, from: 'contact' | 'agent' | 'seller', text: string, minsAgo: number) => ({
  id,
  from,
  text,
  at: now - minsAgo * 60_000,
});

export const SEED_CONVERSATIONS: readonly Conversation[] = [
  {
    id: 'c1', contact: 'Priya Raman', role: 'VP Operations', company: 'Halden Logistics', stage: 'Negotiation', value: 84000,
    status: 'live', intent: 'Pricing', sentiment: 0.4, unread: 2,
    suggestion: 'Offer the 24-month term at 12% off and attach the volume-tier sheet — she asked about per-seat cost twice.',
    messages: [
      m('c1-1', 'contact', 'We liked the pilot. Before legal gets involved, can you confirm per-seat pricing past 200 seats?', 18),
      m('c1-2', 'agent', 'Happy to help. Pricing steps down at 200 and 500 seats. I can loop in your account executive for a tailored quote.', 17),
      m('c1-3', 'contact', 'Yes please. We are also comparing a 12 vs 24 month term.', 6),
      m('c1-4', 'contact', 'Is there a discount for the longer term?', 2),
    ],
  },
  {
    id: 'c2', contact: 'Tomás Beltrán', role: 'Head of Security', company: 'Norte Bank', stage: 'Qualified', value: 152000,
    status: 'waiting', intent: 'Security review', sentiment: -0.2, unread: 0,
    suggestion: 'Send the SOC 2 Type II report and the data-residency addendum; propose a 30-minute call with our CISO.',
    messages: [
      m('c2-1', 'contact', 'We cannot proceed without evidence of EU-only data residency and a recent pen-test summary.', 55),
      m('c2-2', 'seller', 'Understood, Tomás. I am gathering the residency addendum and will send it today.', 40),
    ],
  },
  {
    id: 'c3', contact: 'Hannah Whitcombe', role: 'RevOps Lead', company: 'Lumen Retail', stage: 'Discovery', value: 36000,
    status: 'live', intent: 'Integration', sentiment: 0.7, unread: 1,
    suggestion: 'Share the Salesforce connector guide and offer a sandbox with her sample objects preloaded.',
    messages: [
      m('c3-1', 'contact', 'Does the agent write conversation summaries back to Salesforce opportunities automatically?', 9),
      m('c3-2', 'agent', 'Yes — summaries and next steps sync to the opportunity timeline within seconds.', 8),
      m('c3-3', 'contact', 'Perfect. Can it also map custom fields?', 3),
    ],
  },
  {
    id: 'c4', contact: 'Jonas Eklund', role: 'CTO', company: 'Fjord Mobility', stage: 'Proposal', value: 118000,
    status: 'idle', intent: 'Demo request', sentiment: 0.1, unread: 0,
    suggestion: 'Re-engage with a short Loom of the telemetry view — he has been silent for two days after the proposal.',
    messages: [
      m('c4-1', 'seller', 'Proposal attached. Happy to walk the team through it this week.', 2880),
      m('c4-2', 'contact', 'Thanks, reviewing with the team.', 2700),
    ],
  },
  {
    id: 'c5', contact: 'Salma Idrissi', role: 'Director of CX', company: 'Atlas Telecom', stage: 'Qualified', value: 210000,
    status: 'live', intent: 'Renewal', sentiment: -0.5, unread: 3,
    suggestion: 'Acknowledge the outage first, share the post-incident review, then offer a service credit before discussing renewal.',
    messages: [
      m('c5-1', 'contact', 'Last month’s outage hit our contact centre hard. I need to understand what changes before we renew.', 12),
      m('c5-2', 'contact', 'Leadership is asking whether we should evaluate alternatives.', 5),
      m('c5-3', 'contact', 'Can someone senior join a call today?', 1),
    ],
  },
  {
    id: 'c6', contact: 'Ben Okafor', role: 'Founder', company: 'Quill Studio', stage: 'Won', value: 18000,
    status: 'idle', intent: 'Pricing', sentiment: 0.9, unread: 0,
    suggestion: 'Send the onboarding checklist and introduce the customer success manager.',
    messages: [m('c6-1', 'contact', 'Signed! Excited to get started.', 300)],
  },
  {
    id: 'c7', contact: 'Elena Marchetti', role: 'COO', company: 'Verde Energia', stage: 'Proposal', value: 96000,
    status: 'waiting', intent: 'Pricing', sentiment: 0.2, unread: 0,
    suggestion: 'Offer a phased rollout: two regions first, with price lock for the third.',
    messages: [m('c7-1', 'contact', 'Can we phase the rollout by region to keep the first-year spend lower?', 95)],
  },
  {
    id: 'c8', contact: 'Kwame Asante', role: 'IT Director', company: 'Meridian Health', stage: 'Discovery', value: 64000,
    status: 'idle', intent: 'Security review', sentiment: 0, unread: 0,
    suggestion: 'Ask about their HIPAA scope before sending any documentation.',
    messages: [m('c8-1', 'contact', 'We handle PHI, so compliance is the first gate.', 1500)],
  },
];

export const INBOUND_LINES: readonly string[] = [
  'Quick question — does the agent support handover to a human mid-conversation?',
  'Can you send over the latest security whitepaper?',
  'We would like to move forward if we can agree on terms this week.',
  'Is there an SLA for response latency?',
  'Who would own implementation on your side?',
  'Our procurement team needs a revised quote.',
];
