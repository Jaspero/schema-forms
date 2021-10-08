import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Injector,
  Input,
  OnDestroy,
  Optional,
  Output,
  ViewChild
} from '@angular/core';
import {
  CUSTOM_FIELDS,
  CustomFields,
  FormBuilderComponent,
  FormBuilderContextService,
  FormBuilderData,
  Parser,
  State
} from '@jaspero/form-builder';
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
    private injector: Injector,
    @Optional()
    @Inject(CUSTOM_FIELDS)
    private customFields: CustomFields,
    private cdr: ChangeDetectorRef,
    private ctx: FormBuilderContextService
  ) {
  }

  @Input()
  set selected(selected: Selected) {
    this.formData = null;
    this.cdr.markForCheck();
    setTimeout(() => {
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
      // console.log('selected.value', JSON.parse(JSON.stringify(selected.value)));
      this.formData.value = selected.value;
      this.cdr.detectChanges();

      this.parser = new Parser(
        selected.form.schema,
        this.injector,
        // TODO: Replace with correct state
        State.Create,
        'admin',
        selected.form.definitions,
        {
          ...this.customFields || {},
          ...this.ctx.fields
        }
      );

      this.parser.form = this.parser.buildForm(
        selected.value,
        null,
        '/',
        false
      );

      this.formSub = this.formBuilderComponent.form.valueChanges.subscribe(formValue => {
        // console.log('formSub.valueChanges', JSON.parse(JSON.stringify(formValue)));
        selected.value = {
          ...selected.value,
          ...formValue
        };
        this.optionsChanged.next(formValue);
      });
    }, 500);
  }

  ngOnDestroy() {
    if (this.formSub) {
      this.formSub.unsubscribe();
    }
    console.log('ngOnDestroy');
  }
}
