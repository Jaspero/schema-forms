import {FormBuilderData} from '../../../../../projects/form-builder/src/lib/interfaces/form-builder-data.interface';

export const SAVE_METHOD_EXAMPLE: FormBuilderData = {
  schema: {
    properties: {
      file: {type: 'string'},
      image: {type: 'string'},
      gallery: {type: 'array'},
      tiny: {type: 'string'}
    }
  },
  definitions: {
    image: {
      component: {
        type: 'image'
      }
    },
    file: {
      component: {
        type: 'file'
      }
    },
    gallery: {
      component: {
        type: 'gallery'
      }
    },
    tiny: {
      component: {
        type: 'tinymce'
      }
    }
  },
  segments: [
    {
      type: 'empty',
      fields: [
        '/file',
        '/image',
        '/tiny',
        '/gallery'
      ]
    }
  ]
};
