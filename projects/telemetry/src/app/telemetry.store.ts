import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { filter, interval, pipe, tap } from 'rxjs';
import { SERVICES, backfill, nextSample } from './telemetry.data';
import { Alert, Health, RANGES, RangeKey, Sample } from './telemetry.models';

const HISTORY = 900;

interface State {
  series: Record<string, readonly Sample[]>;
  selected: string;
  range: RangeKey;
  paused: boolean;
  alerts: readonly Alert[];
  breaching: Record<string, boolean>;
}

let alertSeq = 0;

export const TelemetryStore = signalStore(
  withState<State>(() => {
    const now = Date.now();
    return {
      series: Object.fromEntries(SERVICES.map((s) => [s.id, backfill(s, HISTORY, now)])),
      selected: 'dialog',
      range: '5m',
      paused: false,
      alerts: [],
      breaching: {},
    };
  }),
  withComputed((s) => {
    const window = computed(() => {
      const n = RANGES[s.range()];
      return (s.series()[s.selected()] ?? []).slice(-n);
    });
    const health = (id: string): Health => {
      const def = SERVICES.find((d) => d.id === id)!;
      const last = s.series()[id].at(-1);
      if (!last) return 'healthy';
      if (last.p95 > def.sloP95) return 'breaching';
      return last.p95 > def.sloP95 * 0.8 || last.errPct > 1 ? 'degraded' : 'healthy';
    };
    return {
      window,
      selectedDef: computed(() => SERVICES.find((d) => d.id === s.selected())!),
      latest: computed(() => window().at(-1)),
      table: computed(() =>
        SERVICES.map((def) => {
          const last = s.series()[def.id].at(-1)!;
          return { def, last, health: health(def.id), spark: s.series()[def.id].slice(-60).map((x) => x.p95) };
        }),
      ),
      errorBudget: computed(() => {
        const w = (s.series()[s.selected()] ?? []).slice(-HISTORY);
        const bad = w.filter((x) => x.errPct > 1).length;
        return Math.max(0, 100 - (bad / w.length) * 100 * 8);
      }),
    };
  }),
  withMethods((store) => ({
    selectService: (selected: string) => patchState(store, { selected }),
    setRange: (range: RangeKey) => patchState(store, { range }),
    setPaused: (paused: boolean) => patchState(store, { paused }),
    clearAlerts: () => patchState(store, { alerts: [] }),
    tick: () => {
      const t = Date.now();
      const series: Record<string, readonly Sample[]> = {};
      const alerts: Alert[] = [];
      const breaching = { ...store.breaching() };
      for (const def of SERVICES) {
        const prev = store.series()[def.id];
        const sample = nextSample(def, t, prev.at(-1));
        series[def.id] = [...prev.slice(-(HISTORY - 1)), sample];
        const over = sample.p95 > def.sloP95;
        if (over && !breaching[def.id]) {
          alerts.push({
            id: ++alertSeq, at: t, service: def.name,
            severity: sample.p95 > def.sloP95 * 1.4 ? 'crit' : 'warn',
            message: `p95 ${sample.p95} ms exceeds SLO of ${def.sloP95} ms`,
          });
        }
        breaching[def.id] = over;
      }
      patchState(store, (st) => ({ series, breaching, alerts: [...alerts, ...st.alerts].slice(0, 30) }));
    },
  })),
  withHooks({
    onInit(store) {
      rxMethod<number>(
        pipe(
          filter(() => !store.paused()),
          tap(() => store.tick()),
        ),
      )(interval(1000));
    },
  }),
);
