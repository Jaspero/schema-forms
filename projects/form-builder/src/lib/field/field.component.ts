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

    const classes = [
      `fb-field-${this.cData.columnsDesktop || 12}`
    ];

    if (this.cData.columnsTablet) {
      classes.push(`m-fb-field-${this.cData.columnsTablet}`);
    }

    if (this.cData.columnsMobile) {
      classes.push(`s-fb-field-${this.cData.columnsMobile}`);
    }

    if (this.cData.class) {
      classes.push(this.cData.class);
    }

    this.class = classes.join(' ');
  }

  @HostBinding('class')
  class: string;
}
