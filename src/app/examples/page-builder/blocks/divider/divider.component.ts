import {Component} from '@angular/core';
import {Block} from '../../../../../../projects/page-builder/src/lib/decorators/block.decorator';

@Block({
  label: 'Divider',
  icon: 'minimize'
})
@Component({
  selector: 'sc-divider',
  templateUrl: './divider.component.html',
  styleUrls: ['./divider.component.scss']
})
export class DividerComponent {}
