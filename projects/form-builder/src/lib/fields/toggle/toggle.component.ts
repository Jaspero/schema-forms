import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FieldComponent} from '../../field/field.component';
import {FieldData} from '../../interfaces/field-data.interface';

@Component({
  selector: 'fb-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleComponent extends FieldComponent<FieldData> {}
