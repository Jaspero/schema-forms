import {ComponentDefinition} from './component-definition.interface';
import {State} from './state.interface';

export interface ModuleDefinition {
  component?: ComponentDefinition;
  formatOnSave?: string;
  formatOnCreate?: string;
  formatOnEdit?: string;
  formatOnLoad?: string;
  label?: string;
  hint?: string;
  defaultValue?: any;
  placeholder?: string;
  onlyOn?: State;
  disableOn?: State;
}

export interface ModuleDefinitions {
  [key: string]: ModuleDefinition;
}
