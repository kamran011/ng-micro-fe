import { ApplicationConfig, ErrorHandler, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { initRoutes } from './app.routes';
import { ObservabilityErrorHandler } from './core/observability.service';
import { provideShellApi } from './core/shell-api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter([], withComponentInputBinding(), withViewTransitions()),
    provideShellApi(),
    provideAppInitializer(initRoutes),
    { provide: ErrorHandler, useClass: ObservabilityErrorHandler },
  ],
};
