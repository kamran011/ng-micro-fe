import { Routes } from '@angular/router';
import { StudioStore } from './studio.store';

/** Exposed to the shell as `./routes`. */
export const REMOTE_ROUTES: Routes = [
  { path: '', providers: [StudioStore], loadComponent: () => import('./studio-page').then((m) => m.StudioPage) },
];
