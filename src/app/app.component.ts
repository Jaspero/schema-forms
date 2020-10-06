import {AfterViewInit, ChangeDetectionStrategy, Component, QueryList, ViewChildren} from '@angular/core';
import {FormBuilderComponent, FormBuilderData, SegmentType} from '@jaspero/form-builder';

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
        between: {
          type: 'object'
        },
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
      between: {
        component: {
          type: 'range',
          configuration: {
            min: 1595725862491,
            max: 1595785862491
          }
        }
      },
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
          type: 'tinymce'
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
          '/between',
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
        },
        nAddresses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              city: {
                type: 'string'
              },
              nnAddresses: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    address: {
                      type: 'string'
                    },
                    some: {
                      type: 'string'
                    }
                  }
                }
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
      },
      {
        title: 'Nested Arrays',
        array: '/nAddresses',
        fields: [
          '/city'
        ],
        nestedSegments: [{
          type: 'empty',
          title: 'Addresses',
          array: '/nnAddresses',
          fields: [
            '/address',
            '/some'
          ]
        }]
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
            styles: `
              h3 {
                color: green;
              }
            `,
            blocks: [
              {
                id: 'banner',
                label: 'Banner',
                previewTemplate: `<h1>{{data.title}}</h1><p>{{data.subTitle}}</p><h3>some sub title</h3>`,
                previewValue: {
                  title: 'Some title',
                  subTitle: 'A total subtitle'
                },
                previewStyle: `
                  h1 {
                    color: blue;
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
                      '/imagePosition'
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
                      imagePosition: {
                        type: 'string'
                      }
                    }
                  },
                  definitions: {
                    title: {
                      label: 'Title'
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
              },
            ]
          }
        }
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
