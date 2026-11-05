import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { StudioStore, validate } from './studio.store';

const setup = () => {
  TestBed.configureTestingModule({ providers: [StudioStore] });
  return TestBed.inject(StudioStore);
};

describe('StudioStore', () => {
  it('flags empty prompts as errors and blocks publish', () => {
    const s = setup();
    s.selectAgent('a2');
    expect(s.errorCount()).toBe(1);
    expect(s.issues()[0].message).toContain('empty prompt');
  });

  it('clears the error once the prompt is filled and marks the agent dirty', () => {
    const s = setup();
    s.selectAgent('a2');
    s.updateNode('m2', { prompt: 'Summarise usage.' });
    expect(s.errorCount()).toBe(0);
    expect(s.agent().dirty).toBe(true);
  });

  it('reorders steps immutably', () => {
    const s = setup();
    const before = s.agent().nodes;
    s.reorder(0, 2);
    expect(s.agent().nodes.map((n) => n.id)).toEqual(['n2', 'n3', 'n1', 'n4', 'n5']);
    expect(before.map((n) => n.id)[0]).toBe('n1');
  });

  it('publishing bumps the version and clears dirty', () => {
    const s = setup();
    s.selectAgent('a2');
    s.publish();
    expect(s.agent().publishedVersion).toBe(4);
    expect(s.agent().dirty).toBe(false);
  });

  it('test run escalates to a handoff on security intents', () => {
    const s = setup();
    s.runTest('Do you have SOC 2?');
    const names = s.trace().map((t) => t.name);
    expect(names.at(-1)).toBe('Book a seller');
    expect(s.trace().find((t) => t.name === 'Route by intent')?.output).toContain('escalate');
  });

  it('detects duplicate names', () => {
    const s = setup();
    s.addNode('ask');
    s.updateNode(s.node()!.id, { name: 'Welcome', prompt: 'x' });
    expect(validate(s.agent()).some((i) => i.message.includes('Duplicate'))).toBe(true);
  });
});
