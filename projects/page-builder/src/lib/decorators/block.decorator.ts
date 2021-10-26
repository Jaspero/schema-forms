import {Definitions, Segment} from '@jaspero/form-builder';
import {JSONSchema7} from 'json-schema';
import {STATE} from '../state.const';

export interface BlockOptions {
  /**
   * Defaults to component constructor name
   */
  id?: string;

  /**
   * Defaults to 'pages'
   */
  module?: string | string[];

  /**
   * Defaults to component name
   */
  label?: string;
  icon?: string;

  /**
   * Defaults to <selector [data]="data"></selector>
   */
  previewTemplate?: string;
  previewValue?: any;
  form: {
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

    const {name} = type.prototype.constructor;
    const label = name.replace('Component', '').split(/(?=[A-Z])/);
    const module = options.module || 'pages';
    const id = options.id || label.join('-').toLowerCase();

    if (!options.previewTemplate) {
      const [selector] = type.prototype.constructor.ɵcmp.selectors[0];
      options.previewTemplate = `<${selector} [data]="data"></${selector}>`;
    }

    function assignBlock(m: string) {
      if (!STATE.blocks[m]) {
        STATE.blocks[m] = {};
      }

      STATE.blocks[m][id] = {
        ...options,
        component: type,
        label: options.label || label.join(' ')
      };
    }

    console.log(module, STATE)

    if (Array.isArray(module)) {
      module.forEach(m => assignBlock(m));
    } else {
      assignBlock(module);
    }
  }
}
