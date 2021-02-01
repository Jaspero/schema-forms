import {Pipe, PipeTransform} from '@angular/core';
import {Observable, of} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {CompiledField} from '../../interfaces/compiled-field.interface';
import {Parser} from '../../utils/parser';
import {safeEval} from '../../utils/safe-eval';

@Pipe({
  name: 'showField'
})
export class ShowFieldPipe implements PipeTransform {
  transform(fields: CompiledField[], parser: Parser): Observable<CompiledField[]> {

    return fields.some(field => field.condition)
      ? parser.form.valueChanges.pipe(
        startWith({}),
        map(() => this.filtered(fields, parser))
      )
      : of(this.filtered(fields, parser));
  }

  filtered(fields: CompiledField[], parser: Parser) {
    return fields.filter(
      field =>
        (!field.onlyOn ||
          (
            Array.isArray(field.onlyOn) ?
              field.onlyOn.includes(parser.state) :
              field.onlyOn === parser.state
          )
        ) && this.checkCondition(field.condition, parser)
    );
  }

  checkCondition(condition: CompiledField['condition'], parser: Parser) {
    if (!condition) {
      return true;
    }

    const row = parser.form.getRawValue();

    const valid = safeEval(condition.function)(row);

    switch (condition.action) {
      case 'show': {
        return valid;
      }
      case 'hide': {
        return !valid;
      }
      case 'set-to': {
        if (valid) {
          parser.pointers[condition.field].control.setValue(condition.configuration.value, {emitEvent: false});
        }

        return true;
      }
      default: {
        return true;
      }
    }
  }
}
