import {Component, Input} from '@angular/core';

@Component({
  selector: 'sc-simple',
  templateUrl: './simple.component.html',
  styleUrls: ['./simple.component.scss']
})
export class SimpleComponent {

  @Input()
  data: any;
}
