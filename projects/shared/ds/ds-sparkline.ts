import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'ds-sparkline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.viewBox]="'0 0 ' + w + ' ' + h" preserveAspectRatio="none" aria-hidden="true">
      <path [attr.d]="area()" class="area" />
      <path [attr.d]="line()" class="line" />
    </svg>
  `,
  styles: `
    :host { display: block; height: 32px; }
    svg { width: 100%; height: 100%; display: block; overflow: visible; }
    .line { fill: none; stroke: var(--spark, var(--chart-1)); stroke-width: 1.5; vector-effect: non-scaling-stroke; }
    .area { fill: var(--spark, var(--chart-1)); opacity: 0.1; }
  `,
})
export class DsSparkline {
  readonly data = input.required<readonly number[]>();
  protected readonly w = 100;
  protected readonly h = 32;

  private readonly pts = computed(() => {
    const d = this.data();
    if (d.length < 2) return [];
    const min = Math.min(...d);
    const max = Math.max(...d);
    const span = max - min || 1;
    return d.map((v, i) => [(i / (d.length - 1)) * this.w, this.h - 3 - ((v - min) / span) * (this.h - 6)] as const);
  });
  protected readonly line = computed(() => this.pts().map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' '));
  protected readonly area = computed(() => (this.pts().length ? `${this.line()} L${this.w} ${this.h} L0 ${this.h} Z` : ''));
}
