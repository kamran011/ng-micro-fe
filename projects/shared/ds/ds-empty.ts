import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ds-empty',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<strong>{{ title() }}</strong><span>{{ hint() }}</span><ng-content />`,
  styles: `
    :host { display: flex; flex-direction: column; align-items: center; gap: var(--sp-1); padding: var(--sp-6); text-align: center; color: var(--ink-3); font-size: var(--fs-sm); border: 1px dashed var(--line-strong); border-radius: var(--radius-lg); }
    strong { color: var(--ink-2); font-weight: 600; }
  `,
})
export class DsEmpty {
  readonly title = input.required<string>();
  readonly hint = input('');
}
