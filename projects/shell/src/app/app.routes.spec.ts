import { describe, expect, it } from 'vitest';
import { buildRoutes } from './app.routes';
import { RemoteEntry } from './core/remote.registry';

const entry = (id: string, status: RemoteEntry['status']): RemoteEntry => ({
  id,
  url: `http://x/${id}`,
  status,
  manifest: status === 'offline' ? undefined : { id, label: id, icon: 'x', version: '1.0.0', shellApi: 2, owner: 'o', description: 'd' },
});

describe('buildRoutes', () => {
  it('mounts online remotes lazily and degrades the rest to a fallback', () => {
    const routes = buildRoutes([entry('a', 'online'), entry('b', 'offline'), entry('c', 'incompatible')]);
    const by = (p: string) => routes.find((r) => r.path === p)!;
    expect(by('a').loadChildren).toBeTypeOf('function');
    expect(by('b').component).toBeDefined();
    expect(by('c').component).toBeDefined();
  });

  it('redirects the root to the first online remote', () => {
    const routes = buildRoutes([entry('a', 'offline'), entry('b', 'online')]);
    expect(routes[0].redirectTo).toBe('b');
  });

  it('falls back to the architecture page when nothing is online', () => {
    expect(buildRoutes([entry('a', 'offline')])[0].redirectTo).toBe('architecture');
  });
});
