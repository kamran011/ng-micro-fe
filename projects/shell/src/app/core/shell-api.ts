import { Provider, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SHELL_API, SHELL_API_VERSION, ShellApi } from '@convo/contract';
import { Observability } from './observability.service';
import { ThemeService } from './theme.service';

/** The shell's implementation of the contract every remote codes against. */
export const provideShellApi = (): Provider => ({
  provide: SHELL_API,
  useFactory: (): ShellApi => {
    const theme = inject(ThemeService);
    const obs = inject(Observability);
    const snack = inject(MatSnackBar);
    return {
      version: SHELL_API_VERSION,
      theme: theme.theme,
      track: (e, p) => obs.track(e, p),
      notify: (m, kind = 'info') =>
        snack.open(m, 'Dismiss', { duration: kind === 'error' ? 8000 : 4000, politeness: kind === 'error' ? 'assertive' : 'polite' }),
    };
  },
});
