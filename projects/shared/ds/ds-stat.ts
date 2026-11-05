import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DsSparkline } from './ds-sparkline';

@Component({
  selector: 'ds-stat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DsSparkline],
  template: `
    <div class="label">{{ label() }}</div>
    <div class="value num">{{ value() }}<small>{{ unit() }}</small></div>
    @if (delta()) {
      <div class="delta" [class.bad]="trend() === 'bad'" [class.good]="trend() === 'good'">{{ delta() }}</div>
    }
    @if (spark(); as s) {
      <ds-sparkline [data]="s" class="spark" />
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: 2px; padding: var(--sp-4); background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); min-width: 0; }
    .label { font-size: var(--fs-xs); color: var(--ink-3); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 500; }
    .value { font-size: var(--fs-2xl); font-weight: 500; letter-spacing: -0.02em; line-height: 1.15; }
    small { font-size: var(--fs-sm); color: var(--ink-3); margin-left: 3px; letter-spacing: 0; }
    .delta { font-size: var(--fs-xs); color: var(--ink-3); font-family: var(--font-mono); }
    .delta.good { color: var(--ok); }
    .delta.bad { color: var(--crit); }
    .spark { margin-top: var(--sp-2); }
  `,
})
export class DsStat {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly unit = input('');
  readonly delta = input('');
  readonly trend = input<'good' | 'bad' | 'flat'>('flat');
  readonly spark = input<readonly number[] | null>(null);
}
