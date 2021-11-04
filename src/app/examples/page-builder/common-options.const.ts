import {SegmentType} from '@jaspero/form-builder';

export const COMMON_OPTIONS: {
  properties: {
    [key: string]: {
      type: string
    }
  }
} & any = {
  properties: {
    size: {type: 'string'},
    marginTop: {type: 'string'},
    marginBottom: {type: 'string'},
    paddingTop: {type: 'string'},
    paddingBottom: {type: 'string'},
    contained: {type: 'boolean'},
    background: {type: 'string'},
    verticalAlignment: {type: 'string'},
    additionalStyle: {type: 'string'},
    backgroundRepeat: {type: 'boolean'},
    backgroundSize: {type: 'string'},
    backgroundPosition: {type: 'string'},
    customClass: {type: 'string'},
    elementId: {type: 'string'},
    slider: {type: 'number'},
    chips: {type: 'array'}
  },
  segment: [
    {
      title: 'Standard Options',
      type: SegmentType.Accordion,
      configuration: [
        {
          title: 'PB.FORM.BLOCKS.SHARED.STANDARD_OPTIONS',
          fields: [
            '/size',
            '/marginTop',
            '/marginBottom',
            '/paddingTop',
            '/paddingBottom',
            '/verticalAlignment',
            '/background',
            '/contained',
            '/slider',
            '/chips'
          ]
        },
        {
          title: 'PB.FORM.BLOCKS.SHARED.ADVANCED_OPTIONS',
          fields: [
            '/elementId',
            '/customClass',
            '/additionalStyle'
          ]
        },
      ]
    }
  ],
  definitions: {
    slider: {
      label: 'Slider',
      component: {
        type: 'slider',
        // configuration: {
        //   // thumbLabel: true,
        //   // tickInterval: 1,
        //   // starAt: 0,
        //   // endAt: 100
        // }
      }
    },
    chips: {
      label: 'Chips',
      component: {
        type: 'chips'
      }
    },
    size: {
      label: 'PB.FORM.BLOCKS.SHARED.SIZE',
      component: {
        type: 'select',
        configuration: {
          dataSet: [
            {name: 'PB.FORM.BLOCKS.SHARED.SIZE_UNSET', value: 'unset'},
            {name: 'PB.FORM.BLOCKS.SHARED.SIZE_EXTRA_SMALL', value: 'extra-small'},
            {name: 'PB.FORM.BLOCKS.SHARED.SIZE_SMALL', value: 'small'},
            {name: 'PB.FORM.BLOCKS.SHARED.SIZE_REGULAR', value: 'regular'},
            {name: 'PB.FORM.BLOCKS.SHARED.SIZE_LARGE', value: 'large'},
            {name: 'PB.FORM.BLOCKS.SHARED.SIZE_FULL_SCREEN', value: 'full-screen'},
          ]
        }
      }
    },
    marginTop: {
      label: 'Margin Top',
      component: {
        type: 'select',
        configuration: {
          dataSet: [
            {name: 'Unset', value: 'unset'},
            {name: 'None', value: 'none'},
            {name: 'Extra Small', value: 'extra-small'},
            {name: 'Small', value: 'small'},
            {name: 'Medium', value: 'medium'},
            {name: 'Large', value: 'large'},
            {name: 'Extra Large', value: 'extra-large'},
          ]
        }
      }
    },
    marginBottom: {
      label: 'Margin Bottom',
      component: {
        type: 'select',
        configuration: {
          dataSet: [
            {name: 'Unset', value: 'unset'},
            {name: 'None', value: 'none'},
            {name: 'Extra Small', value: 'extra-small'},
            {name: 'Small', value: 'small'},
            {name: 'Medium', value: 'medium'},
            {name: 'Large', value: 'large'},
            {name: 'Extra Large', value: 'extra-large'},
          ]
        }
      }
    },
    paddingTop: {
      label: 'Padding Top',
      component: {
        type: 'select',
        configuration: {
          dataSet: [
            {name: 'Unset', value: 'unset'},
            {name: 'None', value: 'none'},
            {name: 'Extra Small', value: 'extra-small'},
            {name: 'Small', value: 'small'},
            {name: 'Medium', value: 'medium'},
            {name: 'Large', value: 'large'},
            {name: 'Extra Large', value: 'extra-large'},
          ]
        }
      }
    },
    paddingBottom: {
      label: 'Padding Bottom',
      component: {
        type: 'select',
        configuration: {
          dataSet: [
            {name: 'Unset', value: 'unset'},
            {name: 'None', value: 'none'},
            {name: 'Extra Small', value: 'extra-small'},
            {name: 'Small', value: 'small'},
            {name: 'Medium', value: 'medium'},
            {name: 'Large', value: 'large'},
            {name: 'Extra Large', value: 'extra-large'},
          ]
        }
      }
    },
    contained: {
      label: 'PB.FORM.BLOCKS.SHARED.CONTAINED'
    },
    background: {
      label: 'PB.FORM.BLOCKS.SHARED.BACKGROUND',
      component: {
        type: 'image'
      }
    },
    verticalAlignment: {
      label: 'PB.FORM.BLOCKS.SHARED.VERTICAL_ALIGNMENT',
      component: {
        type: 'select',
        configuration: {
          dataSet: [
            {name: 'PB.FORM.BLOCKS.SHARED.VERTICAL_ALIGNMENT_CENTER', value: 'center'},
            {name: 'PB.FORM.BLOCKS.SHARED.VERTICAL_ALIGNMENT_TOP', value: 'top'},
            {name: 'PB.FORM.BLOCKS.SHARED.VERTICAL_ALIGNMENT_BOTTOM', value: 'bottom'},
          ]
        }
      }
    },
    customClass: {label: 'Custom Class'},
    additionalStyle: {
      label: 'PB.FORM.BLOCKS.SHARED.ADDITIONAL_STYLE'
    },
    elementId: {label: 'Element ID'}
  },
  defaults: {
    customClass: '',
    elementId: '',
    size: 'unset',
    marginTop: 'none',
    marginBottom: 'none',
    contained: true,
    backgroundRepeat: false,
    verticalAlignment: 'center',
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    background: '',
    paddingTop: 'none',
    paddingBottom: 'none',
    additionalStyle: ''
  }
};
