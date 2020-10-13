import {PortalInjector} from '@angular/cdk/portal';
import {InjectionToken, Injector} from '@angular/core';
import {FormGroup} from '@angular/forms';

export interface CustomComponents {
  [key: string]: any;
}

export interface CustomComponentData {
  id?: string;
  columnsDesktop?: number;
  columnsTablet?: number;
  columnsMobile?: number;
  class?: string;
  form: FormGroup;
}

export const CUSTOM_COMPONENTS = new InjectionToken<CustomComponents>('CUSTOM_COMPONENTS');
export const CUSTOM_COMPONENT_DATA = new InjectionToken<CustomComponentData>('CUSTOM_COMPONENT_DATA');

export function createCustomComponentInjector(injector: Injector, dataToPass: CustomComponentData): PortalInjector {
  const injectorTokens = new WeakMap();
  injectorTokens.set(CUSTOM_COMPONENT_DATA, dataToPass);
  return new PortalInjector(injector, injectorTokens);
}

