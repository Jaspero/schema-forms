import {ComponentPortal} from '@angular/cdk/portal';
import {FieldComponent} from '../field/field.component';
import {Control} from './control.type';
import {State} from '../enums/state.enum';

export interface Action {
  type: 'show' | 'hide' | 'set-to';
  eval: (...args) => boolean;
  configuration?: any;
}

export interface Condition {
  field: string;
  deps: string[];
  action: Action | Action[];
}

export interface CompiledField {
  pointer: string;
  control: Control;
  portal: ComponentPortal<FieldComponent<any>>;
  validation: any;
  condition?: Condition;

  /**
   * Properties pulled from definition
   * that are necessary in the view
   */
  placeholder: string;
  label: string;
  onlyOn?: State | State[];
}
