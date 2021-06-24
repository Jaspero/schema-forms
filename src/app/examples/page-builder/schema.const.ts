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
              previewTemplate: `<sc-simple [data]="data"></sc-simple>`,
              previewValue: {
                singleLine: '<p>Single Line Example. This is <b>bold</b>, <u>underlined</u> and <i>italic</i>. <b>This is bold with a <u>underlined</u> part.</b></p>',
                image: 'http://placeimg.com/640/360/any'
              },
              form: {
                segments: [],
                schema: {
                  properties: {
                    singleLine: {type: 'string'},
                    image: {type: 'string'}
                  }
                }
              }
            },
            {
              id: 'space',
              label: 'Space',
              previewTemplate: `<hr>`,
              skipOpen: true,
              form: {
                segments: [],
                schema: {
                  properties: {}
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
