import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { SEED_AGENTS } from './studio.data';
import { Agent, FlowNode, Issue, NodeKind, TraceStep } from './studio.models';

interface State {
  agents: readonly Agent[];
  agentId: string;
  nodeId: string | null;
  trace: readonly TraceStep[];
}

let seq = 100;

export function validate(agent: Agent): Issue[] {
  const issues: Issue[] = [];
  const names = new Map<string, number>();
  for (const n of agent.nodes) {
    names.set(n.name.trim().toLowerCase(), (names.get(n.name.trim().toLowerCase()) ?? 0) + 1);
    if (!n.name.trim()) issues.push({ level: 'error', message: 'A node has no name.', nodeId: n.id });
    if (!n.prompt.trim()) issues.push({ level: 'error', message: `“${n.name}” has an empty prompt.`, nodeId: n.id });
    else if (n.prompt.length > 400) issues.push({ level: 'warn', message: `“${n.name}” prompt is long (${n.prompt.length} chars).`, nodeId: n.id });
  }
  for (const [name, count] of names) if (name && count > 1) issues.push({ level: 'error', message: `Duplicate node name “${name}”.` });
  if (agent.nodes[0] && agent.nodes[0].kind !== 'greet') issues.push({ level: 'warn', message: 'Flow does not start with a greeting.', nodeId: agent.nodes[0].id });
  if (!agent.nodes.some((n) => n.kind === 'handoff')) issues.push({ level: 'warn', message: 'No human handoff — users cannot escalate.' });
  return issues;
}

export const StudioStore = signalStore(
  withState<State>({ agents: SEED_AGENTS, agentId: 'a1', nodeId: 'n1', trace: [] }),
  withComputed((s) => {
    const agent = computed(() => s.agents().find((a) => a.id === s.agentId())!);
    return {
      agent,
      node: computed(() => agent().nodes.find((n) => n.id === s.nodeId()) ?? null),
      issues: computed(() => validate(agent())),
      errorCount: computed(() => validate(agent()).filter((i) => i.level === 'error').length),
    };
  }),
  withMethods((store) => {
    const edit = (fn: (a: Agent) => Agent) =>
      patchState(store, (st) => ({ agents: st.agents.map((a) => (a.id === st.agentId ? { ...fn(a), dirty: true } : a)), trace: [] }));
    return {
      selectAgent: (agentId: string) => {
        const first = store.agents().find((a) => a.id === agentId)?.nodes[0]?.id ?? null;
        patchState(store, { agentId, nodeId: first, trace: [] });
      },
      selectNode: (nodeId: string) => patchState(store, { nodeId }),
      reorder: (from: number, to: number) =>
        edit((a) => {
          const nodes = [...a.nodes];
          const [moved] = nodes.splice(from, 1);
          nodes.splice(to, 0, moved);
          return { ...a, nodes };
        }),
      updateNode: (id: string, patch: Partial<Omit<FlowNode, 'id'>>) =>
        edit((a) => ({ ...a, nodes: a.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)) })),
      addNode: (kind: NodeKind) => {
        const id = `x${++seq}`;
        edit((a) => ({ ...a, nodes: [...a.nodes, { id, kind, name: `New ${kind}`, prompt: '', timeoutSec: 30, fallback: true }] }));
        patchState(store, { nodeId: id });
      },
      removeNode: (id: string) => {
        edit((a) => ({ ...a, nodes: a.nodes.filter((n) => n.id !== id) }));
        patchState(store, (st) => ({ nodeId: st.nodeId === id ? (store.agent().nodes[0]?.id ?? null) : st.nodeId }));
      },
      publish: () =>
        patchState(store, (st) => ({
          agents: st.agents.map((a) => (a.id === st.agentId ? { ...a, dirty: false, publishedVersion: a.publishedVersion + 1 } : a)),
        })),
      /** Dry-run the flow against a sample utterance. */
      runTest: (utterance: string) => {
        const text = utterance.trim() || 'Hi';
        const security = /secur|soc ?2|gdpr|legal/i.test(text);
        const trace: TraceStep[] = [];
        for (const n of store.agent().nodes) {
          const ms = 30 + ((n.name.length * 37 + n.prompt.length) % 160);
          let output = '';
          if (n.kind === 'greet') output = 'Hello! I can help with pricing, demos and integrations.';
          else if (n.kind === 'ask') output = 'Roughly how many people will use it?';
          else if (n.kind === 'lookup') output = 'plan = "Growth" (matched 120 seats)';
          else if (n.kind === 'branch') output = security ? 'intent = security → escalate' : 'intent = pricing → continue';
          else output = 'Transferred to seller with conversation summary.';
          trace.push({ nodeId: n.id, name: n.name, output, ms });
          if (n.kind === 'branch' && security) {
            const h = store.agent().nodes.find((x) => x.kind === 'handoff');
            if (h) trace.push({ nodeId: h.id, name: h.name, output: 'Transferred to seller with conversation summary.', ms: 48 });
            break;
          }
        }
        patchState(store, { trace });
      },
    };
  }),
);
