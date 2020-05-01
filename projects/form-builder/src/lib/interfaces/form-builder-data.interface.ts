import {JSONSchema7} from 'json-schema';
import {Definitions} from './definitions.interface';
import {Segment} from './segment.interface';

export interface FormBuilderData {
  value?: any;
  schema: JSONSchema7;
  definitions?: Definitions;
  segments?: Segment[];
}
