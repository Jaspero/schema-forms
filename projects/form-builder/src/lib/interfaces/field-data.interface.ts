import {FormControl, FormGroup} from '@angular/forms';
import {Pointers} from '../utils/parser';

export interface FieldData <T = FormControl> {

  /**
   * Is the field rendered as part of a form
   * or in standalone "single" mode
   */
  single: boolean;
  pointers: Pointers;
  form: FormGroup;
  control: T;
  label: string;
  columnsDesktop?: number;
  columnsMobile?: number;
  columnsTablet?: number;
  hint?: string;
  placeholder?: string;
  class?: string;
}
