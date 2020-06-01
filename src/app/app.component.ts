import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormBuilderData, SegmentType} from 'form-builder';

@Component({
  selector: 'sc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  exampleOne: FormBuilderData = {
    schema: {
      properties: {
        createdOn: {
          type: 'number'
        },
        File: {
          type: 'string'
        },
        photos: {
          type: 'array'
        },
        title: {
          type: 'string'
        },
        description: {
          type: 'string'
        },
        address: {
          type: 'string'
        }
      }
    },
    definitions: {
      createdOn: {
        label: 'Datum',
        formatOnLoad: `(value) => value || Date.now()`,
        component: {
          type: 'input',
          configuration: {
            type: 'number'
          }
        }
      },
      File: {
        component: {
          configuration: {
            emptyLabel: '',
            preventClear: false,
            minSize: '10kb',
            maxSize: '50mb',
            forbiddenFileTypes: ['application/pdf']
          },
          type: 'file'
        },
        label: 'FILE'
      },
      photos: {
        component: {
          type: 'gallery',
          configuration: {
            allowServerUpload: true,
            allowUrl: true,
            minSize: '10kb',
            maxSize: '2mb',
            allowedImageTypes: ['jpg', 'jpeg', 'png']
          }
        },
        label: 'Photos'
      },
      title: {
        label: 'Title',
        disableForRoles: ['admin'],
        columnsDesktop: 8,
        columnsMobile: 12
      },
      description: {
        label: 'Description',
        component: {
          type: 'textarea'
        }
      },
      address: {
        component: {
          configuration: {
            dataSet: [
              {
                name: 'Croatia',
                value: 'hr'
              },
              {
                name: 'USA',
                value: 'us'
              }
            ]
          },
          type: 'select'
        },
        label: 'Address'
      }
    },
    segments: [
      {
        fields: [
          '/File',
          '/photos',
          '/title',
          '/description',
          '/address',
          '/createdOn'
        ]
      }]
  };

  exampleTwo: FormBuilderData = {
    schema: {
      properties: {
        title: {
          type: 'string'
        },
        description: {
          type: 'string'
        },
        content: {
          type: 'string'
        }
      }
    },
    definitions: {
      title: {
        label: 'Title'
      },
      description: {
        label: 'Description',
        component: {
          type: 'textarea'
        }
      },
      content: {
        label: 'Content',
        component: {
          type: 'wysiwyg'
        }
      }
    },
    segments: [{
      type: SegmentType.Empty,
      fields: [
        '/title',
        '/description',
        '/content'
      ]
    }]
  };

  updateComponent() {
    this.exampleTwo = {
      schema: {
        properties: {
          title: {
            type: 'string'
          }
        }
      },
      definitions: {
        title: {
          label: 'Title'
        }
      },
      segments: [{
        fields: [
          '/title'
        ]
      }]
    };
  }
}
