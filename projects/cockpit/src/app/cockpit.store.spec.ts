import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CockpitStore } from './cockpit.store';

const setup = () => {
  TestBed.configureTestingModule({ providers: [CockpitStore] });
  const s = TestBed.inject(CockpitStore);
  s.setLiveFeed(false);
  return s;
};

describe('CockpitStore', () => {
  it('computes open pipeline excluding won deals', () => {
    const s = setup();
    const won = s.conversations().filter((c) => c.stage === 'Won').reduce((n, c) => n + c.value, 0);
    const all = s.conversations().reduce((n, c) => n + c.value, 0);
    expect(s.pipelineValue()).toBe(all - won);
  });

  it('filters by status and search', () => {
    const s = setup();
    s.setStatusFilter('live');
    expect(s.visible().every((c) => c.status === 'live')).toBe(true);
    s.setStatusFilter('all');
    s.setQuery('atlas');
    expect(s.visible().map((c) => c.company)).toEqual(['Atlas Telecom']);
  });

  it('selecting a conversation clears its unread count', () => {
    const s = setup();
    s.select('c5');
    expect(s.selected()?.unread).toBe(0);
  });

  it('moves a deal between stages and updates the stage rollup', () => {
    const s = setup();
    const before = s.byStage().find((x) => x.stage === 'Proposal')!.count;
    s.moveStage('c3', 'Proposal');
    expect(s.byStage().find((x) => x.stage === 'Proposal')!.count).toBe(before + 1);
  });

  it('ignores blank replies and appends real ones', () => {
    const s = setup();
    const n = s.selected()!.messages.length;
    s.send('c1', '   ');
    expect(s.selected()!.messages.length).toBe(n);
    s.send('c1', 'On it.');
    expect(s.selected()!.messages.at(-1)?.from).toBe('seller');
  });

  it('inbound messages mark the thread live and add unread when not selected', () => {
    const s = setup();
    const before = s.unreadTotal();
    const selected = s.selectedId();
    for (let i = 0; i < 20; i++) s.receive();
    expect(s.unreadTotal()).toBeGreaterThan(before - 1);
    expect(s.selectedId()).toBe(selected);
  });
});
