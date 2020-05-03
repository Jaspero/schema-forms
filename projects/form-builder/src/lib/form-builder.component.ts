import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  Output,
  SimpleChanges
} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';
import {SegmentType} from './enums/segment-type.enum';
import {State} from './enums/state.enum';
import {CompiledSegment} from './interfaces/compiled-segment.interface';
import {FormBuilderData} from './interfaces/form-builder-data.interface';
import {CUSTOM_FIELDS, CustomFields} from './utils/custom-fields';
import {filterAndCompileSegments} from './utils/filter-and-compile-segments';
import {Parser} from './utils/parser';
import {ROLE} from './utils/role';

@Component({
  selector: 'fb-form-builder',
  templateUrl: './form-builder.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormBuilderComponent implements OnChanges, OnDestroy {
  constructor(
    private injector: Injector,
    @Optional()
    @Inject(ROLE)
    private role: string,
    @Optional()
    @Inject(CUSTOM_FIELDS)
    private customFields: CustomFields,
    private cdr: ChangeDetectorRef
  ) { }

  @Input()
  data: FormBuilderData;

  @Input()
  value: any;

  @Input()
  id: string;

  @Output()
  valueChanges = new EventEmitter<any>();

  form: FormGroup;
  parser: Parser;
  segments: CompiledSegment[];

  state: State;

  private changeSubscription: Subscription;

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data) {
      this.render();
    }

    if (changes.id) {
      this.state = changes.id.currentValue ? State.Edit : State.Create;
    }

    if (changes.value && this.form) {
      this.form.patchValue(changes.value.currentValue);
    }
  }

  ngOnDestroy() {
    if (this.changeSubscription) {
      this.changeSubscription.unsubscribe();
    }
  }

  save() {
    this.parser.preSaveHooks(
      this.state
    );

    return this.form.getRawValue();
  }

  private render() {
    const value = this.data.value || {};
    const definitions = this.data.definitions || {};

    this.parser = new Parser(
      this.data.schema,
      this.injector,
      this.state,
      definitions,
      this.customFields
    );

    this.parser.loadHooks();

    this.form = this.parser.buildForm(
      value,
      [],
      '/',
      false
    );

    this.segments = filterAndCompileSegments(
      this.role,
      this.data.segments ||
      [{
        title: '',
        fields: Object.keys(this.parser.pointers),
        columnsDesktop: 12,
        type: SegmentType.Empty
      }],
      this.parser,
      definitions,
      this.injector,
      value
    );

    if (this.changeSubscription) {
      this.changeSubscription.unsubscribe();
    }

    this.form.valueChanges
      .subscribe(value => {
        this.valueChanges.emit(value);
      });

    this.cdr.markForCheck();
  }
}
