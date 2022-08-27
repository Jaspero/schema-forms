import {FormBuilderData} from '../../../../../projects/form-builder/src/lib/interfaces/form-builder-data.interface';

export const REF_TABLE_EXAMPLE: FormBuilderData = {
  segments: [{fields: ['/classes']}],
  schema: {
    properties: {
      classes: {
        type: 'array'
      },
    }
  },
  definitions: {
    classes: {
      label: 'Classes',
      component: {
        type: 'ref',
        configuration: {
          collection: 'users',
          multiple: true,
          clearValue: '',
          display: {
            key: '/name',
            label: 'Ambassador'
          },
          table: {
            tableColumns: [
              {key: '/name', label: 'Name'},
              {key: '/email', label: 'Email'}
            ]
          }
        }
      }
    }
  }
};
