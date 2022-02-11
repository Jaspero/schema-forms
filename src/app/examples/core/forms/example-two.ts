import {FormBuilderData} from '../../../../../projects/form-builder/src/lib/interfaces/form-builder-data.interface';

export const EXAMPLE_TWO: FormBuilderData = {
  schema: {
    properties: {
      title: {
        type: 'string'
      },
      description: {
        type: 'string'
      },
      file: {
        type: 'string'
      },
      list: {type: 'array'}
    }
  },
  definitions: {
    description: {
      component: {
        type: 'textarea'
      }
    },
    file: {
      component: {
        type: 'file'
      }
    },
    list: {
      component: {
        type: 'draggable',
        configuration: {
          toggle: true,
          options: [
            {
              name: 'test 1',
              value: 1,
              disabled: true
            },
            {
              name: 'test 2',
              value: 2
            },
            {
              name: 'test 3',
              value: 3
            },
            {
              name: 'test 4',
              value: 4
            }
          ]
        }
      }
    }
  },
  segments: [
    {
      type: 'empty',
      fields: [
        '/list'
      ]
    },
    {
      type: 'empty',
      fields: [
        '/title',
        '/description',
        '/file'
      ]
    }
  ]
};
