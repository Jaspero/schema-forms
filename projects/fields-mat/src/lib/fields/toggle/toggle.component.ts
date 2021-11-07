import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FieldComponent, FieldData} from '@jaspero/form-builder';

@Component({
  selector: 'fb-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleComponent extends FieldComponent<FieldData> {}
