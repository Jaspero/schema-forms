import {FormGroup} from '@angular/forms';
import {Observable} from 'rxjs';
import {Parser} from '../utils/parser';

export type Process = <T = any>(data: {
  pointer: string,
  collectionId: string,
  documentId: string,
  /**
   * Value at form initialization.
   * This will only be available when
   * updating or deleting
   */
  entryValue?: any,

  /**
   * This is the value passed on to further
   * operations and returned by the form
   */
  outputValue: any
}) => Observable<T>;

export interface Operation {
  priority: number;
  save?: Process;
  delete?: Process;
};

export interface GlobalState {
  forms: {[id: string]: FormGroup};
  parsers: {[id: string]: Parser};

  /**
   * Operators are sorted in order of priority
   * and executed when the "save" method is called.
   *
   * They should each mutate the "outputValue" which
   * is forwarded along to each subsuqent "save"
   * method and returned by the "save" method.
   *
   * TODO:
   * Implement Delete
   */
  operations: {
    [id: string]: {
      [pointer: string]: Operation
    }
  }
}
