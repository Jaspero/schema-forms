import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CompiledField} from '../../interfaces/compiled-field.interface';
import {SegmentComponent} from '../../segment/segment.component';

@Component({
  selector: 'fb-empty',
  templateUrl: './empty.component.html',
  styleUrls: ['./empty.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyComponent extends SegmentComponent {
  get fields() {
    return this.segment.fields as CompiledField[];
  }
}
