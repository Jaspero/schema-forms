import {ComponentPortal} from '@angular/cdk/portal';
import {SegmentComponent} from '../segment/segment.component';
import {CompiledField} from './compiled-field.interface';
import {CompiledCondition} from './condition.interface';
import {ModuleInstanceSegment} from './module-instance-segment.interface';

export interface CompiledSegment<T = any> extends ModuleInstanceSegment<T> {
  classes: string[];
  fields: CompiledField[] | string[];
  component?: ComponentPortal<SegmentComponent>;
  nestedSegments?: CompiledSegment<T>[];
  entryValue: any;
  conditions?: CompiledCondition[];
}
