import {Injector} from '@angular/core';
import {createCustomElement} from '@angular/elements';
import {STATE} from './state.const';

export class RegisterBlocks {
  constructor(
    private injector: Injector
  ) {
    if (!STATE.registered) {
      STATE.registered = true;
      Object.entries(STATE.blocks).forEach(([key, {component}]) => {
        const element = createCustomElement(component, {injector});
        customElements.define(key, element);
      });
      console.log('register elements');
    }
  }
}