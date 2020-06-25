import {DatePipe} from '@angular/common';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {of} from 'rxjs';
import {tap} from 'rxjs/operators';
import {FieldComponent} from '../../field/field.component';
import {FormBuilderService} from '../../form-builder.service';
import {FieldData} from '../../interfaces/field-data.interface';
import {COMPONENT_DATA} from '../../utils/create-component-injector';

interface DateData extends FieldData {
  startYear?: number;
  startAt?: number;
  touchUi?: boolean;
  startView?: 'month' | 'year' | 'multi-year';
  format?: 'number' | string;
  autocomplete?: string;
  includeTime?: boolean;
  labels?: {
    date: string;
    hours: string;
    minutes: string;
  };
}

@Component({
  selector: 'fb-date-field',
  templateUrl: './date-field.component.html',
  styleUrls: ['./date-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateFieldComponent extends FieldComponent<DateData>
  implements OnInit {
  startDate: Date;

  form: FormGroup;

  constructor(
    @Inject(COMPONENT_DATA) public cData: DateData,
    private cdr: ChangeDetectorRef,
    private formBuilderService: FormBuilderService,
    private fb: FormBuilder
  ) {
    super(cData);
  }

  ngOnInit() {
    this.formBuilderService.saveComponents.push(this);
    this.startDate = this.cData.startAt
      ? new Date(this.cData.startAt)
      : new Date();

    const date = new Date(this.cData.control.value);
    this.form = this.fb.group({
      date: [date],
      hours: [date.getHours() || '12', [Validators.min(0), Validators.max(24)]],
      minutes: [date.getMinutes() || '0', [Validators.min(0), Validators.max(59)]]
    });
  }

  save() {
    return of({}).pipe(
      tap(() => {
        const form = this.form.getRawValue();
        let value = form.date;
        value.setHours(form.hours);
        value.setMinutes(form.minutes);

        if (value) {
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
