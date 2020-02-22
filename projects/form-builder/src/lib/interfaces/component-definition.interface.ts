import {ComponentType} from '../enums/component-type.enum';

export interface ComponentDefinition {
  type: ComponentType;
  configuration?: any;
}
