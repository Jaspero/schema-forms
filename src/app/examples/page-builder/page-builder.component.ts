import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
  selector: 'sc-page-builder',
  templateUrl: './page-builder.component.html',
  styleUrls: ['./page-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
                previewTemplate: `<sc-simple [data]="data"></sc-simple>`,
                previewValue: {
                  content: `
                    <h1>A H1 Element</h1>
                    <h2>A H2 Element</h2>
                    <p>A P Element</p>
                  `
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
                  segments: [],
                  schema: {
                    properties: {
                      content: {type: 'string'},
                    }
                  },
                  definitions: {
                    content: {
                      label: 'Content'
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
