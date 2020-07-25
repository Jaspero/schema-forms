import {ComponentDefinition} from './component-definition.interface';
import {State} from '../enums/state.enum';

export interface Definition {
  component?: ComponentDefinition;
  formatOnSave?: string;
  formatOnCreate?: string;
  formatOnEdit?: string;
  formatOnLoad?: string;
  label?: string;
  hint?: string;
  defaultValue?: any;
  placeholder?: string;
  onlyOn?: State | State[];
  disableOn?: State | State[];
  disableForRoles?: string | string[];
  class?: string;

  /**
   * If provided only users with the appropriate
   * role see the field
   */
  roles?: string | string[];
  columnsDesktop?: number;
  columnsTablet?: number;
  columnsMobile?: number;
}

export interface Definitions {
  [key: string]: Definition;
}
