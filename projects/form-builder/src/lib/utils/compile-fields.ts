import {safeEval} from '@jaspero/utils';
import {CompiledField, FieldCondition} from '../interfaces/compiled-field.interface';
import {Definitions} from '../interfaces/definitions.interface';
import {Parser, Pointers} from './parser';

export function compileFields(config: {
  parser: Parser;
  definitions: Definitions;
  fields: (string | any | FieldCondition)[];
  pointers?: Pointers;
  mutateKey?: (key: string) => string;
  formId?: string;
  parentForm?: {
    id: string;
    pointer: string;
  };
}) {

  const {
    parser,
    definitions,
    fields,
    pointers = null,
    mutateKey = (key: string) => key,
    formId,
    parentForm
  } = config;

  return (fields || [])
    .reduce((acc: CompiledField[], keyObject: string | object) => {
      let condition: any;
      let key = keyObject as string;

      if (keyObject?.constructor === Object) {

        const {field, action, deps} = keyObject as any;

        condition = {field};

        switch (action?.constructor) {
          case Object:
            condition.action = [action];
            break;
          case Array:
            condition.action = action;
            break;
          default:
            condition.action = [{}];
            break;
        }

        condition.action.forEach((item) => {
          item.type = item.type || 'show';
          item.eval = safeEval(item.eval) || null;
        });
        condition.deps = deps || [];

        key = mutateKey(field);
      } else {
        key = mutateKey(key);
      }

      const definition = parser.getFromDefinitions(key, definitions);

      if (
        !definition ||
        !definition.roles ||
        (
          typeof definition.roles === 'string' ?
            definition.roles === parser.role :
            definition.roles.includes(parser.role)
        )
      ) {
        acc.push(
          parser.field({
            pointerKey: key,
            pointer: (pointers || parser.pointers)[key],
            definitions,
            single: true,
            condition,
            formId,
            parentForm
          })
        );
      }

      return acc;
    }, []);
}
