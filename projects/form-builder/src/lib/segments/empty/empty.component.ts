import {ChangeDetectionStrategy, Component} from '@angular/core';
import {SegmentComponent} from '../../segment/segment.component';

@Component({
  selector: 'fb-empty',
  templateUrl: './empty.component.html',
  styleUrls: ['./empty.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyComponent extends SegmentComponent {}
