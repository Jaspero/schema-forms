import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {UntypedFormControl, Validators} from '@angular/forms';
import {
  cloneAbstractControl,
  COMPONENT_DATA,
  FieldComponent,
  FieldData
} from '@jaspero/form-builder';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {combineLatest} from 'rxjs';

export interface RangeConfiguration {
  min?: number;
  max?: number;
}

export type RangeData = RangeConfiguration & FieldData;

@UntilDestroy()
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

  entryControl: UntypedFormControl;
  start: UntypedFormControl;
  end: UntypedFormControl;
  min: Date;
  max: Date;

  ngOnInit() {
    this.min = new Date(this.cData.min || 0);
    this.max = new Date(this.cData.max || Date.now() * 2);
    this.entryControl = cloneAbstractControl(this.cData.control);

    this.start = new UntypedFormControl(
      {value: this.entryControl.value.start || '', disabled: this.cData.control.disabled},
      [Validators.min(this.cData.min || 0)]
    );

    this.end = new UntypedFormControl(
      {value: this.entryControl.value.end || '', disabled: this.cData.control.disabled},
      [Validators.max(this.cData.max || Date.now() * 2)]
    );

    combineLatest([
      this.start.valueChanges,
      this.end.valueChanges
    ])
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(([start, end]) => {
        this.cData.control.setValue({start, end});
      })
  }
}
