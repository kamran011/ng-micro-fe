import { Routes } from '@angular/router';
import { TelemetryStore } from './telemetry.store';

/** Exposed to the shell as `./routes`. */
export const REMOTE_ROUTES: Routes = [
  { path: '', providers: [TelemetryStore], loadComponent: () => import('./telemetry-page').then((m) => m.TelemetryPage) },
];
