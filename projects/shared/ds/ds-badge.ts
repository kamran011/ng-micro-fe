import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type Tone = 'neutral' | 'ok' | 'warn' | 'crit' | 'info' | 'accent';

/** Status pill. Colour is never the only signal: an icon glyph always accompanies it. */
@Component({
  selector: 'ds-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': '"tone-" + tone()' },
  template: `<span class="dot" aria-hidden="true">{{ glyph() }}</span><ng-content />`,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 22px;
      padding: 0 8px;
      border-radius: 999px;
      font-size: var(--fs-xs);
      font-weight: 500;
      white-space: nowrap;
      background: var(--surface-3);
      color: var(--ink-2);
    }
    .dot { font-size: 9px; line-height: 1; }
    :host(.tone-ok) { background: var(--ok-soft); color: var(--ok); }
    :host(.tone-warn) { background: var(--warn-soft); color: var(--warn); }
    :host(.tone-crit) { background: var(--crit-soft); color: var(--crit); }
    :host(.tone-info) { background: var(--info-soft); color: var(--info); }
    :host(.tone-accent) { background: var(--accent-soft); color: var(--accent); }
  `,
})
export class DsBadge {
  readonly tone = input<Tone>('neutral');
  protected glyph = () => ({ ok: '●', warn: '▲', crit: '◆', info: '■', accent: '●', neutral: '○' })[this.tone()];
}
