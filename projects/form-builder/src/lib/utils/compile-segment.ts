import {ComponentPortal} from '@angular/cdk/portal';
import {Injector} from '@angular/core';
import {safeEval} from '@jaspero/utils';
import {CustomComponent} from '../custom/custom.component';
import {FormBuilderContextService} from '../form-builder-context.service';
import {CompiledField} from '../interfaces/compiled-field.interface';
import {CompiledSegment} from '../interfaces/compiled-segment.interface';
import {CompiledCondition, ConditionAction, ConditionEvaluate, ConditionType} from '../interfaces/condition.interface';
import {Definitions} from '../interfaces/definitions.interface';
import {Segment} from '../interfaces/segment.interface';
import {SegmentComponent} from '../segment/segment.component';
import {compileFields} from './compile-fields';
import {createSegmentInjector} from './create-segment-injector';
import {createCustomComponentInjector} from './custom-components';
import {DEFAULT_SEGMENT} from './default-segment';
import {Parser} from './parser';

export function compileSegment(config: {
  segment: Segment,
  parser: Parser,
  definitions: Definitions,
  injector: Injector,
  value: any,
  parent?: string,
  formId?: string;
  parentForm?: {
    id: string;
    pointer: string;
  },
  index?: number
}) {

  const {
    segment,
    parser,
    definitions,
    injector,
    value,
    parent,
    formId,
    parentForm,
    index,
  } = config;

  const classes: string[] = [];

  let fields: CompiledField[] | string[] = [];
  let customComponents: ComponentPortal<CustomComponent>[] = [];

  if (segment.columnsDesktop) {
    classes.push(`col-${segment.columnsDesktop}`);
  }

  if (segment.columnsTablet) {
    classes.push(`col-m-${segment.columnsTablet}`);
  }

  if (segment.columnsMobile) {
    classes.push(`col-s-${segment.columnsMobile}`);
  }

  /**
   * If there aren't any column definitions
   * default to full width
   */
  if (!classes.length) {
    classes.push(parent ? 'fb-field-12' : 'col-12');
  }

  if (segment.classes) {
    classes.push(...segment.classes);
  }

  if (segment.fields) {

    /**
     * If it's an array fields aren't parsed
     */
    if (segment.array) {
      // @ts-ignore
      fields = (segment.fields || []).map(fi => {
        if (fi.constructor === Object) {
          return {
            ...fi,
            segment: segment.array
          };
        } else {
          return segment.array + fi;
        }
      });
    } else {
      fields = compileFields({
        parser,
        definitions,
        fields: segment.fields,
        formId,
        parentForm
      });
    }
  }

  if (segment.components) {

    const {componentMap} = injector.get(FormBuilderContextService);

    if (componentMap) {
      customComponents = segment.components.reduce((acc: ComponentPortal<CustomComponent>[], component) => {
        const comp = componentMap[component.selector];
        const id = parser.form.get('id');
        if (comp && (!component.authorization || component.authorization.includes(parser.role))) {
          acc.push(
            new ComponentPortal<CustomComponent>(
              comp,
              null,
              createCustomComponentInjector(injector, {
                form: parser.form,
                parentForm,
                formId,
                ...id && {id: id.value},
                ...(component.input || {})
              })
            )
          );
        }

        return acc;
      }, []);
    }
  }

  const compiledSegment = {
    ...segment,
    classes,
    fields,
    entryValue: value,
    customComponents
  } as CompiledSegment;

  /**
   * TODO:
   * Statement support
   */
  if (segment.conditions) {

    compiledSegment.conditions = [];
    const valToPass = value || {};

    for (const cur of segment.conditions) {
      let condition;

      const type = cur.type || ConditionType.Function;
      const action = cur.action || ConditionAction.Show;
      const evaluateOn = cur.evaluateOn || ConditionEvaluate.OnLoad;
      const evaluateStates = cur.evaluateStates || [0, 1, 2];

      if (cur.condition) {
        condition = safeEval(cur.condition as string);
      }

      if (condition) {

        /**
         * Evaluate on load conditions
         */
        if (evaluateOn === ConditionEvaluate.OnLoad) {

          /**
           * Check if items should be excluded right away
           */
          if (
            (action === ConditionAction.Show && !condition(valToPass)) ||
            (action === ConditionAction.Hide && condition(valToPass))
          ) {
            return null;
          }
        }

        compiledSegment.conditions.push({
          condition,
          type,
          action,
          evaluateStates,
          evaluateOn,
          ...cur.data && {
            data: cur.data
          }
        } as CompiledCondition);
      }
    }
  }

  const ctx = injector.get(FormBuilderContextService);

  let defaultSegment = 'card';

  try {
    defaultSegment = injector.get(DEFAULT_SEGMENT);
  } catch (e) {}

  return {
    component: new ComponentPortal<SegmentComponent>(
      ctx.segments[segment.type || defaultSegment],
      null,
      createSegmentInjector(injector, {
        segment: compiledSegment,
        parser,
        definitions,
        parentForm,
        formId,
        ...parent && {parent},
        ...index !== undefined && {index}
      })
    ),
    ...compiledSegment
  } as CompiledSegment;
}
