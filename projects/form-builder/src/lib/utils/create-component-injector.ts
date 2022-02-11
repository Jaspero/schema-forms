import {InjectionToken, Injector} from '@angular/core';

export const COMPONENT_DATA = new InjectionToken<{}>('COMPONENT_DATA');

export function createComponentInjector(injector: Injector, dataToPass: any) {
  return Injector.create({
    providers: [{provide: COMPONENT_DATA, useValue: dataToPass}],
    parent: injector
  });
}
