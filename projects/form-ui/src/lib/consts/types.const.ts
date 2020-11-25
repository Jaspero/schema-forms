import {FormBuilderData} from '@jaspero/form-builder';

const options: FormBuilderData = {
  segments: [{
    title: 'Options',
    array: '/options',
    fields: [
      '/value',
      '/label'
    ]
  }],
  schema: {
    properties: {
      options: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            value: {type: 'string'},
            label: {type: 'string'}
          }
        }
      }
    }
  },
  definitions: {
    'options/value': {label: 'Value', columnsDesktop: 6},
    'options/label': {label: 'Label', columnsDesktop: 6}
  }
};

export const TYPES = [
  {
    value: 'text',
    label: 'Text'
  },
  {
    value: 'number',
    label: 'Number'
  },
  {
    value: 'email',
    label: 'Email'
  },
  {
    value: 'textarea',
    label: 'textarea'
  },
  {
    value: 'select',
    label: 'Select',
    added: options
  },
  {
    value: 'checkbox',
    label: 'Checkbox',
    added: options
  }
];
