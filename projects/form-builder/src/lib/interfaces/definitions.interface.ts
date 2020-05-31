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
  width?: number;
}

export interface Definitions {
  [key: string]: Definition;
}
