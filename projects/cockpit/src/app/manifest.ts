import { RemoteManifest, SHELL_API_VERSION } from '@convo/contract';

/** Exposed to the shell as `./manifest`: the remote describes itself. */
export const MANIFEST: RemoteManifest = {
  id: 'cockpit',
  label: 'Sales Cockpit',
  icon: 'radar',
  version: '3.4.1',
  shellApi: SHELL_API_VERSION,
  owner: 'Revenue Squad',
  description: 'Live conversations, pipeline and next-best-action for sellers.',
};
