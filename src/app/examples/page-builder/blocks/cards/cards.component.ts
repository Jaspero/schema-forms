import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Block, BlockData, BlockDataOptions} from '@jaspero/page-builder';
import {COMMON_OPTIONS} from '../../common-options.const';

interface Cards {
  title?: string;
  description?: string;
  image?: string;
  link?: string;
  imageAlt?: string;
}

interface Data extends BlockDataOptions {
  cards: Cards[];
}


@Block({
  label: 'Cards',
  icon: 'linear_scale',
  previewValue: {
    background: 'bg-p',
    cards: [
      {
        title: `<h2>THE BIOVIVA PLATFORM</h2>`,
        description: `<p style="text-align:center;">Our gene therapy development platform at <b>Rutgers University</b> assists in the development of new therapeutic designed to regenerate your cells and ward off the degeneration of aging itself.<br><br></p>`,
        image: '/assets/images/card-img.svg',
        link: 'LEARN MORE',
        linkHref: '/why-bioviva',
        imageAlt: '',
      },
      {
        title: `<h2>THE SCIENCE OF AGING</h2>`,
        description: `<p style="text-align:center;">Aging is the largest unmet medical need in the world. Right now 15% of Americans are 65 or older. That number is expected to balloon to over 20% by 2050. This is not economically sustainable.<br>Aging is the greatest humanitarian crisis of our time because the aging cell is the leading risk factor for serious pathology. BioViva is why we target that process to combat disease.&nbsp;<br>From Alzheimer's to cancer, Chronic Kidney Disease, Parkinson's, diabetes, sarcopenia (age-related muscle loss), arthritis, and more, aging is the root cause of the most serious health problems we're facing today. BioViva's mission is to attack aging with gene therapy.<br><br></p>`,
        image: '/assets/images/card-img-2.svg',
        link: 'LEARN MORE',
        linkHref: '/aging',
        imageAlt: ''
      }
    ],
    ...COMMON_OPTIONS.defaults
  },
  form: {
    segments: [
      {
        type: 'empty',
        title: 'Segment Options',
        icon: 'tune',
        fields: [
          '/background'
        ]
      },
      {
        title: (index: number) => index === undefined ? 'Card' : `Card ${index + 1}`,
        array: '/cards',
        fields: [
          '/image',
          '/link',
          '/linkHref',
          '/imageAlt',
        ]
      },
      ...COMMON_OPTIONS.segment
    ],
    schema: {
      properties: {
        cards: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              image: {type: 'string', default: '/assets/images/card-img.svg'},
              title: {type: 'string', default: '<h2>THE BIOVIVA PLATFORM</h2>'},
              description: {type: 'string', default: `<p style="text-align:center;">Our gene therapy development platform at <b>Rutgers University</b> assists in the development of new therapeutic designed to regenerate your cells and ward off the degeneration of aging itself.<br><br></p>`},
              link: {type: 'string', default: 'LEARN MORE'},
              linkHref: {type: 'string', default: '/aging'},
              imageAlt: {type: 'string', default: ''}
            }
          }
        },
        background: {type: 'string'},
        ...COMMON_OPTIONS.properties
      }
    },
    definitions: {
      ...COMMON_OPTIONS.definitions,
      'cards/image': {
        label: 'Image',
        component: {
          type: 'image',
        }
      },
      'cards/link': {label: 'Link name'},
      'cards/linkHref': {label: 'Link path to page with (/url)'},
      'cards/imageAlt': {label: 'Audio description about image'},
      background: {
        label: 'Background',
        component: {
          type: 'select',
          configuration: {
            dataSet: [
              {name: 'Primary', value: 'bg-p'},
              {name: 'Seconday', value: 'bg-s'},
              {name: 'Tertiary', value: 'bg-t'}
            ]
          }
        }
      },
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
