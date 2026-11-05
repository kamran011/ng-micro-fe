import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SHELL_API } from '@convo/contract';
import { DsBadge, DsEmpty } from '@convo/ds';
import { PublishDialog } from './publish-dialog';
import { NODE_KINDS, NodeKind } from './studio.models';
import { StudioStore } from './studio.store';

@Component({
  selector: 'app-studio-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CdkDrag, CdkDragHandle, CdkDropList, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule,
    MatInputModule, MatMenuModule, MatSlideToggleModule, MatTooltipModule, DsBadge, DsEmpty,
  ],
  templateUrl: './studio-page.html',
  styleUrl: './studio-page.scss',
})
export class StudioPage {
  protected readonly store = inject(StudioStore);
  private readonly dialog = inject(MatDialog);
  private readonly shell = inject(SHELL_API);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly kinds = NODE_KINDS;
  protected readonly utterance = signal('Do you have SOC 2 and what does the Growth plan cost?');
  protected readonly icon = (k: NodeKind) => NODE_KINDS.find((x) => x.kind === k)!.icon;
  protected readonly kindLabel = (k: NodeKind) => NODE_KINDS.find((x) => x.kind === k)!.label;
  protected readonly issueIds = computed(() => new Set(this.store.issues().map((i) => i.nodeId)));
  protected readonly announce = signal('');

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(40)]],
    prompt: ['', [Validators.required, Validators.maxLength(600)]],
    timeoutSec: [30, [Validators.required, Validators.min(1), Validators.max(300)]],
    fallback: [true],
  });

  constructor() {
    // Selected node → form. Form → store (debounced by valueChanges' own cadence).
    effect(() => {
      const n = this.store.node();
      untracked(() => (n ? this.form.reset({ name: n.name, prompt: n.prompt, timeoutSec: n.timeoutSec, fallback: n.fallback }, { emitEvent: false }) : null));
      if (n) untracked(() => this.form.markAllAsTouched());
    });
    this.form.valueChanges.subscribe((v) => {
      const n = this.store.node();
      if (n && this.form.valid) this.store.updateNode(n.id, v as never);
    });
  }

  protected drop(e: CdkDragDrop<unknown>) {
    if (e.previousIndex === e.currentIndex) return;
    this.store.reorder(e.previousIndex, e.currentIndex);
    this.announce.set(`Moved step to position ${e.currentIndex + 1}`);
  }

  protected move(i: number, delta: number, ev: Event) {
    ev.stopPropagation();
    const to = i + delta;
    if (to < 0 || to >= this.store.agent().nodes.length) return;
    this.store.reorder(i, to);
    this.announce.set(`Moved step to position ${to + 1}`);
  }

  protected publish() {
    const a = this.store.agent();
    this.dialog
      .open(PublishDialog, { data: { agent: a.name, nextVersion: a.publishedVersion + 1, issues: this.store.issues() }, width: '480px' })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.store.publish();
        this.shell.notify(`${a.name} published as v${a.publishedVersion + 1}`, 'success');
        this.shell.track('studio.published', { agent: a.id, version: a.publishedVersion + 1 });
      });
  }

  protected run() {
    this.store.runTest(this.utterance());
    this.shell.track('studio.test_run', { agent: this.store.agent().id });
  }
}
