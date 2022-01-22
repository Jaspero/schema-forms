import {DefinitionWithConfiguration} from '@jaspero/form-builder';
import {FieldsConfiguration} from './fields/fields.component';

export type FieldsDefinition<Prefix extends string = 'fu-'> = DefinitionWithConfiguration<FieldsConfiguration, Prefix, 'fields'>
