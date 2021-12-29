import {ɵNG_COMP_DEF} from '@angular/core';
import {Definitions, Segment} from '@jaspero/form-builder';
import {JSONSchema7} from 'json-schema';
import {STATE} from '../state.const';

export interface BlockOptions {
  /**
   * Defaults to 'pages'
   */
  module?: string | string[];
  /**
   * Defaults to component name
   */
  label?: string;
  icon?: string;
  previewValue?: any;
  form?: {
    segments?: Segment[];
    schema: JSONSchema7;
    definitions?: Definitions;
  }
}

/**
 * TODO:
 * When in render mode only the "component property is needed
 */
export function Block(options: BlockOptions): ClassDecorator {
  return (type: any) => {

    console.log('decorator', type.constructor.prototype);

    const componentDef = type[ɵNG_COMP_DEF];

    if (componentDef === undefined) {
      throw new Error('Ivy is not enabled.');
    }

    const {name} = componentDef.type.name;
    const selector = componentDef.selectors[0][0];

    const label = name.replace('Component', '').split(/(?=[A-Z])/);
    const module = options.module || 'pages';

    if (!options.form) {
      options.form = {
        schema: {
          properties: {
            id: {type: 'string'}
          }
        },
        definitions: {}
      };
    }

    function assignBlock(m: string) {
      if (!STATE.blocks[m]) {
        STATE.blocks[m] = {};
      }

      STATE.blocks[m][selector] = {
        ...options,
        component: type,
        label: options.label || label.join(' ')
      };
    }

    if (Array.isArray(module)) {
      module.forEach(m => assignBlock(m));
    } else {
      assignBlock(module);
    }
  }
}
