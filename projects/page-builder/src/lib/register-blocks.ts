import {Injector} from '@angular/core';
import {createCustomElement} from '@angular/elements';
import {STATE} from './state.const';

export function registerBlocks(page: string, injector: Injector) {
  if (!STATE.registered[page]) {
    STATE.registered[page] = true;
    Object.entries(STATE.blocks[page]).forEach(([key, {component}]) => {
      const element = createCustomElement(component, {injector});
      customElements.define(key, element);
    });
  }
}