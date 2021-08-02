import {Definitions, Segment} from '@jaspero/form-builder';
import {JSONSchema7} from 'json-schema';
import {STATE} from '../states.const';

export interface BlockOptions {
  /**
   * Defaults to component constructor name
   */
  id?: string;

  /**
   * Defaults to 'pages'
   */
  module?: string;

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


export function Block(options: BlockOptions): ClassDecorator {
  return (type: any) => {

    const {name} = type.prototype.constructor;
    const label = name.replace('Component', '').split(/(?=[A-Z])/);
    const module = options.module || 'pages';
    const id = options.id || label.join('-').toLowerCase();

    if (!STATE.blocks[module]) {
      STATE.blocks[module] = {};
    }

    if (!options.previewTemplate) {
      const [selector] = type.prototype.constructor.ɵcmp.selectors[0];
      options.previewTemplate = `<${selector} [data]="data"></${selector}>`;
    }

    STATE.blocks[module][id] = {
      ...options,
      label: options.label || label.join(' ')
    };
  }
}
