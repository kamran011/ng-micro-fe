import { Sample, ServiceDef } from './telemetry.models';

export const SERVICES: readonly ServiceDef[] = [
  { id: 'dialog', name: 'dialog-engine', owner: 'Studio', sloP95: 450, base: { p50: 180, rps: 420, err: 0.2 } },
  { id: 'nlu', name: 'nlu-intent', owner: 'ML Platform', sloP95: 220, base: { p50: 70, rps: 610, err: 0.1 } },
  { id: 'stream', name: 'realtime-gateway', owner: 'Platform', sloP95: 120, base: { p50: 35, rps: 1180, err: 0.05 } },
  { id: 'crm', name: 'crm-sync', owner: 'Revenue', sloP95: 900, base: { p50: 340, rps: 95, err: 0.6 } },
];

/** Deterministic-ish noise so charts look alive without being random per-render. */
export function nextSample(def: ServiceDef, t: number, prev?: Sample): Sample {
  const wave = Math.sin(t / 19_000) * 0.12 + Math.sin(t / 7_000) * 0.05;
  const spike = Math.random() < 0.012 ? 1.6 + Math.random() * 1.4 : 1;
  const p50 = (def.base.p50 * (1 + wave) + (Math.random() - 0.5) * def.base.p50 * 0.08) * (prev && prev.p50 > def.base.p50 * 1.5 ? 1.12 : spike);
  const p95 = p50 * (2.05 + Math.random() * 0.35) * (spike > 1 ? 1.15 : 1);
  const rps = def.base.rps * (1 + wave * 1.4) + (Math.random() - 0.5) * def.base.rps * 0.06;
  const errPct = Math.max(0, def.base.err * (spike > 1 ? 4 : 1) * (0.7 + Math.random() * 0.6));
  return { t, p50: Math.round(p50), p95: Math.round(p95), rps: Math.round(rps), errPct: +errPct.toFixed(2) };
}

export function backfill(def: ServiceDef, n: number, now: number): Sample[] {
  const out: Sample[] = [];
  for (let i = n; i > 0; i--) out.push(nextSample(def, now - i * 1000, out.at(-1)));
  return out;
}
