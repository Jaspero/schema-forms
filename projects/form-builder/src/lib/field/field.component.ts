import {Component, HostBinding, Inject} from '@angular/core';
import {FieldData} from '../interfaces/field-data.interface';
import {COMPONENT_DATA} from '../utils/create-component-injector';

// @dynamic
@Component({
  selector: 'fb-field',
  template: ''
})
export class FieldComponent<T extends FieldData> {
  constructor(
    @Inject(COMPONENT_DATA) public cData: T
  ) {
    this.class = `fb-field-${this.cData.width || 12}`
  }

  @HostBinding('class')
  class: string;
}
