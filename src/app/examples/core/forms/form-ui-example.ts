import {FormBuilderData} from '../../../../../projects/form-builder/src/lib/interfaces/form-builder-data.interface';

export const FORM_UI_EXAMPLE: FormBuilderData = {
  segments: [{
    type: 'empty',
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
