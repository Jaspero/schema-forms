import {ComponentPortal} from '@angular/cdk/portal';
import {FieldComponent} from '../field/field.component';
import {Control} from './control.type';
import {State} from '../enums/state.enum';

export interface CompiledField {
  pointer: string;
  control: Control;
  portal: ComponentPortal<FieldComponent<any>>;
  validation: any;
  condition?: {
    field: string;
    action: 'show' | 'hide' | 'set-to';
    function: string;
    configuration?: any;
  };

  /**
   * Properties pulled from definition
   * that are necessary in the view
   */
  placeholder: string;
  label: string;
  onlyOn?: State | State[];
}
