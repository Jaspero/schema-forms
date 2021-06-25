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
    cards: Array<{
      title?: string;
      image?: string;
    }>
  }
}
