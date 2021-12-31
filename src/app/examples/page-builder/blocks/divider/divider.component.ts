import {ChangeDetectionStrategy, Component, HostBinding} from '@angular/core';
import {BlockData} from '../../../../../../projects/page-builder/src/lib/block-data.component';
import {Block, BlockOptions} from '../../../../../../projects/page-builder/src/lib/decorators/block.decorator';

/**
 * Set options for the block
 */
const BLOCK: BlockOptions = {
  label: 'Divider',
  icon: 'minimize',
  form: {
    schema: {
      properties: {
        id: {type: 'string'},
        box: {type: 'object'}
      }
    },
    definitions: {
      box: {
        component: {
          type: 'pb-mbp'
        }
      }
    }
  }
};

/**
 * Forward options to our Block decorator.
 * This makes them available in global state for the page builder to access.
 */
@Block(BLOCK)
@Component({
  selector: 'sc-divider',
  templateUrl: './divider.component.html',
  styleUrls: ['./divider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DividerComponent extends BlockData {}
