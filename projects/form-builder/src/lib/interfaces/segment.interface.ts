import {SegmentType} from '../enums/segment-type.enum';
import {Condition as FieldCondition} from './compiled-field.interface';
import {CompiledCondition, Condition} from './condition.interface';
import {CustomComponentDefinition} from './custom-component-definition.interface';

export interface Segment<C = any> {
  components?: CustomComponentDefinition[];
  fields?: (string | any | FieldCondition)[];
  array?: string;
  type?: SegmentType;
  title?: string;
  subTitle?: string;
  description?: string;
  nestedSegments?: Segment<C>[];
  columnsDesktop?: number;
  columnsTablet?: number;
  columnsMobile?: number;
  configuration?: C;
  classes?: string[];
  authorization?: string[];
  id?: string;
  conditions?: Condition[] | CompiledCondition[];
}
