import {safeEval} from '@jaspero/utils';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {FieldData} from '../interfaces/field-data.interface';

export interface HSD {
  type?: 'html' | 'static' | 'dynamic';
  value: string;
}

export function getHsd(
  key: string,
  data: FieldData
): Observable<string> {
  if (data[key]) {

    let item: any;

    if (typeof data[key] === 'string') {
      return of(data[key])
    }

    switch (data[key].type) {
      case 'dynamic':
        item = safeEval(data[key].value);

        if (item) {
          return data.form.valueChanges
            .pipe(
              map(value =>
                item(
                  data.control.value,
                  value
                )
              )
            );
        }

        break;
      case 'static':
        item = safeEval(data[key].value);

        if (item) {
          return of(item(
            data.control.value,
            data.form.getRawValue()
          ));
        }
        break;
      case 'html':
      default:
        return of(data[key].value);
    }
  }

  return of('');
}
