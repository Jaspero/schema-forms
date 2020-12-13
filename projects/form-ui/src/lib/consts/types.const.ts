import {FormBuilderData, SegmentType} from '@jaspero/form-builder';

const settings: FormBuilderData = {
  segments: [{
    type: SegmentType.Empty,
    fields: [
      '/id',
      '/label',
      '/hint',
      '/placeholder'
    ]
  }],
  definitions: {
    id: {label: 'FU.ID'},
    label: {label: 'FU.LABEL'},
    hint: {label: 'FU.HINT'},
    placeholder: {label: 'FU.PLACEHOLDER'}
  },
  schema: {
    properties: {
      id: {type: 'string'},
      label: {type: 'string'},
      hint: {type: 'string'},
      placeholder: {type: 'string'},
    },
    required: [
      '/id'
    ]
  }
};

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
  },
  value: {
    options: [
      {}
    ]
  }
};

export const TYPES = [
  {
    value: 'text',
    label: 'Text',
    settings,
    default: {
      label: 'Text',
    },
    required: true
  },
  {
    value: 'number',
    label: 'Number',
    settings,
    default: {
      label: 'Number',
    },
    required: true
  },
  {
    value: 'email',
    label: 'Email',
    settings,
    default: {
      label: 'Email',
    },
    required: true
  },
  {
    value: 'date',
    label: 'Date',
    settings,
    default: {
      label: 'Date'
    },
    required: true
  },
  {
    value: 'textarea',
    label: 'textarea',
    settings,
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
    },
    required: true
  },
  {
    value: 'select',
    label: 'Select',
    settings,
    added: options,
    default: {
      label: 'Select',
      placeholder: 'Nothing selected',
      added: {
        options: [
          {value: 'one', label: 'Option One'},
          {value: 'two', label: 'Option Two'},
        ]
      }
    },
    required: true
  },
  {
    value: 'checkbox',
    label: 'Checkbox',
    settings,
    added: options,
    default: {
      label: 'Checkbox',
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
    value: 'content',
    label: 'Content',
    settings: {
      segments: [{
        type: SegmentType.Empty,
        fields: ['/value']
      }],
      definitions: {
        value: {
          component: {
            type: 'tinymce'
          }
        }
      },
      schema: {
        properties: {
          value: {type: 'string'}
        }
      }
    }
  }
];
