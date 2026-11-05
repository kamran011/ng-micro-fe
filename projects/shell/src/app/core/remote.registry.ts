import { Injectable, computed, signal } from '@angular/core';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { RemoteManifest, SHELL_API_VERSION } from '@convo/contract';
import { Routes } from '@angular/router';

export type RemoteStatus = 'online' | 'offline' | 'incompatible';

export interface RemoteEntry {
  readonly id: string;
  readonly url: string;
  readonly status: RemoteStatus;
  readonly manifest?: RemoteManifest;
  readonly error?: string;
}

/**
 * Discovers remotes from `federation.manifest.json`, loads each remote's
 * self-describing `./manifest` at runtime, and verifies contract compatibility.
 * A remote that is down or built against another contract major degrades to a
 * fallback page; it never takes the shell down.
 */
@Injectable({ providedIn: 'root' })
export class RemoteRegistry {
  private readonly _remotes = signal<readonly RemoteEntry[]>([]);
  readonly remotes = this._remotes.asReadonly();
  readonly onlineCount = computed(() => this._remotes().filter((r) => r.status === 'online').length);

  async discover(): Promise<readonly RemoteEntry[]> {
    const map = (await fetch('federation.manifest.json').then((r) => r.json())) as Record<string, string>;
    const entries = await Promise.all(Object.entries(map).map(([id, url]) => this.probe(id, url)));
    this._remotes.set(entries);
    return entries;
  }

  async retry(id: string) {
    const current = this._remotes().find((r) => r.id === id);
    if (!current) return;
    const next = await this.probe(id, current.url);
    this._remotes.update((all) => all.map((r) => (r.id === id ? next : r)));
  }

  loadRoutes(id: string): Promise<Routes> {
    return loadRemoteModule({ remoteName: id, exposedModule: './routes' }).then((m: { REMOTE_ROUTES: Routes }) => m.REMOTE_ROUTES);
  }

  private async probe(id: string, url: string): Promise<RemoteEntry> {
    try {
      const m = await Promise.race([
        loadRemoteModule({ remoteName: id, exposedModule: './manifest' }) as Promise<{ MANIFEST: RemoteManifest }>,
        new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timed out after 4s')), 4000)),
      ]);
      const manifest = m.MANIFEST;
      if (manifest.shellApi !== SHELL_API_VERSION) {
        return { id, url, status: 'incompatible', manifest, error: `built for shell API v${manifest.shellApi}, shell provides v${SHELL_API_VERSION}` };
      }
      return { id, url, status: 'online', manifest };
    } catch (e) {
      return { id, url, status: 'offline', error: e instanceof Error ? e.message : String(e) };
    }
  }
}
