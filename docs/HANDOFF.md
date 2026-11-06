# Handoff: resuming Convo Console in a local session

Paste the **Master prompt** below into the first message of the local Claude Code session (run from the repo root after cloning). Everything it refers to is in this repository.

---

## Master prompt

You are resuming work on **Convo Console**, an Angular micro-frontend platform built as a working answer to a *Senior Frontend Engineer, Angular + TypeScript* job description (CONVO). A previous cloud session built and pushed it. Treat this prompt as the full briefing; verify the claims below by running the commands, not by trusting them.

### 1. Goal and the JD it answers

Own the Angular / micro-frontend architecture: micro-frontend boundaries, shared shell and versioning conventions; critical Studio and sales-cockpit workflows; design-system adoption and component APIs; data visualisation and real-time telemetry views; and *standards* for state management, performance, accessibility, testing and front-end observability, plus reference implementations and a review checklist for external implementation squads. Preferred: NgRx / signals state, Module Federation or comparable, Storybook, visual regression, front-end error monitoring. Acceptance evidence expected: an approved MFE architecture and integration contract, design-system-aligned reference components and shell, critical workflows with test and accessibility coverage, and engineering standards plus a review checklist.

Design bar: the UI must not look like generic AI output. Keep the restrained look already established (warm-paper neutrals, one deep-green accent, IBM Plex Sans + Mono with tabular figures, 1 px borders, dense layouts, status never colour-only). Do not introduce purple gradients, glassmorphism or emoji decoration.

### 2. Repository and state

