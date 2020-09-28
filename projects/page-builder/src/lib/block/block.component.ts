import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output, ViewChild} from '@angular/core';
import {FormBuilderComponent, FormBuilderData} from '@jaspero/form-builder';
import {Subscription} from 'rxjs';
import {Selected} from '../selected.interface';

@Component({
  selector: 'fb-pb-block',
  templateUrl: './block.component.html',
  styleUrls: ['./block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockComponent implements OnDestroy {
  constructor(
    private cdr: ChangeDetectorRef
  ) {}

  @Input()
  set selected(selected: Selected) {

    if (this.formSub) {
      this.formSub.unsubscribe();
    }

    if (!selected) {

      if (this.formData) {
        this.formData = undefined;
        this.cdr.markForCheck();
      }

      return;
    }

    this.formData = selected.form;
    this.formData.value = selected.value;
    this.cdr.detectChanges();

    this.formSub = this.formBuilderComponent.form.valueChanges.subscribe(v => {
      selected.value = v;
      this.optionsChanged.next(v);
    })
  }

  @Output()
  optionsChanged = new EventEmitter<any>();

  @Output()
  remove = new EventEmitter();

  @ViewChild(FormBuilderComponent, {static: false})
  formBuilderComponent: FormBuilderComponent;

  formData: FormBuilderData | undefined;

  private formSub: Subscription;

  ngOnDestroy() {
    if (this.formSub) {
      this.formSub.unsubscribe();
    }
  }
}
