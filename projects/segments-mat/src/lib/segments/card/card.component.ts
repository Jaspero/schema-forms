import {ChangeDetectionStrategy, Component} from '@angular/core';
import {SegmentComponent, CompiledField} from '@jaspero/form-builder';

@Component({
  selector: 'fb-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent extends SegmentComponent {
  get fields() {
    return this.segment.fields as CompiledField[];
  }
}
