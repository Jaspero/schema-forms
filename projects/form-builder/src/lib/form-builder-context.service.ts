import {Component, Injectable} from '@angular/core';
import {CustomFields} from './utils/custom-fields';

@Injectable()
export class FormBuilderContextService {

  fields: CustomFields = {};

  registerField(
    name: string,
    component: Component
  ) {
    if (this.fields.hasOwnProperty(name)) {
      throw new Error(`Field with ${name} already registered.`);
    }

    this.fields[name] = component;
  }
}
