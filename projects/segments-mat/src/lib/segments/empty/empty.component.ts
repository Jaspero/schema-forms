import {ChangeDetectionStrategy, Component} from '@angular/core';
import {SegmentComponent, CompiledField} from '@jaspero/form-builder';

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
