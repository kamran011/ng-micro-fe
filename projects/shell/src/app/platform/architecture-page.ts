import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { SHELL_API_VERSION } from '@convo/contract';
import { DsBadge } from '@convo/ds';
import { RemoteRegistry } from '../core/remote.registry';

@Component({
  selector: 'app-architecture-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, DsBadge],
  templateUrl: './architecture-page.html',
  styleUrl: './architecture-page.scss',
})
export class ArchitecturePage {
  protected readonly registry = inject(RemoteRegistry);
  protected readonly apiVersion = SHELL_API_VERSION;
  protected readonly tone = (s: string) => (s === 'online' ? 'ok' : s === 'incompatible' ? 'warn' : 'crit');

  protected readonly checklist = [
    { area: 'Boundaries', items: ['Talks to the shell only through SHELL_API — no reaching into other remotes', 'No imports across remote folders; shared code lives in @convo/*', 'Own state; nothing global except the contract'] },
    { area: 'Design system', items: ['Colours, spacing and type come from tokens — no hex or px literals', 'Prefer @convo/ds and themed Material over custom controls', 'New shared component? Propose it in the design-system review first'] },
    { area: 'Accessibility', items: ['Every control reachable and operable by keyboard; visible focus', 'Charts set label + summary; status never conveyed by colour alone', 'Live regions for async updates; axe run is clean'] },
    { area: 'Performance', items: ['Signals + OnPush everywhere; no work in templates', 'Route-level lazy loading; remote ≤ 250 kB gzip initial', 'Long lists virtualised or paginated'] },
    { area: 'Testing', items: ['Store logic unit-tested; component tests for each workflow', 'One Playwright journey per critical flow with axe assertions', 'Contract tests run against the shell’s SHELL_API version'] },
    { area: 'Observability', items: ['Product events through SHELL_API.track', 'Errors reach the shared ErrorHandler; no swallowed catches', 'Remote publishes version in its manifest'] },
  ];
}
