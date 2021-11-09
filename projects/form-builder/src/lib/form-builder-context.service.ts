import {Inject, Injectable, Optional} from '@angular/core';
import {CUSTOM_COMPONENTS, CustomComponents} from './utils/custom-components';
import {CustomFields} from './utils/custom-fields';

@Injectable({providedIn: 'root'})
export class FormBuilderContextService {
  constructor(
    @Optional()
    @Inject(CUSTOM_COMPONENTS)
    private injectedComponents: CustomComponents
  ) {}

  fields: CustomFields = {};
  segments: CustomFields = {};
  components: CustomComponents = {};

  /**
   * Currently active module. Important for
   * components where the module is needed
   * before save triggers.
   */
  module: string;

  get componentMap() {
    return {
      ...this.injectedComponents || {},
      ...this.components
    }
  }

  registerField(
    name: string,
    component: any
  ) {
    if (this.fields.hasOwnProperty(name)) {
      throw new Error(`Field with selector ${name} already registered.`);
    }

    this.fields[name] = component;
  }

  registerSegment(
    selector: string,
    component: any
  ) {
    if (this.segments.hasOwnProperty(selector)) {
      throw new Error(`Segment with selector ${selector} already registered.`);
    }

    this.segments[selector] = component;
  }

  registerComponent(
    selector: string,
    component: any
  ) {
    if (this.components.hasOwnProperty(selector)) {
      throw new Error(`Field with selector ${selector} already registered.`);
    }

    this.components[selector] = component;
  }
}
