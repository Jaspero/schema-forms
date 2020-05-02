import {Component, InjectionToken} from '@angular/core';

export interface CustomFields {
  [key: string]: Component;
}

export const CUSTOM_FIELDS = new InjectionToken<{}>('CUSTOM_FIELDS');
