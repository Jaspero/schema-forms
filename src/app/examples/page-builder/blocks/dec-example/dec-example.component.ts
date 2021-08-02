import {Component, OnInit} from '@angular/core';
import {Block} from '../../../../../../projects/page-builder/src/lib/decorators/block.decorator';

@Block({
  form: {
    schema: {
      properties: {
        name: {type: 'string'}
      }
    },
    segments: [{
      fields: ['/name']
    }],
    definitions: {
      name: {
        label: 'Name'
      }
    }
  }
})
@Component({
  selector: 'sc-dec-example',
  templateUrl: './dec-example.component.html',
  styleUrls: ['./dec-example.component.scss']
})
export class DecExampleComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
