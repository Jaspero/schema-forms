import {InjectionToken} from '@angular/core';

export interface CustomFields {
  [key: string]: any;
}

export const CUSTOM_FIELDS = new InjectionToken<{}>('CUSTOM_FIELDS');
