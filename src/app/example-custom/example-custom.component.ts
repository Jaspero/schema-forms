import {Component} from '@angular/core';
import {CustomComponent} from '../../../projects/form-builder/src/lib/custom/custom.component';

@Component({
  selector: 'sc-example-custom',
  templateUrl: './example-custom.component.html',
  styleUrls: ['./example-custom.component.scss']
})
export class ExampleCustomComponent extends CustomComponent {}
