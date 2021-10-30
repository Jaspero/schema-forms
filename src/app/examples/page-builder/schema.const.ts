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
          blocks: [
            {
              id: 'divide',
              label: 'Divider',
              icon: 'minimize',
              previewTemplate: `<sc-divider></sc-divider>`,
              form: {
                schema: {
                  properties: {
                    id: {type: 'string'}
                  }
                },
                definitions: {}
              }
            },
            {
              id: 'banner',
              label: 'Banner',
              icon: 'image',
              previewTemplate: `<sc-simple [data]='data'></sc-simple>`,
              previewValue: {
                singleLine: '<p class="this-is-here">Single Line Example. This is <b>bold</b>, <u>underlined</u> and <i>italic</i>. <b>This is bold with a <u>underlined</u> part.</b></p>',
                image: 'http://placeimg.com/640/360/any'
              },
              form: {
                segments: [],
                schema: {
                  properties: {
                    title: {type: 'string'},
                    singleLine: {type: 'string'},
                    image: {type: 'string'}
                  }
                }
              }
            },
            {
              id: 'cards',
              label: 'Cards',
              icon: 'linear_scale',
              previewTemplate: `<sc-cards [data]='data'></sc-cards>`,
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
                    fields: ['/image', '/title']
                  },
                  {
                    title: 'Appearance',
                    icon: 'tune',
                    fields: ['/longImage']
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
                          image: {type: 'string'}
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
                  ...COMMON_OPTIONS.definitions
                }
              }
            }
          ]
        }
      }
    }
  }
};
