import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { SHELL_API, standaloneShellApi } from '@convo/contract';
import { REMOTE_ROUTES } from './remote.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(REMOTE_ROUTES),
    { provide: SHELL_API, useFactory: standaloneShellApi },
  ],
};
