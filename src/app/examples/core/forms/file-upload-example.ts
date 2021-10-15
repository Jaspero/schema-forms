import {FormBuilderData} from '../../../../../projects/form-builder/src/lib/interfaces/form-builder-data.interface';

export const FILE_UPLOAD_EXAMPLE: FormBuilderData = {
  schema: {
    properties: {
      image: {
        type: 'string'
      },
      file: {
        type: 'string'
      }
    }
  },
  definitions: {
    image: {
      component: {
        type: 'image',
        configuration: {
          // preventServerUpload: true,
          preventUrlUpload: true,
          uploadMethods: [
            {
              label: 'Storage',
              component: '<jms-e-storage></jms-e-storage>'
            }
          ]
        }
      }
    },
    file: {
      component: {
        type: 'file'
      }
    }
  }
};
