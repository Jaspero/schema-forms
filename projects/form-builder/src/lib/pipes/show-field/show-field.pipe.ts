import {Pipe, PipeTransform} from '@angular/core';
import {combineLatest, Observable, of} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {Action, CompiledField} from '../../interfaces/compiled-field.interface';
import {StateService} from '../../services/state.service';
import {Parser} from '../../utils/parser';
import {safeEval} from '../../utils/safe-eval';

@Pipe({
  name: 'showField'
})
export class ShowFieldPipe implements PipeTransform {

  constructor(
    private state: StateService
  ) {
  }

  transform(fields: CompiledField[], parser: Parser): Observable<CompiledField[]> {

    return combineLatest(
      fields.reduce<Array<Observable<CompiledField | null>>>((filtered, field) => {
        if (field.condition) {
          if (!field.condition.deps.length) {
            filtered.push(this.getListener('form', parser).pipe(
              map(() => field)
            ).pipe(
              startWith(null),
              map(() => {
                return this.checkField(field, parser) ? field : null;
              })
            ));
          } else {
            const deps = field.condition.deps.map(dep => this.getListener(dep, parser));

            filtered.push(combineLatest(deps).pipe(
              map(() => field)
            ).pipe(
              startWith(null),
              map(() => {
                return this.checkField(field, parser) ? field : null;
              })
            ));
          }
        } else {
          filtered.push(
            this.checkField(field, parser) ? of(field) : of(null)
          );
        }
        return filtered;
      }, [])
    ).pipe(
      map((items: Array<CompiledField | null>) => items.filter(it => it) as CompiledField[])
    );
  }

  getListener(control: string, parser: Parser) {
    if (control === 'form') {
      if (!this.state.listeners.form) {
        this.state.listeners.form = parser.form.valueChanges;
      }

      return this.state.listeners.form;
    }

    if (!this.state.listeners[control]) {
      this.state.listeners[control] = parser.form.controls[control].valueChanges;
    }

    return this.state.listeners[control];
  }

  checkField(field: CompiledField, parser: Parser) {
    return (!field.onlyOn ||
      (
        Array.isArray(field.onlyOn) ?
          field.onlyOn.includes(parser.state) :
          field.onlyOn === parser.state
      )
    ) && this.checkCondition(field.condition, parser);
  }

  checkCondition(condition: CompiledField['condition'], parser: Parser) {
    if (!condition) {
      return true;
    }

    const row = parser.form.getRawValue();

    let bool = true;
    (condition.action as Action[]).forEach(action => {
      const valid = safeEval(action.function)(row);

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
