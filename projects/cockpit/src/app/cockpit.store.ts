import { computed } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { filter, interval, pipe, tap } from 'rxjs';
import { INBOUND_LINES, SEED_CONVERSATIONS } from './cockpit.data';
import { Conversation, STAGES, Stage, StatusFilter } from './cockpit.models';

interface State {
  conversations: readonly Conversation[];
  selectedId: string | null;
  statusFilter: StatusFilter;
  query: string;
  liveFeed: boolean;
}

let seq = 0;

export const CockpitStore = signalStore(
  withState<State>({
    conversations: SEED_CONVERSATIONS,
    selectedId: 'c1',
    statusFilter: 'all',
    query: '',
    liveFeed: true,
  }),
  withComputed((s) => {
    const visible = computed(() => {
      const q = s.query().trim().toLowerCase();
      const f = s.statusFilter();
      return s
        .conversations()
        .filter((c) => (f === 'all' ? true : c.status === f))
        .filter((c) => !q || `${c.contact} ${c.company} ${c.intent}`.toLowerCase().includes(q))
        .toSorted((a, b) => b.messages.at(-1)!.at - a.messages.at(-1)!.at);
    });
    const selected = computed(() => s.conversations().find((c) => c.id === s.selectedId()) ?? null);
    const open = computed(() => s.conversations().filter((c) => c.stage !== 'Won'));
    const byStage = computed(() =>
      STAGES.map((stage) => {
        const items = s.conversations().filter((c) => c.stage === stage);
        return { stage, count: items.length, value: items.reduce((n, c) => n + c.value, 0) };
      }),
    );
    return {
      visible,
      selected,
      byStage,
      pipelineValue: computed(() => open().reduce((n, c) => n + c.value, 0)),
      liveCount: computed(() => s.conversations().filter((c) => c.status === 'live').length),
      atRisk: computed(() => open().filter((c) => c.sentiment < -0.1).length),
      unreadTotal: computed(() => s.conversations().reduce((n, c) => n + c.unread, 0)),
    };
  }),
  withMethods((store) => {
    const update = (id: string, fn: (c: Conversation) => Conversation) =>
      patchState(store, (st) => ({ conversations: st.conversations.map((c) => (c.id === id ? fn(c) : c)) }));

    return {
      select: (id: string) => {
        patchState(store, { selectedId: id });
        update(id, (c) => ({ ...c, unread: 0 }));
      },
      setStatusFilter: (statusFilter: StatusFilter) => patchState(store, { statusFilter }),
      setQuery: (query: string) => patchState(store, { query }),
      setLiveFeed: (liveFeed: boolean) => patchState(store, { liveFeed }),
      moveStage: (id: string, stage: Stage) => update(id, (c) => ({ ...c, stage })),
      send: (id: string, text: string) => {
        const body = text.trim();
        if (!body) return;
        update(id, (c) => ({
          ...c,
          status: 'waiting',
          messages: [...c.messages, { id: `${id}-s${++seq}`, from: 'seller', text: body, at: Date.now() }],
        }));
      },
      /** Simulates an inbound message arriving over the websocket. */
      receive: () => {
        const pool = store.conversations().filter((c) => c.stage !== 'Won');
        const target = pool[Math.floor(Math.random() * pool.length)];
        if (!target) return;
        const text = INBOUND_LINES[Math.floor(Math.random() * INBOUND_LINES.length)];
        update(target.id, (c) => ({
          ...c,
          status: 'live',
          unread: store.selectedId() === c.id ? 0 : c.unread + 1,
          messages: [...c.messages, { id: `${c.id}-r${++seq}`, from: 'contact', text, at: Date.now() }],
        }));
      },
    };
  }),
  withHooks({
    onInit(store) {
      const feed = rxMethod<number>(
        pipe(
          filter(() => store.liveFeed()),
          tap(() => store.receive()),
        ),
      );
      feed(interval(9000));
    },
  }),
);
