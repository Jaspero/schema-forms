import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
  selector: 'sc-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardsComponent {
  @Input()
  data: {
    slideTitle?: string;
    slides: Array<{
      title?: string;
      image?: string;
    }>
  }
}
