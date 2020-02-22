import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FieldComponent} from '../../field/field.component';
import {FieldData} from '../../interfaces/field-data.interface';
import {Option} from '../../interfaces/option.inteface';

interface RadioData extends FieldData {
  options: Option[];
}

@Component({
  selector: 'fb-radio',
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioComponent extends FieldComponent<RadioData> {}
