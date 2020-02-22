import {Component, ChangeDetectionStrategy} from '@angular/core';
import {FieldComponent} from '../../field/field.component';
import {FieldData} from '../../interfaces/field-data.interface';

@Component({
  selector: 'fb-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxComponent extends FieldComponent<FieldData> {}
