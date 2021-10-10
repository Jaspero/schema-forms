import {FormBuilderData} from '../../../../../projects/form-builder/src/lib/interfaces/form-builder-data.interface';

export const EXAMPLE_ONE: FormBuilderData = {
  schema: {
    properties: {
      items2: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: {type: 'string'},
            title: {type: 'string'}
          }
        }
      },
      between: {type: 'object'},
      createdOn: {type: 'number'},
      File: {type: 'string'},
      photos: {type: 'array'},
      description: {type: 'string'},
      address: {type: 'string'},
      module: {type: 'string'},
      showModule: {type: 'boolean'},
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
            {name: 'Title', value: 'title'},
            {name: 'Space', value: 'space'},
            {name: 'asd', value: 'asd'}
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
