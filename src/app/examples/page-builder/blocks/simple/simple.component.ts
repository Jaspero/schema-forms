import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

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
