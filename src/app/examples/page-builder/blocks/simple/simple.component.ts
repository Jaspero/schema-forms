import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Block} from '../../../../../../projects/page-builder/src/lib/decorators/block.decorator';


@Block({
  label: 'Banner',
  icon: 'image',
  previewValue: {
    singleLine: '<p class="this-is-here">Single Line Example. This is <b>bold</b>, <u>underlined</u> and <i>italic</i>. <b>This is bold with a <u>underlined</u> part.</b></p>',
    image: 'http://placeimg.com/640/360/any'
  },
  form: {
    segments: [],
    schema: {
      properties: {
        title: {type: 'string'},
        singleLine: {type: 'string'},
        image: {type: 'string'}
      }
    }
  }
})
@Component({
  selector: 'sc-simple',
  templateUrl: './simple.component.html',
  styleUrls: ['./simple.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleComponent {

  @Input()
  data: {
    title: string;
    singleLine: string;
    image: string;
  };
}
