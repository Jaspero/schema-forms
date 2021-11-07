import {Condition as FieldCondition} from './compiled-field.interface';
import {CompiledCondition, Condition} from './condition.interface';
import {CustomComponentDefinition} from './custom-component-definition.interface';

export interface Segment<C = any> {
  components?: CustomComponentDefinition[];

  /**
   * @example
   * A regular string field
   * fields: ['/name'],
   *
   * A field that's dependent on another field "/something" to be truthy
   * fields: [{field: '/name', deps: ['/something'], eval: v => v.something}]
   */
  fields?: (string | any | FieldCondition)[];
  array?: string;
  type?: string;
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
