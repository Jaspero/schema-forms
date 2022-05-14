import {COMMON_OPTIONS} from './common-options.const';

export const SCHEMA = {
  segments: [
    {
      fields: ['/title']
    },
    {
      type: 'empty',
      fields: [
        '/blocks'
      ]
    }
  ],
  schema: {
    properties: {
      title: {type: 'string'},
      blocks: {type: 'array'}
    }
  },
  definitions: {
    blocks: {
      component: {
        type: 'pb-blocks',
        configuration: {
          intro: `<b>Example</b> this is.`,
          styleUrls: 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css',
          layout: {
            selector: '#main-content',
            content: `<header>Example Header</header><main id="main-content"></main>`
          },
          blocks: []
        }
      }
    }
  }
};
