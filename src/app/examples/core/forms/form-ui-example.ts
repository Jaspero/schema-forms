import {SegmentType} from '../../../../../projects/form-builder/src/lib/enums/segment-type.enum';
import {FormBuilderData} from '../../../../../projects/form-builder/src/lib/interfaces/form-builder-data.interface';

export const FORM_UI_EXAMPLE: FormBuilderData = {
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
