import {FormBuilderData} from '../../../../../projects/form-builder/src/lib/interfaces/form-builder-data.interface';

export const CONDITIONS_EXAMPLE: FormBuilderData = {
  segments: [
    {
      type: 'tabs',
      configuration: {
        tabs: [
          {
            title: 'Information',
            fields: [
              '/name',
              '/country',
              {
                field: '/city',
                deps: ['/country'],
                action: {
                  type: 'show',
                  eval: v => v.country
                }
              }
            ]
          }
        ]
      }
    },
    {
      fields: [
        '/country',
        {
          field: '/city',
          deps: ['/country'],
          action: {
            type: 'show',
            eval: v => v.country
          }
        }
      ]
    }
  ],
  schema: {
    properties: {
      name: {type: 'string'},
      country: {type: 'string'},
      city: {type: 'string'}
    }
  },
  definitions: {
    name: {label: 'Name'},
    country: {label: 'Country'},
    city: {label: 'City'}
  }
};
