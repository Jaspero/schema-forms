import {FormBuilderData} from '../../../../../projects/form-builder/src/lib/interfaces/form-builder-data.interface';

export const REF_TABLE_EXAMPLE: FormBuilderData = {
  segments: [{fields: ['/content']}],
  schema: {
    properties: {
      id: {type: 'string', default: 'example-user'},
      code: {
        type: 'string'
      },
      name: {type: 'string'},
      classes: {
        type: 'array'
      },
    }
  },
  definitions: {
    code: {
      label: 'Code',
      component: {
        type: 'monaco',
        configuration: {
          language: 'javascript',
          theme: 'vs-dark'
        }
      }
    },
    name: {label: 'Name'},
    classes: {
      label: 'Classes',
      component: {
        type: 'ref-table',
        configuration: {
          addLabel: 'Add Class',
          collection: 'classes',
          schema: {
            properties: {
              id: {type: 'string'},
              name: {type: 'string'},
              grade: {type: 'number'}
            },
          },
          definitions: {
            id: {
              formatOnLoad: `value => value || Math.random().toString()`,
              label: 'ID',
              columnsDesktop: 1
            },
            name: {label: 'Name', columnsDesktop: 1},
            grade: {label: 'Grade', columnsDesktop: 1}
          },
          fields: ['/id', '/name', '/grade']
        }
      }
    }
  }
};
