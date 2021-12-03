import {FormBuilderData} from '../../../../../projects/form-builder/src/lib/interfaces/form-builder-data.interface';

export const TABS_EXAMPLE: FormBuilderData = {
  value: {
    addresses: [{
      city: 'Osijek',
      address: 'Townsingthon'
    }]
  },
  schema: {
    properties: {
      name: {type: 'string'},
      description: {type: 'string'},
      addresses: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            city: {type: 'string'},
            address: {type: 'string'}
          }
        }
      }
    }
  },
  definitions: {
    name: {label: 'Name'},
    description: {label: 'Description'}
  },
  segments: [
    {
      type: 'tabs',
      configuration: {
        tabs: [
          {
            title: 'General',
            fields: [
              '/name',
              '/description'
            ]
          },
          {
            title: 'Addresses',
            array: '/addresses',
            fields: ['/city', '/address'],
            arrayConfiguration: {
              sort: false
            }
          }
        ]
      }
    }
  ]
};
