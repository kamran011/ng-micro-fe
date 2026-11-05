import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { DsBadge, DsChart, DsEmpty, DsSparkline, DsStat, Tone } from '@convo/ds';
import { Health, RANGES, RangeKey } from './telemetry.models';
import { TelemetryStore } from './telemetry.store';

const hhmmss = (t: number) => new Date(t).toLocaleTimeString([], { hour12: false });

@Component({
  selector: 'app-telemetry-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatButtonToggleModule, MatIconModule, MatSlideToggleModule, MatTableModule, DsBadge, DsChart, DsEmpty, DsSparkline, DsStat],
  templateUrl: './telemetry-page.html',
  styleUrl: './telemetry-page.scss',
})
export class TelemetryPage {
  protected readonly store = inject(TelemetryStore);
  protected readonly ranges = Object.keys(RANGES) as RangeKey[];
  protected readonly cols = ['service', 'status', 'p95', 'rps', 'err', 'trend'];

  protected readonly latencyOption = computed(() => {
    const w = this.store.window();
    return {
      xAxis: { type: 'category', data: w.map((s) => hhmmss(s.t)), boundaryGap: false, axisLabel: { interval: Math.floor(w.length / 6) } },
      yAxis: { type: 'value', name: 'ms', nameTextStyle: { align: 'right' } },
      series: [
        { name: 'p50', type: 'line', showSymbol: false, smooth: true, lineStyle: { width: 1.5 }, data: w.map((s) => s.p50) },
        {
          name: 'p95', type: 'line', showSymbol: false, smooth: true, lineStyle: { width: 2 }, data: w.map((s) => s.p95),
          markLine: { silent: true, symbol: 'none', lineStyle: { type: 'dashed', color: '#b3361f' }, label: { formatter: 'SLO', position: 'insideEndTop' }, data: [{ yAxis: this.store.selectedDef().sloP95 }] },
        },
      ],
    };
  });
  protected readonly rpsOption = computed(() => {
    const w = this.store.window();
    return {
      xAxis: { type: 'category', data: w.map((s) => hhmmss(s.t)), boundaryGap: false, axisLabel: { interval: Math.floor(w.length / 6) } },
      yAxis: { type: 'value', name: 'req/s', nameTextStyle: { align: 'right' } },
      series: [{ name: 'Throughput', type: 'line', showSymbol: false, areaStyle: { opacity: 0.12 }, lineStyle: { width: 1.8 }, data: w.map((s) => s.rps) }],
    };
  });
  protected readonly latencySummary = computed(() => {
    const l = this.store.latest();
    return l ? `Latest p50 ${l.p50} ms, p95 ${l.p95} ms for ${this.store.selectedDef().name}; SLO ${this.store.selectedDef().sloP95} ms.` : '';
  });
  protected readonly rpsSummary = computed(() => {
    const l = this.store.latest();
    return l ? `Latest throughput ${l.rps} requests per second.` : '';
  });

  protected tone(h: Health): Tone {
    return h === 'healthy' ? 'ok' : h === 'degraded' ? 'warn' : 'crit';
  }
}
