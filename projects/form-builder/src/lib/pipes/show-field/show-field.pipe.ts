import {Pipe, PipeTransform} from '@angular/core';
import {combineLatest, Observable, of} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {Action, CompiledField} from '../../interfaces/compiled-field.interface';
import {StateService} from '../../services/state.service';
import {Parser} from '../../utils/parser';

@Pipe({
  name: 'showField'
})
export class ShowFieldPipe implements PipeTransform {

  constructor(
    private state: StateService
  ) {
  }

  transform(fields: CompiledField[], parser: Parser, index?: number): Observable<CompiledField[]> {

    return combineLatest(
      fields.reduce<Array<Observable<CompiledField | null>>>((filtered, field) => {
        if (field.condition) {
          if (!field.condition.deps.length) {
            filtered.push(this.getListener('form', parser, index).pipe(
              map(() => field)
            ).pipe(
              startWith(null),
              map(() => {
                return this.checkField(field, parser, index) ? field : null;
              })
            ));
          } else {
            const deps = field.condition.deps.map(dep => this.getListener(dep, parser, index));

            filtered.push(combineLatest(deps).pipe(
              map(() => field)
            ).pipe(
              startWith(null),
              map(() => {
                return this.checkField(field, parser, index) ? field : null;
              })
            ));
          }
        } else {
          filtered.push(
            this.checkField(field, parser, index) ? of(field) : of(null)
          );
        }
        return filtered;
      }, [])
    ).pipe(
      map((items: Array<CompiledField | null>) => items.filter(it => it) as CompiledField[])
    );
  }

  getListener(control: string, parser: Parser, valueIndex: number | undefined) {
    if (control === 'form') {
      if (!this.state.listeners.form) {
        this.state.listeners.form = parser.form.valueChanges;
      }

      return this.state.listeners.form;
    }

    if (!this.state.listeners[control]) {
      if ((control.match(/\//g) || []).length === 1) {
        this.state.listeners[control] = parser.pointers[control].control.valueChanges;
      } else {

        const fields = control.split('/').filter(it => it);

        let pointer;
        for (let i = 0; i < fields.length; i++) {
          const path = fields.map((item, index) => {
            if (index > i) {
              return '';
            }

            return '/' + item;
          }).join('');
          const field = '/' + fields[i];

          if (!pointer) {
            pointer = parser.pointers[field];
          } else {
            pointer = pointer.arrayPointers[valueIndex || 0][path];
          }
        }

        return pointer.control.valueChanges;
      }
    }

    return this.state.listeners[control];
  }

  checkField(field: CompiledField, parser: Parser, index: number | undefined) {
    return (!field.onlyOn ||
      (
        Array.isArray(field.onlyOn) ?
          field.onlyOn.includes(parser.state) :
          field.onlyOn === parser.state
      )
    ) && this.checkCondition(field.condition, parser, index);
  }

  checkCondition(condition: CompiledField['condition'], parser: Parser, index: number | undefined) {
    if (!condition) {
      return true;
    }

    const row = parser.form.getRawValue();

    let bool = true;
    (condition.action as Action[]).forEach(action => {
      if (!action.eval) {
        return;
      }

      let valid = false;
      try {
        valid = action.eval(row, index || 0);
      } catch(error) {}

      switch (action.type) {
        case 'show': {
          bool = valid;
          break;
        }
        case 'hide': {
          bool = !valid;
          break;
        }
        case 'set-to': {
          if (valid) {
            parser.pointers[condition.field].control.setValue(action.configuration.value, {emitEvent: false});
          }
          break;
        }
        default: {
          bool = true;
          break;
        }
      }
    });

    return bool;
  }
}
