import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'sc-page-builder',
  templateUrl: './page-builder.component.html',
  styleUrls: ['./page-builder.component.scss']
})
export class PageBuilderComponent implements OnInit {

  constructor() { }

  pageBuilderExample = {
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
            styles: `
              h1 {
                color: green;
              }
            `,
            styleUrls: 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css',
            blocks: [
              {
                id: 'banner',
                label: 'Banner',
                previewTemplate: `<sc-simple [data]='data'></sc-simple>`,
                previewValue: {
                  title: 'Some title',
                  subTitle: 'A total subtitle'
                },
                previewStyle: `
                  h1 {
                    color: green;
                  }
                  @media only screen and (max-width: 600px) {
                    h1 {
                      color: red;
                    }
                  }
                `,
                form: {
                  segments: [{
                    fields: [
                      '/title',
                      '/subTitle',
                      '/image',
                      '/imagePosition',
                      '/date'
                    ]
                  }],
                  schema: {
                    properties: {
                      title: {
                        type: 'string'
                      },
                      subTitle: {
                        type: 'string'
                      },
                      image: {
                        type: 'string'
                      },
                      imagePosition: {
                        type: 'string'
                      },
                      date: {
                        type: 'string'
                      }
                    }
                  },
                  definitions: {
                    title: {
                      label: 'Title'
                    },
                    image: {
                      label: 'Image',
                      component: {
                        type: 'image'
                      }
                    },
                    date: {
                      label: 'Date',
                      component: {
                        type: 'date',
                        configuration: {
                          format: 'number'
                        }
                      }
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

  ngOnInit() {
  }

}
