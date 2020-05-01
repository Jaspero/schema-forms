import {ComponentPortal} from '@angular/cdk/portal';
import {SegmentComponent} from '../segment/segment.component';
import {CompiledField} from './compiled-field.interface';
import {CompiledCondition} from './condition.interface';
import {Segment} from './segment.interface';

export interface CompiledSegment<T = any> extends Segment<T> {
  classes: string[];
  fields: CompiledField[] | string[];
  component?: ComponentPortal<SegmentComponent>;
  nestedSegments?: CompiledSegment<T>[];
  entryValue: any;
  conditions?: CompiledCondition[];
}
