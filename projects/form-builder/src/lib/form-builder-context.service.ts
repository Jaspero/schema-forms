import {Inject, Injectable} from '@angular/core';
import {CUSTOM_COMPONENTS, CustomComponents} from './utils/custom-components';
import {CustomFields} from './utils/custom-fields';

@Injectable()
export class FormBuilderContextService {
  constructor(
    @Inject(CUSTOM_COMPONENTS)
    private injectedComponents: CustomComponents
  ) {}

  fields: CustomFields = {};
  components: CustomComponents = {};

  get componentMap() {
    return {
      ...this.injectedComponents,
      ...this.components
    }
  }

  registerField(
    name: string,
    component: any
  ) {
    if (this.fields.hasOwnProperty(name)) {
      throw new Error(`Field with ${name} already registered.`);
    }

    this.fields[name] = component;
  }

  registerComponent(
    selector: string,
    component: any
  ) {
    if (this.components.hasOwnProperty(selector)) {
      throw new Error(`Field with ${selector} already registered.`);
    }

    this.components[selector] = component;
  }
}
