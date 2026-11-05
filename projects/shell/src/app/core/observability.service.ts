import { ErrorHandler, Injectable, signal } from '@angular/core';

export interface ObsEvent {
  readonly at: number;
  readonly kind: 'event' | 'error' | 'vital';
  readonly name: string;
  readonly detail?: string;
}

/**
 * Front-end observability: product events, uncaught errors and Core Web Vitals
 * land in one ring buffer. Swap `sink` for Sentry/Datadog RUM in production.
 */
@Injectable({ providedIn: 'root' })
export class Observability {
  private readonly buffer = signal<readonly ObsEvent[]>([]);
  readonly events = this.buffer.asReadonly();

  constructor() {
    this.observeVitals();
  }

  track(name: string, props?: Record<string, unknown>) {
    this.push({ kind: 'event', name, detail: props ? JSON.stringify(props) : undefined });
  }

  error(err: unknown) {
    const e = err instanceof Error ? err : new Error(String(err));
    this.push({ kind: 'error', name: e.name, detail: e.message });
  }

  private push(e: Omit<ObsEvent, 'at'>) {
    this.buffer.update((b) => [...b.slice(-199), { ...e, at: Date.now() }]);
  }

  private observeVitals() {
    if (typeof PerformanceObserver === 'undefined') return;
    const watch = (type: string, name: string, pick: (e: PerformanceEntry) => number) => {
      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.push({ kind: 'vital', name, detail: `${Math.round(pick(entry))}ms` });
          }
        }).observe({ type, buffered: true });
      } catch {
        /* entry type unsupported */
      }
    };
    watch('largest-contentful-paint', 'LCP', (e) => e.startTime);
    watch('paint', 'FCP', (e) => e.startTime);
  }
}

@Injectable()
export class ObservabilityErrorHandler implements ErrorHandler {
  constructor(private readonly obs: Observability) {}
  handleError(error: unknown) {
    this.obs.error(error);
    console.error(error);
  }
}
