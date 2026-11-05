import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { TelemetryStore } from './telemetry.store';

const setup = () => {
  TestBed.configureTestingModule({ providers: [TelemetryStore] });
  const s = TestBed.inject(TelemetryStore);
  s.setPaused(true);
  return s;
};

describe('TelemetryStore', () => {
  it('backfills history and windows it by range', () => {
    const s = setup();
    s.setRange('1m');
    expect(s.window().length).toBe(60);
    s.setRange('15m');
    expect(s.window().length).toBe(900);
  });

  it('tick appends one sample per service and keeps a bounded buffer', () => {
    const s = setup();
    for (let i = 0; i < 5; i++) s.tick();
    for (const rows of Object.values(s.series())) expect(rows.length).toBe(900);
  });

  it('switches the selected service', () => {
    const s = setup();
    s.selectService('nlu');
    expect(s.selectedDef().name).toBe('nlu-intent');
  });

  it('classifies health against the SLO', () => {
    const s = setup();
    for (const row of s.table()) {
      const ratio = row.last.p95 / row.def.sloP95;
      if (ratio > 1) expect(row.health).toBe('breaching');
      else if (ratio <= 0.8 && row.last.errPct <= 1) expect(row.health).toBe('healthy');
    }
  });

  it('error budget stays within 0–100', () => {
    const s = setup();
    expect(s.errorBudget()).toBeGreaterThanOrEqual(0);
    expect(s.errorBudget()).toBeLessThanOrEqual(100);
  });
});
