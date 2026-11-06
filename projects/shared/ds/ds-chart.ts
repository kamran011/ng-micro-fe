import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, MarkLineComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { SHELL_API } from '@convo/contract';

echarts.use([
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  MarkLineComponent,
  CanvasRenderer,
]);

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
/** Deep-merge plain objects so a caller's `yAxis: { name }` keeps the themed grid and label styling. */
const merge = (base: Obj, over: Obj): Obj => {
  const out: Obj = { ...base };
  for (const [k, v] of Object.entries(over))
    out[k] = isObj(v) && isObj(base[k]) ? merge(base[k] as Obj, v) : v;
  return out;
};

const css = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/**
 * Themed ECharts wrapper.
 * - Reads colours from design tokens, re-themes on light/dark change.
 * - Charts are canvas, so `label` + `summary` give assistive tech a text equivalent.
 * - Resizes with its container (ResizeObserver), not the window.
 */
@Component({
  selector: 'ds-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #host class="host" role="img" [attr.aria-label]="label() + '. ' + summary()"></div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: var(--chart-h, 260px);
    }
    .host {
      width: 100%;
      height: 100%;
    }
  `,
})
export class DsChart implements OnDestroy {
  readonly option = input.required<echarts.EChartsCoreOption>();
  readonly label = input.required<string>();
  readonly summary = input('');

  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private readonly theme = inject(SHELL_API).theme;
  private chart?: echarts.ECharts;
  private ro?: ResizeObserver;

  constructor() {
    afterNextRender(() => {
      this.chart = echarts.init(this.host().nativeElement, undefined, { renderer: 'canvas' });
      this.ro = new ResizeObserver(() => this.chart?.resize());
      this.ro.observe(this.host().nativeElement);
      this.paint();
    });
    effect(() => {
      this.option();
      this.theme();
      this.paint();
    });
  }

  private paint() {
    if (!this.chart) return;
    const ink = css('--ink-3');
    this.chart.setOption(
      merge(
        {
          animation: !matchMedia('(prefers-reduced-motion: reduce)').matches,
          animationDuration: 300,
          color: [css('--chart-1'), css('--chart-2'), css('--chart-3'), css('--chart-4')],
          textStyle: { fontFamily: css('--font-sans'), color: ink },
          grid: { left: 44, right: 16, top: 20, bottom: 28 },
          tooltip: {
            trigger: 'axis',
            backgroundColor: css('--surface'),
            borderColor: css('--line-strong'),
            textStyle: { color: css('--ink'), fontSize: 12 },
            extraCssText: 'box-shadow:' + css('--shadow-pop'),
          },
          xAxis: {
            axisLine: { lineStyle: { color: css('--line-strong') } },
            axisLabel: { color: ink, fontSize: 11 },
            axisTick: { show: false },
          },
          yAxis: {
            splitLine: { lineStyle: { color: css('--chart-grid') } },
            axisLabel: { color: ink, fontSize: 11 },
          },
        },
        this.option() as Obj,
      ),
      true,
    );
  }

  ngOnDestroy() {
    this.ro?.disconnect();
    this.chart?.dispose();
  }
}
