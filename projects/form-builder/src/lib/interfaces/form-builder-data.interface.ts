import {JSONSchema7} from 'json-schema';
import {ModuleDefinitions} from './module-definitions.interface';
import {ModuleInstanceSegment} from './module-instance-segment.interface';

export interface FormBuilderData {
  value?: any,
  schema: JSONSchema7,
  definitions?: ModuleDefinitions,
  segments?: ModuleInstanceSegment[];
}
