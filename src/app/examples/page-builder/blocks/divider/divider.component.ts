import {ChangeDetectionStrategy, Component, HostBinding} from '@angular/core';
import {Block, BlockData, BlockOptions, blockStyle} from '@jaspero/page-builder';

/**
 * Set options for the block
 */
const BLOCK: BlockOptions = {
  label: 'Divider',
  icon: 'minimize',
  compile: true,
  form: {
    segments: [{
      title: 'Settings',
      icon: 'settings',
      fields: [
        '/box',
        '/background'
      ]
    }],
    schema: {
      properties: {
        id: {type: 'string'},
        box: {type: 'object'},
        background: {type: 'string'},
        backgroundSize: {type: 'string'},
        backgroundRepeat: {type: 'boolean'},
        backgroundPosition: {type: 'string'}
      }
    },
    definitions: {
      box: {
        component: {
          type: 'pb-mbp',
          configuration: {
            presets: {
              margin: [
                {
                  name: 'Small',
                  sides: {
                    top: {size: 10, unit: 'px'},
                    right: {size: 10, unit: 'px'},
                    left: {size: 10, unit: 'px'},
                    bottom: {size: 10, unit: 'px'},
                  }
                },
                {
                  name: 'Medium',
                  sides: {
                    top: {size: 20, unit: 'px'},
                    right: {size: 20, unit: 'px'},
                    left: {size: 20, unit: 'px'},
                    bottom: {size: 20, unit: 'px'},
                  }
                },
                {
                  name: 'Large',
                  sides: {
                    top: {size: 30, unit: 'px'},
                    right: {size: 30, unit: 'px'},
                    left: {size: 30, unit: 'px'},
                    bottom: {size: 30, unit: 'px'},
                  }
                }
              ]
            }
          }
        }
      },
      background: {
        component: {
          type: 'pb-background'
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
export class DividerComponent extends BlockData {
  @HostBinding('style')
  get style() {
    return blockStyle(this.data);
  }
}
