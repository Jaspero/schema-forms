import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import {FormBuilderComponent, FormBuilderData, Parser} from '@jaspero/form-builder';
import {Subscription} from 'rxjs';
import {Selected} from '../selected.interface';

@Component({
  selector: 'fb-pb-block',
  templateUrl: './block.component.html',
  styleUrls: ['./block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockComponent implements OnDestroy {
  @Input() parentFormId = 'main';
  @Output()
  optionsChanged = new EventEmitter<any>();
  @Output()
  remove = new EventEmitter();
  @ViewChild(FormBuilderComponent, {static: false})
  formBuilderComponent: FormBuilderComponent;
  parser: Parser;
  id: string;
  formData: FormBuilderData | undefined;
  private formSub: Subscription;

  constructor(
    private cdr: ChangeDetectorRef
  ) {
  }

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

    this.id = [this.parentFormId || 'main', 'blocks', selected.index].join('-');
    this.formData = selected.form;
    console.log('selected.value', JSON.parse(JSON.stringify(selected.value)));
    this.formData.value = selected.value;
    this.cdr.detectChanges();
    //
    // this.parser = new Parser(
    //   selected.form.schema,
    //   this.injector,
    //   // TODO: Replace with correct state
    //   State.Create,
    //   this.role,
    //   selected.form.definitions,
    //   {
    //     ...this.customFields || {},
    //     ...this.ctx.fields
    //   }
    // );

    setTimeout(() => {
      console.log('form.getRawValue', this.formBuilderComponent.form.getRawValue());
    }, 5000);

    this.formSub = this.formBuilderComponent.form.valueChanges.subscribe(formValue => {
      console.log('formSub.valueChanges', JSON.parse(JSON.stringify(formValue)));
      selected.value = {
        ...selected.value,
        ...formValue
      };
      this.optionsChanged.next(formValue);
    });
  }

  ngOnDestroy() {
    if (this.formSub) {
      this.formSub.unsubscribe();
    }
  }
}
