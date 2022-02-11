import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {
  cloneAbstractControl,
  COMPONENT_DATA,
  FieldComponent,
  FieldData
} from '@jaspero/form-builder';
import {of} from 'rxjs';
import {tap} from 'rxjs/operators';

export interface RangeConfiguration {
  min?: number;
  max?: number;
}

export type RangeData = RangeConfiguration & FieldData;

@Component({
  selector: 'fb-range',
  templateUrl: './range.component.html',
  styleUrls: ['./range.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RangeComponent extends FieldComponent<RangeData> implements OnInit {
  constructor(
    @Inject(COMPONENT_DATA) public cData: RangeData
  ) {
    super(cData);
  }

  entryControl: FormControl;
  start: FormControl;
  end: FormControl;
  min: Date;
  max: Date;

  ngOnInit() {
    this.min = new Date(this.cData.min || 0);
    this.max = new Date(this.cData.max || Date.now() * 2);
    this.entryControl = cloneAbstractControl(this.cData.control);

    this.start = new FormControl(
      {value: this.entryControl.value.start || '', disabled: this.cData.control.disabled},
      [Validators.min(this.cData.min || 0)]
    );

    this.end = new FormControl(
      {value: this.entryControl.value.end || '', disabled: this.cData.control.disabled},
      [Validators.max(this.cData.max || Date.now() * 2)]
    );
  }

  save() {
    return of({}).pipe(
      tap(() => {
        const start = this.start.value;
        const end = this.end.value;
        this.cData.control.setValue({start, end});
      })
    );
  }
}
