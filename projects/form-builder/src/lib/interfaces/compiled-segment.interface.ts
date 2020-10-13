import {ComponentPortal} from '@angular/cdk/portal';
import {CustomComponent} from '../custom/custom.component';
import {SegmentComponent} from '../segment/segment.component';
import {CompiledField} from './compiled-field.interface';
import {CompiledCondition} from './condition.interface';
import {Segment} from './segment.interface';

export interface CompiledSegment<T = any> extends Segment<T> {
  classes: string[];
  fields: CompiledField[] | string[];
  customComponents: ComponentPortal<CustomComponent>[];
  component?: ComponentPortal<SegmentComponent>;
  nestedSegments?: CompiledSegment<T>[];
  entryValue: any;
  conditions?: CompiledCondition[];
}
