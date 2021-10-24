import {FormBuilderData} from '../../../../../projects/form-builder/src/lib/interfaces/form-builder-data.interface';

export const CONDITIONS_EXAMPLE: FormBuilderData = {
  segments: [{
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
  }],
  schema: {
    properties: {
      country: {type: 'string'},
      city: {type: 'string'}
    }
  },
  definitions: {
    country: {label: 'Country'},
    city: {label: 'City'}
  }
};
