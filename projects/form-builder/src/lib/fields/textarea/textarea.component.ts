import {Component, ChangeDetectionStrategy} from '@angular/core';
import {FieldComponent} from '../../field/field.component';
import {FieldData} from '../../interfaces/field-data.interface';

interface TextareaData extends FieldData {
  rows?: number;
  cols?: number;
  autocomplete?: string;
}

@Component({
  selector: 'fb-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextareaComponent extends FieldComponent<TextareaData> {}
