export const SCHEMA = {
  segments: [{
    type: 'empty',
    fields: [
      '/blocks'
    ]
  }],
  schema: {
    properties: {
      blocks: {
        type: 'array'
      }
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
              id: 'banner',
              label: 'Banner',
              previewTemplate: `<sc-simple [data]='data'></sc-simple>`,
              previewValue: {
                singleLine: '<p class="this-is-here">Single Line Example. This is <b>bold</b>, <u>underlined</u> and <i>italic</i>. <b>This is bold with a <u>underlined</u> part.</b></p>',
                image: 'http://placeimg.com/640/360/any'
              },
              form: {
                segments: [
                  {
                    title: 'title',
                    fields: ['/title']
                  },
                  {
                    title: 'image',
                    fields: ['/image']
                  }
                ],
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
              maxInstances: 3,
              previewTemplate: `<sc-cards [data]='data'></sc-cards>`,
              previewValue: {
                title: `<h3>Title</h3>`,
                cards: [
                  {
                    title: '<h1>Example 1</h1>',
                    image: 'http://placeimg.com/200/200/any',
                    link: '1'
                  },
                  {
                    title: '<h1>Example 2</h1>',
                    image: 'http://placeimg.com/200/200/any',
                    link: '2'
                  }]
              },
              form: {
                segments: [
                  {
                    title: 'Title',
                    fields: ['/title']
                  },
                  {
                    title: 'Cards',
                    array: '/cards',
                    fields: [
                      '/link'
                    ]
                  }
                ],
                schema: {
                  properties: {
                    title: {
                      type: 'string'
                    },
                    cards: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          title: {
                            type: 'string',
                            default: '<h1>Example 1</h1>'
                          },
                          image: {
                            type: 'string',
                            default: 'http://placeimg.com/200/200/any'
                          },
                          link: {type: 'string'}
                        }
                      }
                    }
                  }
                },
                definitions: {}
              }
            }
          ]
        }
      }
    }
  }
};
