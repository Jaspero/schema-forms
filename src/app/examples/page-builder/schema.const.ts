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
          saveCompiled: true,
          intro: `<b>Example</b> this is.`,
          styleUrls: [
            '/skins/ui/oxide/skin.min.css',
            '/skins/ui/oxide/content.inline.min.css'
          ],
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
