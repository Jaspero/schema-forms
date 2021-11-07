import {FormBuilderData} from '@jaspero/form-builder';

const settings: FormBuilderData = {
  segments: [{
    type: 'empty',
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
    'options/label': {
      label: '',
      columnsDesktop: 6,
      component: {
        type: 'tinymce',
        configuration: {
          toolbar: ['insert', 'styleselect', 'bold italic'].join('|'),
          menubar: 'none',
          height: 130
        }
      }
    }
  },
  value: {
    options: [
      {}
    ]
  }
};

const standardValidation: FormBuilderData = {
  segments: [{
    title: 'Validation',
    fields: [
      '/minlength',
      '/maxlength',
      '/pattern'
    ]
  }],
  schema: {
    properties: {
      minlength: {type: 'number'},
      maxlength: {type: 'number'},
      pattern: {type: 'string'},
    }
  },
  definitions: {
    minlength: {label: 'Minimum Length'},
    maxlength: {label: 'Maximum Length'},
    pattern: {label: 'Pattern'},
  }
};

export const TYPES = [
  {
    value: 'text',
    label: 'Text',
    settings,
    added: standardValidation,
    default: {
      label: 'Text',
    },
    required: true
  },
  {
    value: 'tel',
    label: 'Phone',
    settings,
    added: standardValidation,
    default: {
      label: 'Phone'
    },
    required: true
  },
  {
    value: 'number',
    label: 'Number',
    settings,
    added: {
      segments: [{
        title: 'Validation',
        fields: [
          '/min',
          '/max',
          '/step'
        ]
      }],
      schema: {
        properties: {
          min: {type: 'number'},
          max: {type: 'number'},
          step: {type: 'number'},
        }
      },
      definitions: {
        min: {label: 'Minimum'},
        max: {label: 'Maximum'},
        step: {label: 'Step Size'}
      }
    },
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
      segments: [
        {
          fields: [
            '/rows'
          ]
        },
        ...standardValidation.segments
      ],
      schema: {
        properties: {
          rows: {type: 'number'},
          ...standardValidation.schema.properties
        }
      },
      definitions: {
        rows: {label: 'FU.ROWS'},
        ...standardValidation.schema.definitions
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
    value: 'color',
    label: 'Color',
    settings,
    default: {
      label: 'Color'
    },
    required: true
  },
  {
    value: 'content',
    label: 'Content',
    settings: {
      segments: [{
        type: 'empty',
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
