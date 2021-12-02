import {Pipe, PipeTransform} from '@angular/core';
import {combineLatest, Observable, of} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {Action, CompiledField} from '../../interfaces/compiled-field.interface';
import {Parser} from '../../utils/parser';

@Pipe({name: 'showField'})
export class ShowFieldPipe implements PipeTransform {
  transform(fields: CompiledField[], parser: Parser, index?: number): Observable<CompiledField[]> {

    const changes = fields.reduce<Array<Observable<CompiledField | null>>>((filtered, field) => {
      if (field.condition) {
        filtered.push(
          (
            field.condition.deps.length ?
              combineLatest(
                field.condition.deps.map(dep => this.getListener(dep, parser, index))
              ) :
              this.getListener('form', parser, index)
          )
            .pipe(
              map(() => field),
              startWith(null),
              map(() => this.checkField(field, parser, index) ? field : null)
            )
        );
      } else {
        filtered.push(
          this.checkField(field, parser, index) ? of(field) : of(null)
        );
      }

      return filtered;
    }, []);

    return combineLatest(changes).pipe(
      map((items: Array<CompiledField | null>) => items.filter(it => it) as CompiledField[])
    );
  }

  getListener(control: string, parser: Parser, valueIndex: number | undefined) {
    if (control === 'form') {
      return parser.form.valueChanges
    }

    const fields = control.split('/').filter(it => it);

    let pointer;

    for (let i = 0; i < fields.length; i++) {
      const path = fields.map((item, index) =>
        index > i ? '' : ('/' + item)
      ).join('');
      const field = '/' + fields[i];

      if (!pointer) {
        pointer = parser.pointers[field];
      } else {
        pointer = pointer.arrayPointers[valueIndex || 0][path];
      }
    }

    return pointer.control.valueChanges;
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

    let response = true;

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
          response = valid;
          break;
        }
        case 'hide': {
          response = !valid;
          break;
        }
        case 'set-to': {
          if (valid) {
            parser.pointers[condition.field].control.setValue(action.configuration.value, {emitEvent: false});
          }
          break;
        }
        default: {
          response = true;
          break;
        }
      }
    });

    return response;
  }
}
