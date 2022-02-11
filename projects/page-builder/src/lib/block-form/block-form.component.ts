import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import {FormBuilderComponent, FormBuilderData, Parser, State} from '@jaspero/form-builder';
import {Subscription} from 'rxjs';
import {Selected} from '../selected.interface';

@Component({
  selector: 'fb-pb-block-form',
  templateUrl: './block-form.component.html',
  styleUrls: ['./block-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockFormComponent implements OnDestroy {
  constructor(
    private injector: Injector,
    private cdr: ChangeDetectorRef
  ) {}

  @Input() parentFormId = 'main';
  @Output() optionsChanged = new EventEmitter<any>();
  @Output() remove = new EventEmitter();
  @ViewChild(FormBuilderComponent) formBuilderComponent: FormBuilderComponent;

  parser: Parser;
  id: string;
  formData: FormBuilderData | undefined;
  parent: {
    id: string;
    pointer: string;
  };

  private formSub: Subscription;
  private _selected: Selected;

  @Input()
  set selected(selected: Selected) {
    this.formData = null;
    this.cdr.markForCheck();
    if (this.formSub) {
      this.formSub.unsubscribe();
    }

    this.parser = new Parser(
      selected.form.schema,
      this.injector,
      // TODO: Replace with correct state
      State.Create,
      'admin',
      selected.form.definitions
    );

    this.parser.form = this.parser.buildForm(
      selected.value,
      null,
      '/',
      false
    );

    setTimeout(() => {
      this.id = [this.parentFormId || 'main', 'blocks', selected.index].join('-');

      let pointer = `/blocks/${selected.index}/value`;

      if (selected.nested && typeof selected.nested.index === 'number' && selected.nested.arrayProperty) {
        pointer += '/' + selected.nested.arrayProperty + '/' + selected.nested.index;
      }

      if (selected.form.segments) {
        this.formData = {
          ...selected.form,
          segments: (selected.form.segments || []).map(segment => {
            return {
              ...segment,
              title: ''
            };
          })
        };
      } else {
        this.formData = selected.form;
      }

      this.parent = {
        id: this.parentFormId,
        pointer
      };
      this.formData.value = selected.value;
      this.cdr.markForCheck();

      this._selected = selected;
      this.cdr.markForCheck();
    });
  }

  changedFormBuilder() {
    this.formSub = this.formBuilderComponent.form.valueChanges.subscribe(formValue => {
      if (this._selected.nested?.arrayProperty && typeof this._selected.nested?.index === 'number') {
        this._selected.value = {
          ...this._selected.nested.completeValue
        };

        this._selected.value[this._selected.nested.arrayProperty][this._selected.nested.index] = formValue;

        this.optionsChanged.next(this._selected.value);
      } else {
        this._selected.value = {
          ...this._selected.value,
          ...formValue
        };

        this.optionsChanged.next(formValue);
      }
    });

    setTimeout(() =>
      this.formBuilderComponent?.form.setValue(this.formBuilderComponent.form.getRawValue())
    );
  }

  ngOnDestroy() {
    if (this.formSub) {
      this.formSub.unsubscribe();
    }
  }
}
