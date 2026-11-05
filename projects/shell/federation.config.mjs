import { withNativeFederation, fromPackageJson, mappingsFromWorkspace } from '@angular-architects/native-federation/config';

export default withNativeFederation({
  name: 'shell',

  shared: fromPackageJson({ singleton: true, strictVersion: true, requiredVersion: 'auto', build: 'package' })
    .patch(['@angular/*'], { includeSecondaries: { keepAll: true } })
    .get(),

  sharedMappings: mappingsFromWorkspace({ singleton: true }).filter(['@convo/*']).get(),

  skip: ['@angular/cdk/schematics', '@angular/material/schematics', '@angular/localize', 'rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'],
  features: { denseChunking: true, denseExternals: true, strictImports: false },
});
