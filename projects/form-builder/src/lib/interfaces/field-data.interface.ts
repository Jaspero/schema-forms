import {UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {Pointers} from '../utils/parser';

export interface FieldData <T = UntypedFormControl> {
  pointer: string;
  formId?: string;
  parentForm?: {
    pointer: string;
    id: string;
  };
  /**
   * Is the field rendered as part of a form
   * or in standalone "single" mode
   */
  single: boolean;
  pointers: Pointers;
  form: UntypedFormGroup;
  control: T;
  label: string;
  columnsDesktop?: number;
  columnsMobile?: number;
  columnsTablet?: number;
  hint?: string;
  placeholder?: string;
  class?: string;
}
