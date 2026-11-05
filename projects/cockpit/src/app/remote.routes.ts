import { Routes } from '@angular/router';
import { CockpitStore } from './cockpit.store';

/** Exposed to the shell as `./routes`. */
export const REMOTE_ROUTES: Routes = [
  { path: '', providers: [CockpitStore], loadComponent: () => import('./cockpit-page').then((m) => m.CockpitPage) },
];
