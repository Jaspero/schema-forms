import {Component, ChangeDetectionStrategy} from '@angular/core';
import {FieldComponent, FieldData} from '@jaspero/form-builder';

@Component({
  selector: 'fb-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxComponent extends FieldComponent<FieldData> {}
