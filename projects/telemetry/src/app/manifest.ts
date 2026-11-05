import { RemoteManifest, SHELL_API_VERSION } from '@convo/contract';

/** Exposed to the shell as `./manifest`: the remote describes itself. */
export const MANIFEST: RemoteManifest = {
  id: 'telemetry',
  label: 'Telemetry',
  icon: 'monitoring',
  version: '1.7.2',
  shellApi: SHELL_API_VERSION,
  owner: 'Platform Squad',
  description: 'Real-time latency, throughput and error budgets.',
};
