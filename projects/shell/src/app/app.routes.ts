import { Router, Routes } from '@angular/router';
import { RemoteEntry, RemoteRegistry } from './core/remote.registry';
import { RemoteFallback } from './core/remote-fallback';
import { inject } from '@angular/core';

export const buildRoutes = (remotes: readonly RemoteEntry[]): Routes => [
  { path: '', pathMatch: 'full', redirectTo: remotes.find((r) => r.status === 'online')?.id ?? 'architecture' },
  ...remotes.map((r) =>
    r.status === 'online'
      ? { path: r.id, title: r.manifest!.label, loadChildren: () => inject(RemoteRegistry).loadRoutes(r.id) }
      : { path: r.id, title: `${r.id} unavailable`, component: RemoteFallback, data: { id: r.id } },
  ),
  { path: 'system', title: 'Design system', loadComponent: () => import('./platform/design-system-page').then((m) => m.DesignSystemPage) },
  { path: 'architecture', title: 'Architecture', loadComponent: () => import('./platform/architecture-page').then((m) => m.ArchitecturePage) },
  { path: '**', redirectTo: '' },
];

export const initRoutes = async () => {
  const registry = inject(RemoteRegistry);
  const router = inject(Router);
  router.resetConfig(buildRoutes(await registry.discover()));
};
