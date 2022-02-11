import {FormGroup} from '@angular/forms';
import {Observable} from 'rxjs';
import {Parser} from '../utils/parser';
import {FieldData} from './field-data.interface';

export interface ProcessConfig {
  cData: FieldData;
  pointer: string;
  collectionId: string;
  documentId: string;
  /**
   * Value at form initialization.
   * This will only be available when
   * updating or deleting
   */
  entryValue?: any;

  /**
   * This is the value passed on to further
   * operations and returned by the form
   */
  outputValue: any;
}

export type Process = (data: ProcessConfig) => Observable<any>;

export interface Operation {
  cData: FieldData;
  priority?: number;
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
  };

  /**
   * Utilities
   */

  /**
   * Creates an operation on the correct property
   */
  assignOperation: (config: Operation) => void;

  /**
   * Verifies that the requested pointer exists and returns its value
   */
  exists: (config: ProcessConfig) => {
    exists: boolean;
    value?: any
  };

  /**
   * Verifies that value has changed.
   * It only works with primitives.
   */
  change: (config: ProcessConfig) => boolean;
}