* Repo: `https://github.com/kamran011/ng-micro-fe`, branch `main` (HEAD at handoff: `6974029`). Work on `main` unless told otherwise. Do **not** open pull requests unless asked.
* Stack: Angular 22 (standalone, signals, OnPush, zoneless apps), TypeScript 6, Angular Material + CDK 22, NgRx Signals 22, `@angular-architects/native-federation` 22, ECharts 6, Vitest (`@angular/build:unit-test`), Playwright + `@axe-core/playwright`, Storybook 10.
* Layout:
  * `projects/shell` (host, :4200): chrome, `RemoteRegistry` (discovers `public/federation.manifest.json`, loads each remote's `./manifest`, 4 s timeout, contract check), route building (`app.routes.ts` `buildRoutes`), `RemoteFallback` error boundary, `Observability` + `ErrorHandler`, `ShellApi` implementation, platform pages `/system` and `/architecture`.
  * `projects/cockpit` (:4201), `projects/studio` (:4202), `projects/telemetry` (:4203): remotes. Each exposes `./manifest` (`MANIFEST`) and `./routes` (`REMOTE_ROUTES`, with the remote's SignalStore as a route-level provider) and has a standalone dev harness (`app.ts`/`app.config.ts` with `standaloneShellApi`).
  * `projects/shared/contract` (`@convo/contract`): `RemoteManifest`, `ShellApi`, `SHELL_API` token, `SHELL_API_VERSION` (= 2), `standaloneShellApi`.
  * `projects/shared/ds` (`@convo/ds`): `ds-badge`, `ds-stat`, `ds-sparkline`, `ds-chart` (themed ECharts, **requires** `label` + `summary`), `ds-empty`, plus `*.stories.ts`.
  * `projects/shared/styles`: `_tokens.scss` (light/dark CSS custom properties), `_global.scss` (Material theme mapped onto tokens, globals like `.page`, `.num`, `.sr-only`), `storybook.scss`.
  * `e2e/` (whole-app Playwright + axe), `e2e-visual/` (visual regression + committed baselines in `__screenshots__/`), `.storybook/`, `docs/screenshots/`.
* Shared singletons are configured in each `federation.config.mjs` (`shared` via `fromPackageJson` with `keepAll` secondaries and a skip list for `@angular/cdk/schematics`, `@angular/material/schematics`, `@angular/localize`; `sharedMappings: mappingsFromWorkspace().filter(['@convo/*'])`).
* All data is simulated in the front end (seeded data + timers). No backend, auth or persistence.

### 3. First thing to do: verify the baseline

```bash
npm install
npm run build              # 4 production builds (~46 kB gzip initial each)
npm test                   # 20 unit tests across 4 projects
npm start                  # shell :4200 + remotes :4201-4203
npm run e2e                # 11 Playwright tests incl. axe; needs the stack (auto-started)
npm run build-storybook && npm run test:visual   # 36 visual tests
```

Expected at handoff: all green, **except `test:visual` on a non-Linux machine**: the baselines were generated on Linux/Chromium and font rasterisation differs on macOS/Windows. Do not "fix" that by loosening thresholds. Either run the visual suite in the Playwright Docker image (`mcr.microsoft.com/playwright:<version>-jammy`, matching the installed `@playwright/test`) and regenerate there, or regenerate local baselines only if you move baselines out of the repo. Decide with the user.

If Playwright cannot find a browser locally, run `npx playwright install chromium` (the cloud session used a pre-installed Chromium via `CHROME_PATH`; both Playwright configs honour `CHROME_PATH`).

### 4. Gotchas already solved (do not re-debug)

* `ng test <project>` has no `--watch` flag with the Vitest builder; use `CI=1 ng test <project>`. The `test` targets were added to `angular.json` manually because projects were generated with `--skip-tests`.
* `tsconfig.json` has no `baseUrl` (TS 6 deprecation); path mappings must start with `./`. `lib` is `ES2023` (needed for `toSorted`).
* Native Federation: `includeSecondaries: { keepAll: true }` is needed so remotes don't bundle their own Angular, but then the Node-only schematics entry points must be in `skip` or the shared build fails with `node:fs` resolution errors.
* Storybook 10 + Angular 22 needs explicit pins: `@angular/platform-browser-dynamic@22`, `@angular-devkit/build-angular@22`, `@angular/animations@22`, `@angular-devkit/core@22` (otherwise npm ERESOLVE / a stale 20.x).
* Storybook webpack has no CSS loader for imports in `preview.ts`: fonts/icons live in the `design-system` build target's `styles` array in `angular.json`. Storybook uses `.storybook/tsconfig.json`. Wrap stories with `componentWrapperDecorator`, not a `<story />` template.
* Playwright `toBeEmpty()` checks *text*, so SVG/canvas-only stories look empty; the visual spec checks child elements instead.
* The Angular scaffold `.gitignore` had `__screenshots__/`, which silently dropped visual baselines; that rule was removed. Keep it removed.
* `ds-chart` deep-merges caller options over themed defaults (a shallow merge previously dropped themed gridlines in dark mode). Don't regress this; the visual baselines guard it.
* Material icons use `<mat-icon fontSet="material-symbols-outlined">name</mat-icon>`.
* In the repo, the `README.md` is the user-facing documentation; keep it accurate when behaviour changes (it already documents Storybook, visual regression and limitations).

### 5. What is left (prioritised, from the JD gap analysis)

1. **CI workflow** (`.github/workflows/ci.yml`): build all four apps, unit tests, e2e + axe, `build-storybook`, visual tests in the same container image that produced the baselines, publish the Playwright/visual reports as artifacts. This is the "acceptance evidence".
2. **ESLint** (`angular-eslint` + `typescript-eslint`) with **import-boundary rules**: remotes may import only `@convo/*` and their own folder (no cross-remote imports, no deep imports into shell); enforce `OnPush`, signals-first conventions and template accessibility rules. There is currently no lint at all.
3. **Component tests** (TestBed render + user interaction) for the page components and the `@convo/ds` components, plus **contract tests** that load each remote's `MANIFEST`/`REMOTE_ROUTES` against `SHELL_API_VERSION` (the checklist asks squads for these but none exist). Add an e2e for an *incompatible* remote (currently only the offline case is e2e-tested; incompatible is unit-tested).
4. **Architecture decision records** in `docs/adr/` (MFE composition via Native Federation, shared singletons policy, contract versioning, state management with SignalStore, design-token strategy, visual-regression policy): the "approved architecture and integration contract" deliverable.
5. **Real observability sink**: wire `Observability` to Sentry or Datadog RUM behind an interface (env-configured, off by default), with source-map upload in the build, and report INP/LCP/CLS properly.
6. **Real-time adapter**: replace the `interval` feeds with a transport abstraction (WebSocket/SSE) including reconnect with backoff, heartbeat, and back-pressure/coalescing for 1 Hz+ streams; keep the simulator as a mock transport for tests and Storybook.
7. **Performance engineering**: enforce bundle budgets per app in `angular.json`, add Lighthouse CI (or a Playwright perf test), virtualise long lists (`cdk-virtual-scroll`) where applicable.
8. **Versioning conventions**: publish `@convo/ds` and `@convo/contract` as real versioned packages (changesets/semver, changelog), add remote version pinning/rollback through the manifest, per-environment `federation.manifest.json`, and a Docker/nginx example for serving remotes.
9. **Accessibility depth**: axe on dialogs/menus/overlays in their open state, focus-management tests for the publish dialog, a documented manual screen-reader pass, `@storybook/addon-vitest`/test-runner a11y in CI.
10. **Breadth**: Storybook stories + interaction tests (`play`) for app-level components; cross-browser (Firefox/WebKit) e2e; responsive visual snapshots; page-level visual snapshots once time/random seeds can be pinned.

### 6. How to work

* Make small, reviewable commits on `main` with clear messages. Run the relevant checks before every push (build, unit, e2e, and visual when touching `shared/ds` or tokens). Update the README and `docs/` when behaviour changes. Do not weaken or skip tests to get green.
* When touching tokens or `ds-*` components, rebuild Storybook and run `test:visual`; inspect the failing diffs before updating baselines and say what changed.
* Prefer the existing patterns (route-level SignalStore, `SHELL_API` for everything shell-facing, tokens only, `@convo/ds` before custom UI). Ask before adding dependencies that change the federation shared set.
* Start by running the verification in section 3, report results, then ask which item from section 5 to take first (default: 1, then 2).

---

## Quick facts for the human

* Relume MCP (`relume-library`) was added to the *other* repo (`kamran011/archivolt-rag`, `.mcp.json`), not this one, and still needs OAuth authorisation from an interactive session (`/mcp`). Copy the entry into this repo's `.mcp.json` if you want it here.
* Dev ports: shell 4200, cockpit 4201, studio 4202, telemetry 4203, Storybook 6006, visual-test static server 6007.
* Node 22+, npm 10+.
