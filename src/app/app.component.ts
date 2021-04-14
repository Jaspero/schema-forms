import {AfterViewInit, ChangeDetectionStrategy, Component, QueryList, ViewChildren} from '@angular/core';
import {FormBuilderComponent, FormBuilderData, SegmentType} from '@jaspero/form-builder';
import {startWith} from 'rxjs/operators';

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
      addresses: [
        {
          city: 'osijek'
        }
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
        fields: [
          '/addresses'
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

  templateEample: FormBuilderData = {
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

  ngAfterViewInit() {
    this.formComponents.forEach(log => {
      log.form.valueChanges
        .pipe(
          startWith(log.form.getRawValue())
        )
        .subscribe(value => {
          console.log('change', log.form.valid, value);
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
    // const valid = this.formComponents.toArray()[0].validate(this.exampleOne);
    // console.log({valid});
    this.formComponents.toArray()[0].save('example', 'example-id').subscribe();
  }
}
