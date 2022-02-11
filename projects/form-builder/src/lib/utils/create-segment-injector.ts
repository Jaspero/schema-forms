import {InjectionToken, Injector} from '@angular/core';

export const SEGMENT_DATA = new InjectionToken<{}>('SEGMENT_DATA');

export function createSegmentInjector(injector, dataToPass) {
  return Injector.create({
    providers: [{provide: SEGMENT_DATA, useValue: dataToPass}],
    parent: injector
  });
}
