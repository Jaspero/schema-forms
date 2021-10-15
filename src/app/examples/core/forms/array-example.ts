import {FormBuilderData} from '../../../../../projects/form-builder/src/lib/interfaces/form-builder-data.interface';

export const ARRAY_EXAMPLE: FormBuilderData = {
  value: {
    // addresses: [{city: 'osijek'}],
    nAddresses: [
      {
        city: 'Example One',
        nnAddresses: [
          {address: 'Example One Nested One', some: 'Example One Nested One'},
          {address: 'Example One Nested Two', some: 'Example One Nested Two'}
        ]
      },
      // {
      //   city: 'Example Two',
      //   nnAddresses: [
      //     {address: 'Example Two Nested One', some: 'Example Two Nested One'},
      //     {address: 'Example Two Nested Two', some: 'Example Two Nested Two'}
      //   ]
      // },
      // {
      //   city: 'Example Three',
      //   nnAddresses: [
      //     {address: 'Example Three Nested One', some: 'Example Three Nested One'},
      //     {address: 'Example Three Nested Two', some: 'Example Three Nested Two'}
      //   ]
      // },
    ]
  },
  schema: {
    properties: {
      addresses: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            city: {type: 'string'},
            address: {type: 'string'}
          }
        }
      },
      nAddresses: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            city: {type: 'string'},
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
      title: 'Addresses',
      array: '/addresses',
      fields: ['/city', '/address']
    },
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
  ]
};
