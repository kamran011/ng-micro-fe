import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, viewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { SHELL_API } from '@convo/contract';
import { DsBadge, DsChart, DsEmpty, DsStat, Tone } from '@convo/ds';
import { Conversation, STAGES, Stage, StatusFilter } from './cockpit.models';
import { CockpitStore } from './cockpit.store';

@Component({
  selector: 'app-cockpit-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe, DatePipe, FormsModule, MatButtonModule, MatButtonToggleModule, MatFormFieldModule, MatIconModule,
    MatInputModule, MatSelectModule, MatSlideToggleModule, MatSortModule, MatTableModule, MatTabsModule,
    DsBadge, DsChart, DsEmpty, DsStat,
  ],
  templateUrl: './cockpit-page.html',
  styleUrl: './cockpit-page.scss',
})
export class CockpitPage {
  protected readonly store = inject(CockpitStore);
  private readonly shell = inject(SHELL_API);
  protected readonly stages = STAGES;
  protected readonly draft = signal('');
  protected readonly cols = ['stage', 'count', 'value', 'share'];
  private readonly thread = viewChild<ElementRef<HTMLElement>>('thread');
  protected announce = signal('');

  protected readonly pipelineOption = computed(() => ({
    grid: { left: 90, right: 24, top: 8, bottom: 24 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'value', axisLabel: { formatter: (v: number) => `$${v / 1000}k` } },
    yAxis: { type: 'category', inverse: true, data: this.store.byStage().map((s) => s.stage), axisLine: { show: false }, splitLine: { show: false } },
    series: [{ type: 'bar', barWidth: 18, itemStyle: { borderRadius: [0, 3, 3, 0] }, data: this.store.byStage().map((s) => s.value) }],
  }));
  protected readonly pipelineSummary = computed(() =>
    this.store.byStage().map((s) => `${s.stage}: ${s.count} deals, $${s.value.toLocaleString()}`).join('; '),
  );
  protected readonly tableRows = computed(() => {
    const total = this.store.byStage().reduce((n, s) => n + s.value, 0) || 1;
    return this.store.byStage().map((s) => ({ ...s, share: s.value / total }));
  });

  constructor() {
    // Keep the transcript pinned to the newest message.
    effect(() => {
      this.store.selected()?.messages.length;
      queueMicrotask(() => {
        const el = this.thread()?.nativeElement;
        if (el) el.scrollTop = el.scrollHeight;
      });
    });
    // Tell assistive tech about inbound traffic without stealing focus.
    effect(() => {
      const n = this.store.unreadTotal();
      this.announce.set(n ? `${n} unread messages` : '');
    });
  }

  protected tone(c: Conversation): Tone {
    return c.status === 'live' ? 'ok' : c.status === 'waiting' ? 'warn' : 'neutral';
  }
  protected mood(s: number): { label: string; tone: Tone } {
    return s > 0.3 ? { label: 'Positive', tone: 'ok' } : s < -0.1 ? { label: 'At risk', tone: 'crit' } : { label: 'Neutral', tone: 'neutral' };
  }
  protected setFilter(v: StatusFilter) {
    this.store.setStatusFilter(v);
  }
  protected useSuggestion(c: Conversation) {
    this.draft.set(c.suggestion);
    this.shell.track('cockpit.suggestion_used', { conversation: c.id });
  }
  protected send(c: Conversation) {
    this.store.send(c.id, this.draft());
    this.draft.set('');
    this.shell.track('cockpit.message_sent', { conversation: c.id });
  }
  protected move(c: Conversation, stage: Stage) {
    this.store.moveStage(c.id, stage);
    this.shell.notify(`${c.company} moved to ${stage}`, 'success');
    this.shell.track('cockpit.stage_changed', { conversation: c.id, stage });
  }
}
