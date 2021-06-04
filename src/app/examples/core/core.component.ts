import {AfterViewInit, ChangeDetectionStrategy, Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {FormBuilderComponent, FormBuilderData, SegmentType} from '@jaspero/form-builder';

@Component({
  selector: 'sc-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoreComponent implements OnInit, AfterViewInit {
  constructor() { }

  @ViewChildren(FormBuilderComponent)
  formComponents: QueryList<FormBuilderComponent>;

  exampleOne: FormBuilderData = {
    schema: {
      properties: {
        items2: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string'
              },
              title: {
                type: 'string'
              }
            }
          }
        },

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
        description: {
          type: 'string'
        },
        address: {
          type: 'string'
        },
        module: {
          type: 'string'
        },
        showModule: {
          type: 'boolean'
        },
        endDate: {type: 'number'},
        startDate: {type: 'number'}
      }
    },
    definitions: {
      'items2/type': {
        label: 'type',
        component: {
          type: 'select',
          configuration: {
            dataSet: [
              {
                name: 'Title',
                value: 'title'
              },
              {
                name: 'Space',
                value: 'space'
              },
              {
                name: 'asd',
                value: 'asd'
              }
            ]
          }
        }
      },
      'items2/title': {
        label: 'Title',
        component: {
          type: 'tinymce'
        }
      },
      module: {
        component: {
          type: 'autocomplete',
          configuration: {
            populate: {
              collection: 'modules',
              limit: 2
            }
          }
        }
      },
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
        label: 'FILE',
        roles: 'user'
      },
      endDate: {
        label: 'DISCOUNTS.END_DATE',
        // formatOnLoad: '(value) => value || Date.now()',
        component: {
          type: 'date',
          configuration: {
            includeTime: true,
            labelHours: 'GENERAL.HOURS',
            labelMinutes: 'GENERAL.MINUTES',
            format: 'number'
          }
        }
      },
      startDate: {
        label: 'DISCOUNTS.start',
        // formatOnLoad: '(value) => value || Date.now()',
        component: {
          type: 'date',
          configuration: {
            includeTime: false,
            labelHours: 'GENERAL.HOURS',
            labelMinutes: 'GENERAL.MINUTES',
            format: 'number'
          }
        }
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
        components: [{
          selector: 'example'
        }]
      },
      {
        array: '/items2',
        fields: [
          '/type',
          {
            field: '/title',
            deps: ['/items2/type'],
            action: [
              {
                type: 'show',
                function: `(row, i) => { return row.items2[i].type === 'title'}`
              },
            ]
          }
        ],
        title: 'Items'
      },
      {
        fields: [
          // '/between',
          // '/createdOn',
          // '/File',
          // '/photos',
          // '/description',
          // '/address',
          '/endDate',
          '/startDate',
          '/showModule',
          {
            field: '/module',
            deps: ['/showModule'],
            action: [
              {
                type: 'show',
                function: `(row) => row.showModule`
              },
              {
                type: 'set-to',
                configuration: {
                  value: 'Placeholder Module'
                },
                function: `(row) => !row.module`
              }
            ]
          },
          {
            field: '/module',
            deps: ['/showModule'],
            action: [
              {
                type: 'show',
                function: `(row) => row.showModule`
              },
              {
                type: 'set-to',
                configuration: {
                  value: 'Placeholder Module'
                },
                function: `(row) => !row.module`
              }
            ]
          }
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

  datesExample: FormBuilderData = {
    schema: {
      properties: {
        numDate: {type: 'number', default: 1620424620000},
        withTime: {type: 'number', default: 1620424620000},
        stringDate: {type: 'string', default: '20210308'}
      }
    },
    definitions: {
      numDate: {
        label: 'Number Format',
        component: {
          type: 'date',
          configuration: {
            format: 'number'
          }
        }
      },
      withTime: {
        label: 'With Time',
        component: {
          type: 'date',
          configuration: {
            format: 'number',
            includeTime: true
          }
        }
      },
      stringDate: {
        label: 'String Date',
        component: {
          type: 'date',
          configuration: {
            format: 'yyyyMMdd',
            stringToDate: `value => new Date(parseInt(value.slice(0, 4), 10), parseInt(value.slice(4, 6), 10) - 1, parseInt(value.slice(6, 8), 10))`
          }
        }
      }
    },
    segments: [{
      fields: [
        '/numDate',
        '/withTime',
        '/stringDate'
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
        },
        list: {type: 'array'}
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
          type: 'tinymce'
        }
      },
      list: {
        label: 'List',
        component: {
          type: 'draggable',
          configuration: {
            toggle: true,
            options: [
              {
                name: 'test 1',
                value: 1,
                disabled: true
              },
              {
                name: 'test 2',
                value: 2
              },
              {
                name: 'test 3',
                value: 3
              },
              {
                name: 'test 4',
                value: 4
              }
            ]
          }
        }
      }
    },
    segments: [
      {
        type: SegmentType.Empty,
        fields: [
          '/list'
        ]
      },
      {
        type: SegmentType.Empty,
        fields: [
          '/title',
          '/description',
          '/content'
        ]
      }
    ]
  };

  arrayExamples = {
    value: {
      addresses: [{city: 'osijek'}],
      nAddresses: [
        {
          city: 'Example One',
          nnAddresses: [
            {address: 'Example One Nested One', some: 'Example One Nested One'},
            {address: 'Example One Nested Two', some: 'Example One Nested Two'}
          ]
        },
        {
          city: 'Example Two',
          nnAddresses: [
            {address: 'Example Two Nested One', some: 'Example Two Nested One'},
            {address: 'Example Two Nested Two', some: 'Example Two Nested Two'}
          ]
        },
        {
          city: 'Example Three',
          nnAddresses: [
            {address: 'Example Three Nested One', some: 'Example Three Nested One'},
            {address: 'Example Three Nested Two', some: 'Example Three Nested Two'}
          ]
        },
      ]
    },
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
        chips: {type: 'array'},
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
                    address: {type: 'string'},
                    some: {type: 'string'}
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
        title: 'Nested Arrays',
        array: '/nAddresses',
        fields: [
          '/city'
        ],
        nestedSegments: [{
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
      }
    }
  };

  formUiExample: FormBuilderData = {
    segments: [{
      type: SegmentType.Empty,
      fields: ['/fields']
    }],
    schema: {
      properties: {
        fields: {type: 'array'}
      }
    },
    definitions: {
      fields: {
        component: {
          type: 'fu-fields'
        }
      }
    }
  };

  refTableExample: FormBuilderData = {
    segments: [{fields: ['/content']}],
    schema: {
      properties: {
        id: {type: 'string', default: 'example-user'},
        code: {
          type: 'string'
        },
        name: {type: 'string'},
        classes: {
          type: 'array'
        },
      }
    },
    definitions: {
      code: {
        label: 'Code',
        component: {
          type: 'monaco',
          configuration: {
            language: 'javascript',
            theme: 'vs-dark'
          }
        }
      },
      name: {label: 'Name'},
      classes: {
        label: 'Classes',
        component: {
          type: 'ref-table',
          configuration: {
            addLabel: 'Add Class',
            collection: 'classes',
            schema: {
              properties: {
                id: {type: 'string'},
                name: {type: 'string'},
                grade: {type: 'number'}
              },
            },
            definitions: {
              id: {
                formatOnLoad: `value => value || Math.random().toString()`,
                label: 'ID',
                columnsDesktop: 1
              },
              name: {label: 'Name', columnsDesktop: 1},
              grade: {label: 'Grade', columnsDesktop: 1}
            },
            fields: ['/id', '/name', '/grade']
          }
        }
      }
    }
  };

  templateExample: FormBuilderData = {
    schema: {
      properties: {
        content: {type: 'string'}
      },
    },
    definitions: {
      content: {
        label: 'Content',
        component: {
          type: 'template-editor',
          configuration: {
            defaultTemplate: 'newsletter',
            templates: [
              {
                id: 'newsletter',
                layout: `<div class="main-content"></div>`,
                defaultSegments: ['intro'],
                style: `:focus{outline:2px dashed #e66439;outline-offset:4px}.body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";font-size:18px;font-weight:lighter;color:#09371f;background:#f3edd9}.footer-content,.header-content,.main-content{padding:3ch 2ch;max-width:52ch;margin:1ch auto}.main-content{background:#fff;border-radius:1ch;border:1px solid #cdd7d2}.footer-content>*{font-size:.875rem}.logo{display:block;margin:auto}section{border-left:4px solid #cdd7d2;padding:1px 0 1px 1em;margin:2em 0}hr{outline:0;border:none;border-top:1px dashed #cdd7d2;margin:2em 0}.button{display:block;margin:2ch 0;background:#e66439;color:#fff;font-size:.875rem;font-family:inherit;padding:1.5ch 2ch;border:none;border-radius:.5ch;cursor:pointer}.button:hover{outline:2px dashed #e66439;outline-offset:4px}.button:disabled{opacity:.5;pointer-events:none}h1,h2{font-family:"Iowan Old Style","Apple Garamond",Baskerville,"Times New Roman","Droid Serif",Times,"Source Serif Pro",serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";font-weight:inherit}h1{font-size:2rem;margin:.5em 0}h2{font-size:1.5rem;margin:.75em 0}h3{margin:.875em 0;font-size:1.125rem;font-weight:400}`,
                segments: [
                  {
                    id: 'intro',
                    name: 'Intro',
                    content: `<h1>Dear {{FirstName}},</h1>`
                  }
                ]
              }
            ]
          }
        }
      }
    }
  };

  fileUploadExample: FormBuilderData = {
    schema: {
      properties: {
        image: {
          type: 'string'
        },
        file: {
          type: 'string'
        }
      }
    },
    definitions: {
      image: {
        component: {
          type: 'image',
          configuration: {
            // preventServerUpload: true,
            preventUrlUpload: true,
            uploadMethods: [
              {
                label: 'Storage',
                component: '<jms-e-storage></jms-e-storage>'
              }
            ]
          }
        }
      },
      file: {
        component: {
          type: 'file'
        }
      }
    }
  };

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.formComponents.forEach(log => {
      log.form.valueChanges
        .subscribe(value => {
          console.log(value);
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

  save() {
    this.formComponents.toArray()[0].save('example', 'example-id').subscribe();
  }
}
