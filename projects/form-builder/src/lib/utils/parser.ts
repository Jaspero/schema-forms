import {ComponentPortal} from '@angular/cdk/portal';
import {Injector} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {COMPONENT_TYPE_COMPONENT_MAP} from '../consts/component-type-component-map.const';
import {SchemaType} from '../enums/schema-type.enum';
import {FieldComponent} from '../field/field.component';
import {CompiledField} from '../interfaces/compiled-field.interface';
import {Control} from '../interfaces/control.type';
import {ModuleDefinitions} from '../interfaces/module-definitions.interface';
import {State} from '../interfaces/state.interface';
import {SchemaValidators} from '../validators/schema-validators.class';
import {createComponentInjector} from './create-component-injector';
import {safeEval} from './safe-eval';
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
    public definitions: ModuleDefinitions = {}
  ) {}

  form: FormGroup;
  pointers: Pointers = {};

  static standardizeKey(key: string) {
    if (key[0] === '/') {
      key = key.slice(1, key.length);
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
      control: new FormControl(definition.default || '', controlValidation),
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
      control: new FormControl(definition.default || null, controlValidation),
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
      control: new FormControl(definition.default || false, controlValidation),
      validation
    };
  }

  buildForm(
    value?: any,
    required: string[] = [],
    base = '/',
    addId = true
  ) {
    const properties = this.buildProperties(
      this.schema.properties || {},
      required,
      base,
      addId
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
    addId = true
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
            const objectProperties = this.buildProperties(
              /**
               * Supporting both {type: 'object', properties: {}} and
               * {type: 'object', items: {properties: {}}}
               */
              value.properties || value.items && value.items.properties ? value.items.properties : {},
              value.required || value.items && value.items.required ? value.items.required : [],
              base + key + '/',
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
            break;

          case SchemaType.Array:
            parsed = this.buildArray(base, value);
            break;
        }

        const pointerKey = base + key;
        const definition = this.getFromDefinitions(pointerKey) || {};

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

        return group;
      },
      {
        form: {},
        pointers: {}
      }
    );

    return {
      pointers,
      form: new FormGroup(form)
    };
  }

  /**
   * @param pointerKey Lookup key for the pointer
   * @param pointer Entire pointer object that should be used
   * @param definitions Entire definitions object that should be used
   * @param single Defines if the field shown in the form or in the table
   * @param arrayRoot If the field is in an array what root lookup to use
   */
  field(
    pointerKey: string,
    pointer: Pointer,
    definitions: ModuleDefinitions = {},
    single = true,
    arrayRoot?: string
  ): CompiledField {
    const {key, type, control, validation} = pointer;
    const definition = {
      label: key,
      ...this.getFromDefinitions(pointerKey, definitions)
    };

    if (definition.disableOn && definition.disableOn === this.state) {
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

    const portal = new ComponentPortal<FieldComponent<any>>(
      // @ts-ignore
      COMPONENT_TYPE_COMPONENT_MAP[definition.component.type],
      null,
      createComponentInjector(this.injector, {
        control,
        validation,
        single,
        pointers: this.pointers,
        form: this.form,
        ...definition,
        // @ts-ignore
        ...(definition.component.configuration || {})
      })
    );

    return {
      pointer: pointerKey,
      control,
      portal,
      validation,
      placeholder: definition.placeholder || '',
      label: definition.label,
      onlyOn: definition.onlyOn
    };
  }

  addArrayItem(pointer: string, loadHooks = false) {
    const target = this.pointers[pointer];
    const control = this.pointers[pointer].control as FormArray;

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
      target.arrayPointers.unshift(properties.pointers);
      control.insert(0, properties.form);
    } else {
      // TODO: Different SchemaType
      control.insert(0, new FormControl(''));
    }
  }

  removeArrayItem(pointer: string, index: number) {
    // @ts-ignore
    this.pointers[pointer].arrayPointers.splice(index, 1);
    (this.pointers[pointer].control as FormArray).removeAt(index);
  }

  loadHooks(pointers = this.pointers) {
    Object.values(pointers).forEach(entry => {
      /**
       * TODO:
       * For the moment formatOn methods are
       * only supported on FormControls.
       * We might want to expand on this later on.
       */
      if (entry.control instanceof FormControl && entry.formatOnLoad) {
        const adjustedValue = entry.formatOnLoad(entry.control.value);

        if (adjustedValue !== entry.control.value) {
          entry.control.setValue(adjustedValue);
        }
      }
    });
  }

  preSaveHooks(
    currentState: number,
    statesToProcess = [0, 1, 2],
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
      if (entry.control instanceof FormControl) {
        let value = entry.control.value;

        if (entry.formatOnSave) {
          value = entry.formatOnSave(value, preSaveData);
        }

        if (statesToProcess.includes(currentState)) {
          if (currentState === 1 && entry.formatOnEdit) {
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

  /**
   * TODO:
   * - Handle contains case
   * - Handle items or contains as array not object
   */
  private buildArray(base: string, definition: ArrayPropertyDefinition) {
    if (
      !definition.items ||
      (definition.items.type !== SchemaType.Array &&
        definition.items.type !== SchemaType.Object)
    ) {
      return {
        control: new FormControl([]),
        ...(definition.items
          ? {
              arrayType: definition.items.type,
              properties: definition.items.properties,
              required: definition.items.required,
              validation: {}
            }
          : {
              arrayType: SchemaType.String,
              validation: {}
            })
      };
    } else {
      return {
        arrayType: definition.items.type,
        properties: definition.items.properties,
        required: definition.items.required,
        validation: {},
        control: new FormArray([]),
        arrayPointers: []
      };
    }
  }

  private getFromDefinitions(
    key: string,
    definitions: ModuleDefinitions = this.definitions
  ) {
    return definitions[Parser.standardizeKey(key)];
  }
}
