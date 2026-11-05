export interface Sample {
  readonly t: number;
  readonly p50: number;
  readonly p95: number;
  readonly rps: number;
  readonly errPct: number;
}

export interface ServiceDef {
  readonly id: string;
  readonly name: string;
  readonly owner: string;
  readonly sloP95: number;
  readonly base: { p50: number; rps: number; err: number };
}

export interface Alert {
  readonly id: number;
  readonly at: number;
  readonly service: string;
  readonly severity: 'warn' | 'crit';
  readonly message: string;
}

export type RangeKey = '1m' | '5m' | '15m';
export const RANGES: Record<RangeKey, number> = { '1m': 60, '5m': 300, '15m': 900 };
export type Health = 'healthy' | 'degraded' | 'breaching';
