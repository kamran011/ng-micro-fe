export type NodeKind = 'greet' | 'ask' | 'lookup' | 'branch' | 'handoff';

export const NODE_KINDS: readonly { kind: NodeKind; label: string; icon: string; hint: string }[] = [
  { kind: 'greet', label: 'Greeting', icon: 'waving_hand', hint: 'Opens the conversation' },
  { kind: 'ask', label: 'Ask question', icon: 'help', hint: 'Collects a slot from the user' },
  { kind: 'lookup', label: 'Lookup', icon: 'database', hint: 'Calls an integration' },
  { kind: 'branch', label: 'Branch', icon: 'call_split', hint: 'Routes on intent or slot value' },
  { kind: 'handoff', label: 'Human handoff', icon: 'support_agent', hint: 'Escalates to a seller' },
];

export interface FlowNode {
  readonly id: string;
  readonly kind: NodeKind;
  readonly name: string;
  readonly prompt: string;
  readonly timeoutSec: number;
  readonly fallback: boolean;
}

export interface Agent {
  readonly id: string;
  readonly name: string;
  readonly channel: 'Web chat' | 'WhatsApp' | 'Voice';
  readonly publishedVersion: number;
  readonly dirty: boolean;
  readonly nodes: readonly FlowNode[];
}

export interface Issue {
  readonly level: 'error' | 'warn';
  readonly message: string;
  readonly nodeId?: string;
}

export interface TraceStep {
  readonly nodeId: string;
  readonly name: string;
  readonly output: string;
  readonly ms: number;
}
