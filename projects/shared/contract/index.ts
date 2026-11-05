import { InjectionToken, Signal } from '@angular/core';

/**
 * Integration contract between the shell (host) and a micro-frontend (remote).
 * Published as `@convo/contract` and shared as a federation singleton, so the
 * host and every remote see the *same* SHELL_API token instance at runtime.
 *
 * Versioning: SHELL_API_VERSION is a major. A remote declares the major it was
 * built against in its manifest; the shell refuses to mount a mismatch.
 */
export const SHELL_API_VERSION = 2;

/** Self-description each remote exposes as `./manifest`. */
export interface RemoteManifest {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  /** Semver of the remote build. */
  readonly version: string;
  /** ShellApi major this remote was built against. */
  readonly shellApi: number;
  readonly owner: string;
  readonly description: string;
}

/** The only surface a remote may use to talk to the shell. */
export interface ShellApi {
  readonly version: number;
  readonly theme: Signal<'light' | 'dark'>;
  track(event: string, props?: Record<string, string | number | boolean>): void;
  notify(message: string, kind?: 'info' | 'success' | 'error'): void;
}

export const SHELL_API = new InjectionToken<ShellApi>('SHELL_API');

/** Console-backed ShellApi used when a remote is run on its own (`ng serve cockpit`). */
export const standaloneShellApi = (): ShellApi => ({
  version: SHELL_API_VERSION,
  theme: (() => 'light') as Signal<'light' | 'dark'>,
  track: (e, p) => console.debug('[standalone] track', e, p),
  notify: (m, k) => console.info('[standalone] notify', k ?? 'info', m),
});
