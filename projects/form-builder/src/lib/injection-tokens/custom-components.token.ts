import {InjectionToken} from '@angular/core';

export interface CustomComponents {
  [key: string]: any;
}

export const CUSTOM_COMPONENTS = new InjectionToken<CustomComponents>('CUSTOM_COMPONENTS');
