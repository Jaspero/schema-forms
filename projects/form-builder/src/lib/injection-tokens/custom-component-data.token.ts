import {InjectionToken} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';

export interface CustomComponentData {
  id?: string;
  columnsDesktop?: number;
  columnsTablet?: number;
  columnsMobile?: number;
  class?: string;
  form: UntypedFormGroup;
}

export const CUSTOM_COMPONENT_DATA = new InjectionToken<CustomComponentData>('CUSTOM_COMPONENT_DATA');
