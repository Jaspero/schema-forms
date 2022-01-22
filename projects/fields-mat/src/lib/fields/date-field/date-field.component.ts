import {formatDate} from '@angular/common';
import {ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {cloneAbstractControl, COMPONENT_DATA, FieldComponent, FieldData} from '@jaspero/form-builder';
import {safeEval} from '@jaspero/utils';
import {merge, Subscription} from 'rxjs';

export interface DateConfiguration {
  startAt?: number;
  touchUi?: boolean;
  startView?: 'month' | 'year' | 'multi-year';
  format?: 'number' | string;
  stringToDate?: string;
  autocomplete?: string;
  includeTime?: boolean;
  labelHours?: string;
  labelMinutes?: string;
  placeholderHours?: string;
  placeholderMinutes?: string;
}

export type DateData = DateConfiguration & FieldData;

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

    const {value} = this.cData.control;

    let date: Date = value || null;

    if (value) {
      switch (typeof value) {
        case 'number':
          date = new Date(value);
          break;
        case 'string':

          /**
           * TODO:
           * We could implement a parser for DatePipe strings to dates
           * instead of expecting a stringToDate method
           */
          if (this.cData.stringToDate) {
            const method = safeEval(this.cData.stringToDate);

            if (method) {
              date = method(value);
            }
          }
          break;
      }
    }

    this.entryControl = cloneAbstractControl(this.cData.control, date);

    const changes = [this.entryControl];

    if (this.cData.includeTime) {

      this.hoursControl = new FormControl(
        {value: date?.getHours() || 0, disabled: this.cData.control.disabled},
        [Validators.min(0), Validators.max(23)]
      );
      this.minutesControl = new FormControl(
        {value: date?.getMinutes() || 0, disabled: this.cData.control.disabled},
        [Validators.min(0), Validators.max(59)]
      );

      changes.push(
        this.hoursControl,
        this.minutesControl
      )
    }

    this.listener = merge(...changes.map(change => change.valueChanges))
      .subscribe(() => {

        let [date, hours, minutes] = changes.map(change => change.value);

        if (date) {
          if (this.cData.includeTime) {
            date.setHours(hours || 0);
            date.setMinutes(minutes || 0);
          }

          if (this.cData.format) {
            if (this.cData.format === 'number') {
              date = date.getTime();
            } else {
              date = formatDate(
                date,
                this.cData.format,
                navigator.language || 'en'
              );
            }
          }
        }

        this.cData.control.setValue(date);
      })
  }

  ngOnDestroy() {
    this.listener.unsubscribe();
  }
}
