import {AfterViewInit, ChangeDetectionStrategy, Component, QueryList, ViewChildren} from '@angular/core';
import {FormBuilderComponent, FormBuilderData, SegmentType} from 'form-builder';

@Component({
  selector: 'sc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements AfterViewInit {

  @ViewChildren(FormBuilderComponent)
  formComponents: QueryList<FormBuilderComponent>;

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
        // age: {
        //   type: 'array',
        //   items: {
        //     type: 'object',
        //     properties: {
        //       name: {
        //         type: 'string'
        //       },
        //       age: {
        //         type: 'number'
        //       }
        //     }
        //   }
        // }
      }
    },
    definitions: {
      createdOn: {
        formatOnLoad: `(value) => value || Date.now()`,
        component: {
          type: 'date',
          configuration: {
            includeTime: true,
            labels: {
              date: 'Datum',
              hours: 'Sati',
              minutes: 'Minute'
            }
          }
        },
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
        label: 'FILE',
        roles: 'user'
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
          type: 'wysiwyg'
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
          '/createdOn',
          '/File',
          '/photos',
          '/title',
          '/description',
          '/address'
        ]
      }
      // {
      //   title: 'Card Array Segment',
      //   array: '/age',
      //   fields: [
      //     '/age',
      //     '/name'
      //   ]
      // },
      // {
      //   title: 'Empty Array Segment',
      //   type: SegmentType.Empty,
      //   array: '/age',
      //   fields: [
      //     '/age',
      //     '/name'
      //   ]
      // }
    ]
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

  arrayExamples = {
    schema: {
      properties: {
        zips: {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        ages: {
          type: 'array',
          items: {
            type: 'number'
          }
        },
        chips: {
          type: 'array'
        },
        addresses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              city: {
                type: 'string'
              },
              address: {
                type: 'string'
              }
            }
          }
        }
      }
    },
    segments: [
      {
        title: 'Strings',
        array: '/zips'
      },
      {
        title: 'Numbers',
        array: '/ages'
      },
      {
        title: 'As chips',
        fields: [
          '/chips'
        ]
      },
      {
        title: 'Objects',
        array: '/addresses',
        fields: [
          '/city',
          '/address'
        ]
      }
    ],
    definitions: {
      zips: {
        label: 'Zip',
        component: {
          type: 'input'
        }
      },
      ages: {
        label: 'Age',
        component: {
          type: 'input',
          configuration: {
            type: 'number'
          }
        }
      },
      'addresses/city': {
        label: 'City'
      }
    }
  };

  ngAfterViewInit() {
    this.formComponents.forEach(log => {
      log.form.valueChanges.subscribe(value => {
        console.log('change', value);
      });
    });
  }

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
