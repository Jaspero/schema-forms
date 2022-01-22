import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FieldComponent, FieldData, Option} from '@jaspero/form-builder';

export interface RadioData extends FieldData {
  options: Option[];
}

@Component({
  selector: 'fb-radio',
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioComponent extends FieldComponent<RadioData> {}
