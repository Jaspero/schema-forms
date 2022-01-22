import {DefinitionWithConfiguration} from '@jaspero/form-builder';
import {BackgroundConfiguration} from './fields/background/background.component';
import {MbpConfiguration} from './fields/mbp/mbp.component';
import {BlocksConfiguration} from './page-builder/page-builder.component';

export type FieldDefinitions<Prefix extends string = 'pb-'> =
  DefinitionWithConfiguration<BlocksConfiguration, Prefix, 'blocks'> |
  DefinitionWithConfiguration<MbpConfiguration, Prefix, 'mbp'> |
  DefinitionWithConfiguration<BackgroundConfiguration, Prefix, 'background'>
