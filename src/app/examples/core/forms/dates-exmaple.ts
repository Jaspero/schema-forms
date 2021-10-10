import {FormBuilderData} from '../../../../../projects/form-builder/src/lib/interfaces/form-builder-data.interface';

export const DATES_EXAMPLE: FormBuilderData = {
  schema: {
    properties: {
      numDate: {type: 'number', default: 1620424620000},
      withTime: {type: 'number', default: 1620424620000},
      stringDate: {type: 'string', default: '20210308'}
    }
  },
  definitions: {
    numDate: {
      label: 'Number Format',
      component: {
        type: 'date',
        configuration: {
          format: 'number'
        }
      }
    },
    withTime: {
      label: 'With Time',
      component: {
        type: 'date',
        configuration: {
          format: 'number',
          includeTime: true
        }
      }
    },
    stringDate: {
      label: 'String Date',
      component: {
        type: 'date',
        configuration: {
          format: 'yyyyMMdd',
          stringToDate: `value => new Date(parseInt(value.slice(0, 4), 10), parseInt(value.slice(4, 6), 10) - 1, parseInt(value.slice(6, 8), 10))`
        }
      }
    }
  },
  segments: [{
    fields: [
      '/numDate',
      '/withTime',
      '/stringDate'
    ]
  }]
};
