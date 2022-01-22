import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FieldComponent, FieldData, Option} from '@jaspero/form-builder';

export interface RadioConfiguration {
  options: Option[];
}

export type RadioData = RadioConfiguration & FieldData;

@Component({
  selector: 'fb-radio',
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioComponent extends FieldComponent<RadioData> {}
