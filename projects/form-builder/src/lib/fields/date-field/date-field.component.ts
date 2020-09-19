import {DatePipe} from '@angular/common';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {of} from 'rxjs';
import {tap} from 'rxjs/operators';
import {FieldComponent} from '../../field/field.component';
import {FormBuilderService} from '../../form-builder.service';
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
    @Inject(COMPONENT_DATA) public cData: DateData,
    private cdr: ChangeDetectorRef,
    private formBuilderService: FormBuilderService
  ) {
    super(cData);
  }

  form: FormGroup;
  startDate: Date;
  entryControl: FormControl;
  hoursControl: FormControl;
  minutesControl: FormControl;

  ngOnInit() {
    this.formBuilderService.saveComponents.push(this);
    this.startDate = this.cData.startAt
      ? new Date(this.cData.startAt)
      : new Date();

    const date = new Date(this.cData.control.value);

    this.entryControl = cloneAbstractControl(this.cData.control);
    this.hoursControl = new FormControl(
      {value: date.getHours() || 0, disabled: this.cData.control.disabled},
      [Validators.min(0), Validators.max(23)]
    );
    this.minutesControl = new FormControl(
      {value: date.getMinutes() || 0, disabled: this.cData.control.disabled},
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
  }

  ngOnDestroy() {
    this.formBuilderService.removeComponent(this);
  }

  save() {
    return of({}).pipe(
      tap(() => {
        let value = this.entryControl.value;

        if (value) {
          if (this.cData.includeTime) {
            value.setHours(this.hoursControl.value || 0);
            value.setMinutes(this.minutesControl.value || 0);
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
    );
  }
}
