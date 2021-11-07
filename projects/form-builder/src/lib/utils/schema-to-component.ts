import {SchemaType} from '../enums/schema-type.enum';

/**
 * TODO:
 * We need a better approach for defaults.
 * With the fields being delivered as a separate
 * module there is no guaranty that an "input"
 * field will exist
 */
export function schemaToComponent(schemaType: SchemaType) {
  switch (schemaType) {
    case SchemaType.String:
      return {
        type: 'input',
        configuration: {
          type: 'text'
        }
      };

    case SchemaType.Number:
    case SchemaType.Integer:
      return {
        type: 'input',
        configuration: {
          type: 'number'
        }
      };

    case SchemaType.Boolean:
      return {
        type: 'checkbox'
      };

    case SchemaType.Array:
      return {
        type: 'chips'
      };
  }
}
