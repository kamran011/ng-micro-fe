import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { RemoteRegistry } from './remote.registry';

/** Error boundary shown in place of a remote that is down or incompatible. */
@Component({
  selector: 'app-remote-fallback',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule],
  template: `
    <div class="page">
      <div class="box" role="alert">
        <h1>{{ id() }} is unavailable</h1>
        <p>{{ entry()?.status === 'incompatible' ? 'This application was built against a different shell contract.' : 'The shell could not load this application.' }} The rest of Convo Console keeps working.</p>
        <p class="mono detail">{{ entry()?.error }}</p>
        <button mat-flat-button (click)="retry()">Retry</button>
      </div>
    </div>
  `,
  styles: `
    .box { max-width: 520px; margin: var(--sp-7) auto; padding: var(--sp-5); background: var(--surface); border: 1px solid var(--line); border-left: 3px solid var(--crit); border-radius: var(--radius-lg); display: flex; flex-direction: column; gap: var(--sp-3); }
    .detail { color: var(--ink-3); font-size: var(--fs-xs); }
    button { align-self: flex-start; }
  `,
})
export class RemoteFallback {
  readonly id = input.required<string>();
  private readonly registry = inject(RemoteRegistry);
  private readonly router = inject(Router);
  protected readonly entry = computed(() => this.registry.remotes().find((r) => r.id === this.id()));

  async retry() {
    await this.registry.retry(this.id());
    if (this.entry()?.status === 'online') {
      await this.router.navigateByUrl('/', { skipLocationChange: true });
      await this.router.navigate([this.id()]);
    }
  }
}
