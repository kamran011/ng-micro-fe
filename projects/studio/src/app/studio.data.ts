import { Agent } from './studio.models';

export const SEED_AGENTS: readonly Agent[] = [
  {
    id: 'a1', name: 'Inbound qualifier', channel: 'Web chat', publishedVersion: 7, dirty: false,
    nodes: [
      { id: 'n1', kind: 'greet', name: 'Welcome', prompt: 'Greet the visitor by name if known and explain you can help with pricing, demos and integrations.', timeoutSec: 20, fallback: true },
      { id: 'n2', kind: 'ask', name: 'Company size', prompt: 'Ask roughly how many people in their team would use the product.', timeoutSec: 45, fallback: true },
      { id: 'n3', kind: 'lookup', name: 'Match plan', prompt: 'Look up the recommended plan for the given seat count using the pricing service.', timeoutSec: 10, fallback: true },
      { id: 'n4', kind: 'branch', name: 'Route by intent', prompt: 'If intent is pricing, continue. If security or legal, escalate.', timeoutSec: 5, fallback: false },
      { id: 'n5', kind: 'handoff', name: 'Book a seller', prompt: 'Offer the next available 30-minute slot with the account executive and confirm by email.', timeoutSec: 60, fallback: true },
    ],
  },
  {
    id: 'a2', name: 'Renewal concierge', channel: 'WhatsApp', publishedVersion: 3, dirty: true,
    nodes: [
      { id: 'm1', kind: 'greet', name: 'Check-in', prompt: 'Thank the customer and mention the renewal date.', timeoutSec: 20, fallback: true },
      { id: 'm2', kind: 'lookup', name: 'Usage summary', prompt: '', timeoutSec: 10, fallback: true },
    ],
  },
  {
    id: 'a3', name: 'Support triage', channel: 'Voice', publishedVersion: 12, dirty: false,
    nodes: [
      { id: 'v1', kind: 'greet', name: 'Answer call', prompt: 'Identify yourself as the virtual assistant and ask how you can help.', timeoutSec: 15, fallback: true },
      { id: 'v2', kind: 'ask', name: 'Describe issue', prompt: 'Let the caller describe the issue in their own words.', timeoutSec: 60, fallback: true },
      { id: 'v3', kind: 'handoff', name: 'Transfer', prompt: 'Warm transfer to the on-call agent with a summary.', timeoutSec: 90, fallback: true },
    ],
  },
];
