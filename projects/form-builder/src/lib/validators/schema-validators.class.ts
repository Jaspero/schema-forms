import {AbstractControl} from '@angular/forms';

// @dynamic
export class SchemaValidators {
  static multipleOf(num: number) {
    return (control: AbstractControl) => {
      return control.value % num === 0 ? null : {multipleOf: num};
    };
  }
}
