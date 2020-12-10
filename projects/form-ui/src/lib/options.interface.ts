import {Definitions, Segment} from '@jaspero/form-builder';
import {JSONSchema7} from 'json-schema';

export interface FbFormUiOptions {
  additionalTypeOptions?: {
    [key: string]: {
      schema: JSONSchema7,
      segments?: Segment[];
      definitions?: Definitions;
    }
  };
}
