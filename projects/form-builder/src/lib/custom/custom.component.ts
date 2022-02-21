import {Component, HostBinding, Inject} from '@angular/core';
import {CustomComponentData, CUSTOM_COMPONENT_DATA} from '../injection-tokens/custom-component-data.token';

@Component({
  selector: 'fb-custom-component',
  template: ''
})
export class CustomComponent {
  constructor(
    @Inject(CUSTOM_COMPONENT_DATA)
    public data: CustomComponentData
  ) {
    const classes = [
      `fb-field-${this.data.columnsDesktop || 12}`
    ];

    if (this.data.columnsTablet) {
      classes.push(`m-fb-field-${this.data.columnsTablet}`);
    }

    if (this.data.columnsMobile) {
      classes.push(`s-fb-field-${this.data.columnsMobile}`);
    }

    if (this.data.class) {
      classes.push(this.data.class);
    }

    this.class = classes.join(' ');
  }

  @HostBinding('class')
  class: string;
}
