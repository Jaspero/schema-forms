import {Component} from '@angular/core';
import {CustomComponent} from '@jaspero/form-builder';

@Component({
  selector: 'sc-example-custom',
  templateUrl: './example-custom.component.html',
  styleUrls: ['./example-custom.component.scss']
})
export class ExampleCustomComponent extends CustomComponent {}
