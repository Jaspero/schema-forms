import {DefinitionWithConfiguration} from '@jaspero/form-builder';
import {BackgroundData} from './fields/background/background.component';
import {MbpData} from './fields/mbp/mbp.component';
import {BlocksData} from './page-builder/page-builder.component';

export type FieldDefinitions<Prefix extends string = 'pb-'> =
  DefinitionWithConfiguration<BlocksData, Prefix, 'blocks'> |
  DefinitionWithConfiguration<MbpData, Prefix, 'mbp'> |
  DefinitionWithConfiguration<BackgroundData, Prefix, 'background'>
