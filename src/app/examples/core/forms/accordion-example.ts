import {FormBuilderData} from '../../../../../projects/form-builder/src/lib/interfaces/form-builder-data.interface';

export const ACCORDION_EXAMPLE: FormBuilderData = {
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
      type: 'accordion',
      configuration: [
        {
          expanded: true,
          title: 'General',
          fields: [
            '/name',
            '/description'
          ]
        },
        {
          title: 'Addresses',
          description: 'This is an array',
          array: '/addresses',
          fields: ['/city', '/address'],
          arrayConfiguration: {
            sort: false
          }
        }
      ]
    }
  ]
};
