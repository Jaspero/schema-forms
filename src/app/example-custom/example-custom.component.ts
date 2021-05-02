import {Component} from '@angular/core';
import {CustomComponent} from '../../../projects/form-builder/src/public-api';

@Component({
  selector: 'sc-example-custom',
  templateUrl: './example-custom.component.html',
  styleUrls: ['./example-custom.component.scss']
})
export class ExampleCustomComponent extends CustomComponent {}
