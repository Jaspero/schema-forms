import {moveItemInArray} from '@angular/cdk/drag-drop';
import {ComponentPortal} from '@angular/cdk/portal';
import {Injector} from '@angular/core';
import {UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {safeEval, toLabel} from '@jaspero/utils';
import {get, has} from 'json-pointer';
import {SchemaType} from '../enums/schema-type.enum';
import {State} from '../enums/state.enum';
import {FieldComponent} from '../field/field.component';
import {FormBuilderContextService} from '../form-builder-context.service';
import {COMPONENT_DATA} from '../injection-tokens/component-data.token';
import {CompiledField} from '../interfaces/compiled-field.interface';
import {Control} from '../interfaces/control.type';
import {Definitions} from '../interfaces/definitions.interface';
import {SchemaValidators} from '../validators/schema-validators.class';
import {CUSTOM_FIELDS, CustomFields} from './custom-fields';
import {schemaToComponent} from './schema-to-component';

export interface PropertyDefinition {
  type: SchemaType;
  description?: string;
  default?: any;
}

export interface StringPropertyDefinition extends PropertyDefinition {
  type: SchemaType.String;
  default?: string;

  pattern?: string;
  minLength?: number;
  maxLength?: number;
}

export interface NumberPropertyDefinition extends PropertyDefinition {
  type: SchemaType.Number | SchemaType.Integer;
  default?: number;

  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: boolean;
  exclusiveMaximum?: boolean;
  multipleOf?: number;
}

export interface BooleanPropertyDefinition extends PropertyDefinition {
  type: SchemaType.Boolean;
  default?: boolean;
}

export interface ArrayPropertyDefinition extends PropertyDefinition {
  type: SchemaType.Array;
  items?: any;
  contains?: any;
}

export interface Pointer {
  key: string;
  type: SchemaType;
  control: Control;
  validation: any;

  formatOnSave?: (item: any, dataSet?: any) => any;
  formatOnLoad?: (item: any) => any;
  formatOnCreate?: (item: any, dataSet?: any) => any;
  formatOnEdit?: (item: any, dataSet?: any) => any;

  /**
   * Arrays can have these properties
   */
  arrayType?: SchemaType;
  properties?: any;
  required?: string[];
  arrayPointers?: Pointers[];
}

export interface Pointers {
  [key: string]: Pointer;
}

// @dynamic
export class Parser {
  constructor(
    public schema: any,
    public injector: Injector,
    public state: State,
    public role: string,
    public definitions: Definitions = {},
    customFields?: CustomFields
  ) {

    if (customFields) {
      this.customFields = customFields;
      return;
    }

    let custom: CustomFields;
    let ctxFields: CustomFields;

    try {
      custom = this.injector.get(CUSTOM_FIELDS);
    } catch (e) { }

    try {
      const ctx = this.injector.get(FormBuilderContextService);
      ctxFields = ctx.fields || {};
    } catch (e) { }

    this.customFields = {
      ...custom || {},
      ...ctxFields || {}
    };
  }

  form: UntypedFormGroup;
  pointers: Pointers = {};
  customFields: CustomFields = {};
  parent: Parser;

  static standardizeKey(key: string) {
    if (key[0] === '/') {
      key = key.slice(1);
    }

    return key;
  }

  static standardizeKeyWithSlash(key: string) {
    if (key[0] !== '/') {
      key = '/' + key;
    }

    return key;
  }

  static stringControl(
    definition: StringPropertyDefinition,
    required: boolean
  ) {
    const controlValidation: any[] = [];
    const validation: any = {};

    if (required) {
      controlValidation.push(Validators.required);
      validation.required = true;
    }

    if (definition.maxLength) {
      controlValidation.push(Validators.maxLength(definition.maxLength));
      validation.maxLength = definition.maxLength;
    }

    if (definition.minLength) {
      controlValidation.push(Validators.minLength(definition.minLength));
      validation.minLength = definition.minLength;
    }

    if (definition.pattern) {
      controlValidation.push(Validators.pattern(definition.pattern));
      validation.patter = definition.pattern;
    }

    return {
      control: new UntypedFormControl(definition.default || '', controlValidation),
      validation
    };
  }

  static numberControl(
    definition: NumberPropertyDefinition,
    required: boolean
  ) {
    const validation: any = {};
    const controlValidation: any[] = [];

    if (required) {
      controlValidation.push(Validators.required);
      validation.required = true;
    }

    if (definition.minimum) {
      const minimum =
        definition.minimum + (definition.exclusiveMinimum ? 1 : 0);
      controlValidation.push(Validators.min(minimum));
      validation.minimum = minimum;
    }

    if (definition.maximum) {
      const maximum =
        definition.maximum - (definition.exclusiveMaximum ? 1 : 0);
      controlValidation.push(Validators.max(maximum));
      validation.maximum = maximum;
    }

    if (definition.multipleOf) {
      controlValidation.push(
        SchemaValidators.multipleOf(definition.multipleOf)
      );
      validation.multipleOf = definition.multipleOf;
    }

    return {
      control: new UntypedFormControl(definition.default || null, controlValidation),
      validation
    };
  }

  static booleanControl(
    definition: BooleanPropertyDefinition,
    required: boolean
  ) {
    const controlValidation: any[] = [];
    const validation: any = {};

    if (required) {
      controlValidation.push(Validators.required);
      validation.required = true;
    }

    return {
      control: new UntypedFormControl(definition.hasOwnProperty('default') ? definition.default : false, controlValidation),
      validation
    };
  }

  buildForm(
    value?: any,
    required: string[] | null = [],
    base = '/',
    addId = true
  ) {
    const properties = this.buildProperties(
      this.schema.properties || {},
      required || this.schema.required,
      base,
      addId,
      value
    );

    this.form = properties.form;
    this.pointers = properties.pointers;

    if (value) {
      this.form.patchValue(value);
    }

    return this.form;
  }

  buildProperties(
    properties: object,
    required: string[] = [],
    base = '/',
    addId = true,
    entryValue = null
  ) {
    const {form, pointers} = [
      ...Object.entries(properties),
      /**
       * Add the id field as a property so that
       * it can be added to the form if needed
       */
      ...(addId
        ? [
          [
            'id',
            {
              type: 'string'
            }
          ]
        ]
        : [])
    ].reduce(
      (group, [key, value]: [string, any]) => {
        const isRequired = required.includes(key);
        const pointerKey = base + key;
        const definition = this.getFromDefinitions(pointerKey) || {};

        let parsed: {
          control: any;
          validation: any;
          arrayType?: SchemaType;
          properties?: any;
          required?: string[];
        };

        switch (value.type) {
          case SchemaType.String:
            parsed = Parser.stringControl(value, isRequired);
            break;

          case SchemaType.Number:
          case SchemaType.Integer:
            parsed = Parser.numberControl(value, isRequired);
            break;

          case SchemaType.Boolean:
            parsed = Parser.booleanControl(value, isRequired);
            break;

          case SchemaType.Object:
            if (value.properties && Object.keys(value.properties).length) {
              const objectProperties = this.buildProperties(
                value.properties,
                value.required,
                pointerKey + '/',
                false
              );

              for (const added in objectProperties.pointers) {
                if (objectProperties.pointers.hasOwnProperty(added)) {
                  // @ts-ignore
                  group.pointers[added] = objectProperties.pointers[added];
                }
              }

              parsed = {
                control: objectProperties.form,
                validation: {}
              };
            }

            /**
             * When properties aren't defined we create a
             * FormControl instead of a FormGroup
             */
            else {
              parsed = Parser.stringControl(value, isRequired);
            }
            break;

          case SchemaType.Array:
            parsed = this.buildArray(base, value);
            break;
        }

        // @ts-ignore
        group.form[key] = parsed.control;
        // @ts-ignore
        group.pointers[pointerKey] = {
          key,
          type: value.type,
          ...definition.formatOnLoad
          && {formatOnLoad: safeEval(definition.formatOnLoad)},
          ...definition.formatOnSave
          && {formatOnSave: safeEval(definition.formatOnSave)},
          ...definition.formatOnCreate
          && {formatOnCreate: safeEval(definition.formatOnCreate)},
          ...definition.formatOnEdit
          && {formatOnEdit: safeEval(definition.formatOnEdit)},
          // @ts-ignore
          ...parsed
        };

        /**
         * Creat all FormArray controls
         */
        if (value.type === SchemaType.Array) {
          this.populateArray(
            pointerKey,
            entryValue,
            group.pointers
          );
        }

        return group;
      },
      {
        form: {},
        pointers: {}
      }
    );

    return {
      pointers,
      form: new UntypedFormGroup(form)
    };
  }

  /**
   * @param pointerKey Lookup key for the pointer
   * @param pointer Entire pointer object that should be used
   * @param definitions Entire definitions object that should be used
   * @param single Defines if the field shown in the form or in the table
   * @param condition Evaluate function which validates provided action ('show' | 'hide')
   */
  field(config: {
    pointerKey: string,
    pointer: Pointer,
    definitions: Definitions,
    single: boolean,
    condition?: any,
    formId?: string;
    parentForm?: {
      id: string;
      pointer: string;
    };
  }): CompiledField {
    const {
      pointerKey,
      pointer,
      definitions = {},
      single = true,
      condition,
      formId,
      parentForm
    } = config;

    if (!pointer) {
      throw new Error(`Couldn't find pointer for ${pointerKey}.`);
    }

    const {key, type, control, validation} = pointer;
    const definition = {
      ...this.getFromDefinitions(pointerKey, definitions)
    };

    if (definition.label === undefined) {
      definition.label = toLabel(key);
    }

    if (
      (
        definition.disableOn &&
        (
          Array.isArray(definition.disableOn) ?
            definition.disableOn.includes(this.state)
            : definition.disableOn === this.state
        )
      ) ||
      (
        definition.disableForRoles &&
        (
          Array.isArray(definition.disableForRoles) ?
            definition.disableForRoles.includes(this.role)
            : definition.disableForRoles === this.role
        )
      )
    ) {
      control.disable();
    }

    /**
     * We don't show labels in the table
     */
    if (!single) {
      definition.label = '';
    }

    if (!definition.component) {
      definition.component = schemaToComponent(type);
    }

    // @ts-ignore
    const component = this.customFields[definition.component.type];

    if (!component) {
      // @ts-ignore
      throw new Error(`Couldn't find a component defined for type: ${definition.component.type}`);
    }

    const configuration = safeEval(definition.component.configuration || {});
    const safeConfiguration = typeof configuration === 'function' ? configuration() : configuration;

    const portal = new ComponentPortal<FieldComponent<any>>(
      component,
      null,
      Injector.create({
        providers: [{
          provide: COMPONENT_DATA, useValue: {
            control,
            validation,
            single,
            pointers: this.pointers,
            form: this.form,
            formId,
            parentForm,
            pointer: pointerKey,
            ...definition,
            ...safeConfiguration
          }
        }],
        parent: this.injector
      })
    );

    return {
      pointer: pointerKey,
      control,
      portal,
      validation,
      placeholder: definition.placeholder || '',
      label: definition.label,
      onlyOn: definition.onlyOn,
      condition
    };
  }

  addArrayItem(
    pointer: string,
    target: Pointer,
    loadHooks = false,
    reverse = true
  ) {
    const operation = reverse ? 'unshift' : 'push';
    const control = target.control as UntypedFormArray;

    if (
      target.arrayType === SchemaType.Array ||
      target.arrayType === SchemaType.Object
    ) {
      const properties = this.buildProperties(
        target.properties,
        target.required,
        pointer + '/',
        false
      );

      if (loadHooks) {
        this.loadHooks(properties.pointers);
      }
      // @ts-ignore
      target.arrayPointers[operation](properties.pointers);
      if (reverse) {
        control.insert(0, properties.form);
      } else {
        control.push(properties.form);
      }


      return properties.pointers;
    } else {
      const cont = new UntypedFormControl('');

      if (control instanceof UntypedFormArray) {
        if (reverse) {
          control.insert(0, cont);
        } else {
          control.push(cont);
        }
      }

      return cont;
    }
  }

  moveArrayItem(target: Pointer, fromIndex: number, toIndex: number) {
    if (
      target.arrayType === SchemaType.Array ||
      target.arrayType === SchemaType.Object
    ) {
      moveItemInArray(
        target.arrayPointers as any[],
        fromIndex,
        toIndex
      );
    }

    const control = target.control as UntypedFormArray;
    const currentGroup = control.at(fromIndex);

    control.removeAt(fromIndex);
    control.insert(toIndex, currentGroup);
  }

  removeArrayItem(target: Pointer, index: number) {
    target.arrayPointers.splice(index, 1);
    (target.control as UntypedFormArray).removeAt(index);
  }

  loadHooks(pointers = this.pointers) {
    Object.values(pointers).forEach(entry => {
      /**
       * TODO:
       * For the moment formatOn methods are
       * only supported on FormControls.
       * We might want to expand on this later on.
       */
      if (entry.control instanceof UntypedFormControl && entry.formatOnLoad) {
        const adjustedValue = entry.formatOnLoad(entry.control.value);

        if (adjustedValue !== entry.control.value) {
          entry.control.setValue(adjustedValue);
        }
      }
    });
  }

  preSaveHooks(
    currentState: State,
    statesToProcess = [State.Create, State.Edit],
    pointers = this.pointers
  ) {

    const preSaveData = this.form.getRawValue();

    Object.values(pointers).forEach(entry => {
      /**
       * TODO:
       * For the moment formatOn methods are
       * only supported on FormControls.
       * We might want to expand on this later on.
       */
      if (entry.control instanceof UntypedFormControl) {
        let value = entry.control.value;

        if (entry.formatOnSave) {
          value = entry.formatOnSave(value, preSaveData);
        }

        if (statesToProcess.includes(currentState)) {
          if (currentState === State.Edit && entry.formatOnEdit) {
            value = entry.formatOnEdit(value, preSaveData);
          } else if (entry.formatOnCreate) {
            value = entry.formatOnCreate(value, preSaveData);
          }
        }

        if (value !== entry.control.value) {
          entry.control.setValue(value);
        }
      }

      if (entry.arrayPointers) {
        entry.arrayPointers.forEach(arrayPointers =>
          this.preSaveHooks(currentState, statesToProcess, arrayPointers)
        );
      }
    });
  }

  getFromDefinitions(
    key: string,
    definitions: Definitions = this.definitions
  ) {
    return definitions[Parser.standardizeKey(key)];
  }

  /**
   * TODO:
   * - Handle contains case
   * - Handle items or contains as array not object
   */
  private buildArray(base: string, definition: ArrayPropertyDefinition) {
    if (definition.items) {
      return {
        arrayType: definition.items.type,
        properties: definition.items.properties,
        required: definition.items.required,
        validation: {},
        control: new UntypedFormArray([]),
        arrayPointers: []
      };
    } else {
      return {
        control: new UntypedFormControl([]),
        arrayType: SchemaType.String,
        validation: {}
      };
    }
  }

  private populateArray(
    pointer: string,
    entryValue: any,
    pointers: any
  ) {
    if (has(entryValue, pointer)) {
      const values = get(entryValue, pointer);

      if (Array.isArray(values) && values.length) {
        values.forEach(v => {

          const items = this.addArrayItem(
            pointer,
            pointers[pointer],
            false,
            false
          );

          for (const key in items) {

            const itemVal = items[key];

            if (!itemVal || !itemVal.arrayPointers) {
              continue;
            }

            this.populateArray(
              key,
              pointer
                .split('/')
                .reverse()
                .reduce((acc, cur) => {

                  if (!cur) {
                    return acc;
                  }

                  return {[Parser.standardizeKey(cur)]: acc};
                }, v),
              {[key]: itemVal}
            );
          }
        });
      }
    }
  }

  copy(
    overrides: Partial<{
      schema: any;
      injector: Injector;
      state: State;
      role: string;
      definitions: Definitions;
      customFields: CustomFields;
      form: UntypedFormGroup;
      pointers: Pointers;
    }> = {}
  ) {
    const cp = new Parser(
      overrides.schema || this.schema,
      overrides.injector || this.injector,
      overrides.state || this.state,
      overrides.role || this.role,
      overrides.definitions || this.definitions,
      overrides.customFields || this.customFields
    );

    ['form', 'pointers'].forEach(key => {
      if (overrides[key]) {
        cp[key] = overrides[key];
      }
    });

    cp.parent = this;

    return cp;
  }
}
