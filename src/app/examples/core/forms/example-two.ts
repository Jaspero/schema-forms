import {SegmentType} from '../../../../../projects/form-builder/src/lib/enums/segment-type.enum';
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
      content: {
        type: 'string'
      },
      list: {type: 'array'}
    }
  },
  definitions: {
    title: {
      label: 'Title'
    },
    description: {
      label: 'Description',
      component: {
        type: 'textarea'
      }
    },
    content: {
      label: 'Content',
      component: {
        type: 'tinymce'
      }
    },
    list: {
      label: 'List',
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
      type: SegmentType.Empty,
      fields: [
        '/list'
      ]
    },
    {
      type: SegmentType.Empty,
      fields: [
        '/title',
        '/description',
        '/content'
      ]
    }
  ]
};
