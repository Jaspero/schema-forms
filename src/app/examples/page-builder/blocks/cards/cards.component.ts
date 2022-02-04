import {ChangeDetectionStrategy, Component} from '@angular/core';
import {BlockData, BlockDataOptions} from '../../../../../../projects/page-builder/src/lib/block-data.component';
import {Block} from '../../../../../../projects/page-builder/src/lib/decorators/block.decorator';
import {COMMON_OPTIONS} from '../../common-options.const';

interface Data extends BlockDataOptions {
  slideTitle?: string;
  slides: Array<{
    title?: string;
    image?: string;
  }>;
}

@Block({
  label: 'Cards',
  icon: 'linear_scale',
  previewValue: {
    title: `<h2>THAT'S NOT ALL</h2>`,
    slideTitle: `<h3>WHAT'S HOT</h3>`,
    ...COMMON_OPTIONS.defaults
  },
  form: {
    segments: [
      {
        title: (index: number) => index === undefined ? 'Slide' : `Slide ${index + 1}`,
        array: '/slides',
        fields: ['/image', '/title'],
        nestedSegments: [{
          title: 'Nested Slides',
          array: '/nSlides',
          fields: [
            '/title'
          ]
        }]
      },
      {
        title: 'Appearance',
        icon: 'tune',
        fields: ['/slideTitle', '/longImage']
      },
      ...COMMON_OPTIONS.segment
    ],
    schema: {
      properties: {
        longImage: {type: 'boolean'},
        title: {type: 'string'},
        slideTitle: {type: 'string'},
        slides: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: {type: 'string'},
              image: {type: 'string'},
              nSlides: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: {type: 'string'}
                  }
                }
              }
            }
          }
        },
        ...COMMON_OPTIONS.properties
      }
    },
    definitions: {
      longImage: {label: 'Long Image'},
      'slides/title': {label: 'Title'},
      'slides/image': {
        label: 'Image',
        component: {
          type: 'image',
        }
      },
      'slides/nSlides/title': {label: 'Title'},
      ...COMMON_OPTIONS.definitions
    }
  }
})
@Component({
  selector: 'sc-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardsComponent extends BlockData<Data> {}
