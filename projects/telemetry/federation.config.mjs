import { withNativeFederation, fromPackageJson, mappingsFromWorkspace } from '@angular-architects/native-federation/config';

export default withNativeFederation({
  name: 'telemetry',

  exposes: {
    './manifest': './projects/telemetry/src/app/manifest.ts',
    './routes': './projects/telemetry/src/app/remote.routes.ts',
  },

  shared: fromPackageJson({ singleton: true, strictVersion: true, requiredVersion: 'auto', build: 'package' })
    .patch(['@angular/*'], { includeSecondaries: { keepAll: true } })
    .get(),

  // Contract + design system are shared singletons: one SHELL_API token, one set of components.
  sharedMappings: mappingsFromWorkspace({ singleton: true }).filter(['@convo/*']).get(),

  skip: ['@angular/cdk/schematics', '@angular/material/schematics', '@angular/localize', 'rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'],
  features: { denseChunking: true, denseExternals: true, strictImports: false },
});
