import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {of} from 'rxjs';
import {tap} from 'rxjs/operators';
import {FieldComponent} from '../../field/field.component';
import {FormBuilderService} from '../../form-builder.service';
import {FieldData} from '../../interfaces/field-data.interface';
import {cloneAbstractControl} from '../../utils/clone-abstract-control';
import {COMPONENT_DATA} from '../../utils/create-component-injector';

interface RangeData extends FieldData {
  min?: number;
  max?: number;
}

@Component({
  selector: 'fb-range',
  templateUrl: './range.component.html',
  styleUrls: ['./range.component.scss']
})
export class RangeComponent extends FieldComponent<RangeData> implements OnInit {

  entryControl: FormControl;
  start: FormControl;
  end: FormControl;
  min: Date;
  max: Date;

  constructor(
    @Inject(COMPONENT_DATA) public cData: RangeData,
    private cdr: ChangeDetectorRef,
    private formBuilderService: FormBuilderService
  ) {
    super(cData);
  }

  ngOnInit(): void {
    this.formBuilderService.saveComponents.push(this);

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
