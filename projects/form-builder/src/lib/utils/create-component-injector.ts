import {PortalInjector} from '@angular/cdk/portal';
import {InjectionToken, Injector} from '@angular/core';

export const COMPONENT_DATA = new InjectionToken<{}>('COMPONENT_DATA');

export function createComponentInjector(injector: Injector, dataToPass: any): PortalInjector {
  const injectorTokens = new WeakMap();
  injectorTokens.set(COMPONENT_DATA, dataToPass);
  return new PortalInjector(injector, injectorTokens);
}
