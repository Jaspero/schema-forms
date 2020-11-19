import {DatePipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {combineLatest, Subscription} from 'rxjs';
import {startWith} from 'rxjs/operators';
import {FieldComponent} from '../../field/field.component';
import {FieldData} from '../../interfaces/field-data.interface';
import {COMPONENT_DATA} from '../../utils/create-component-injector';
import {cloneAbstractControl} from '../../utils/clone-abstract-control';

interface DateData extends FieldData {
  startYear?: number;
  startAt?: number;
  touchUi?: boolean;
  startView?: 'month' | 'year' | 'multi-year';
  format?: 'number' | string;
  autocomplete?: string;
  includeTime?: boolean;
  labelHours?: string;
  labelMinutes?: string;
  placeholderHours?: string;
  placeholderMinutes?: string;
}

@Component({
  selector: 'fb-date-field',
  templateUrl: './date-field.component.html',
  styleUrls: ['./date-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateFieldComponent extends FieldComponent<DateData>
  implements OnInit, OnDestroy {
  constructor(
    @Inject(COMPONENT_DATA) public cData: DateData
  ) {
    super(cData);
  }

  form: FormGroup;
  startDate: Date;
  entryControl: FormControl;
  hoursControl: FormControl;
  minutesControl: FormControl;
  listener: Subscription;

  ngOnInit() {
    this.startDate = this.cData.startAt
      ? new Date(this.cData.startAt)
      : new Date();

    const date = this.cData.control.value ? new Date(this.cData.control.value) : null;

    this.entryControl = cloneAbstractControl(this.cData.control);
    this.hoursControl = new FormControl(
      {value: date?.getHours() || 0, disabled: this.cData.control.disabled},
      [Validators.min(0), Validators.max(23)]
    );
    this.minutesControl = new FormControl(
      {value: date?.getMinutes() || 0, disabled: this.cData.control.disabled},
      [Validators.min(0), Validators.max(59)]
    );

    /**
     * Dirty hack for getting numbers to display properly might need revisiting
     */
    if (
      typeof this.entryControl.value === 'number' ||
      typeof this.entryControl.value === 'string'
    ) {
      this.entryControl.setValue(new Date(this.entryControl.value));
    }

    this.listener = combineLatest([
      this.entryControl.valueChanges.pipe(
        startWith(this.entryControl.value)
      ),
      this.hoursControl.valueChanges.pipe(
        startWith(this.hoursControl.value)
      ),
      this.minutesControl.valueChanges.pipe(
        startWith(this.minutesControl.value)
      )
    ])
      .subscribe(([value, hours, minutes]) => {
        if (value) {
          if (this.cData.includeTime) {
            value.setHours(hours || 0);
            value.setMinutes(minutes || 0);
          }

          if (this.cData.format) {
            if (this.cData.format === 'number') {
              value = value.getTime();
            } else {
              const pipe = new DatePipe('en');

              value = pipe.transform(value, this.cData.format);
            }
          }
        }

        this.cData.control.setValue(value);
      })
  }

  ngOnDestroy() {
    this.listener.unsubscribe();
  }
}
