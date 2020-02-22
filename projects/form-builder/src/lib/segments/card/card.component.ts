import {ChangeDetectionStrategy, Component} from '@angular/core';
import {SegmentComponent} from '../../segment/segment.component';

@Component({
  selector: 'fb-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent extends SegmentComponent {}
