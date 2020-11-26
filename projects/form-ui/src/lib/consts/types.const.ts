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
    'options/value': {label: 'FU.VALUE', columnsDesktop: 6},
    'options/label': {label: 'FU.LABEL', columnsDesktop: 6}
  }
};

export const TYPES = [
  {
    value: 'text',
    label: 'Text',
    default: {
      label: 'Text',
      hint: 'Help me',
      placeholder: 'Placeholder'
    }
  },
  {
    value: 'number',
    label: 'Number',
    default: {
      label: 'Number',
      hint: 'Help me',
      placeholder: 'Placeholder'
    }
  },
  {
    value: 'email',
    label: 'Email',
    default: {
      label: 'Email',
      hint: 'Give me an email',
      placeholder: 'Placeholder'
    }
  },
  {
    value: 'textarea',
    label: 'textarea',
    added: {
      value: {
        rows: 5
      },
      segments: [{
        fields: [
          '/rows'
        ]
      }],
      schema: {
        properties: {
          rows: {type: 'number'}
        }
      },
      definitions: {
        rows: {label: 'FU.ROWS'}
      }
    },
    default: {
      label: 'Textarea',
      hint: `I'm large`,
      placeholder: 'Type...'
    }
  },
  {
    value: 'select',
    label: 'Select',
    added: options,
    default: {
      label: 'Select',
      hint: 'Select an option',
      placeholder: 'Nothing selected',
      added: {
        options: [
          {value: 'one', label: 'Option One'},
          {value: 'two', label: 'Option Two'},
        ]
      }
    }
  },
  {
    value: 'checkbox',
    label: 'Checkbox',
    added: options,
    default: {
      label: 'Checkbox',
      hint: 'Select an option',
      placeholder: 'Nothing selected',
      added: {
        options: [
          {value: 'one', label: 'Option One'},
          {value: 'two', label: 'Option Two'},
        ]
      }
    }
  }
];
