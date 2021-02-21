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
import {forkJoin, of, Subscription} from 'rxjs';
import {map} from 'rxjs/operators';
import {SegmentType} from './enums/segment-type.enum';
import {State} from './enums/state.enum';
import {FormBuilderContextService} from './form-builder-context.service';
import {FormBuilderService} from './form-builder.service';
import {CompiledSegment} from './interfaces/compiled-segment.interface';
import {FormBuilderData} from './interfaces/form-builder-data.interface';
import {CUSTOM_FIELDS, CustomFields} from './utils/custom-fields';
import {filterAndCompileSegments} from './utils/filter-and-compile-segments';
import {Parser} from './utils/parser';
import {ROLE} from './utils/role';

@Component({
  selector: 'fb-form-builder',
  templateUrl: './form-builder.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FormBuilderService]
})
export class FormBuilderComponent implements OnChanges, OnDestroy {
  constructor(
    public service: FormBuilderService,
    private injector: Injector,
    @Optional()
    @Inject(ROLE)
    private role: string,
    @Optional()
    @Inject(CUSTOM_FIELDS)
    private customFields: CustomFields,
    private cdr: ChangeDetectorRef,
    private ctx: FormBuilderContextService
  ) { }

  @Input()
  data: FormBuilderData;

  @Input()
  value: any;

  @Input()
  id: string;

  @Output()
  valueChanges = new EventEmitter<any>();

  @Output()
  validityChanges = new EventEmitter<boolean>();

  form: FormGroup;
  parser: Parser;
  segments: CompiledSegment[];

  @Input()
  state: State = State.Create;

  private changeSubscription: Subscription;
  private statusSubscription: Subscription;

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data) {
      this.render();
    }

    if (changes.value && this.form) {
      this.form.patchValue(changes.value.currentValue);
    }
  }

  ngOnDestroy() {
    if (this.changeSubscription) {
      this.changeSubscription.unsubscribe();
    }

    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }

  process() {
    this.parser.preSaveHooks(
      this.state
    );

    return this.form.getRawValue();
  }

  save(
    collectionId: string,
    documentId: string,
    overrideComponents?: any[]
  ) {
    const toExec = (overrideComponents || this.service.saveComponents).map(comp =>
      comp.save(collectionId, documentId)
    );

    return (
      toExec.length ?
        forkJoin(toExec) :
        of({})
    )
      .pipe(
        map(() =>
          this.form.getRawValue()
        )
      );
  }

  saveAndProcess(
    collectionId: string,
    documentId: string
  ) {
    this.process();

    return this.save(
      collectionId,
      documentId
    );
  }

  private render() {
    const value = this.data.value || {};
    const definitions = this.data.definitions || {};

    this.parser = new Parser(
      this.data.schema,
      this.injector,
      this.state,
      this.role,
      definitions,
      {
        ...this.customFields || {},
        ...this.ctx.fields
      }
    );

    this.form = this.parser.buildForm(
      value,
      null,
      '/',
      false
    );

    this.parser.loadHooks();

    this.segments = filterAndCompileSegments(
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

    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }

    this.changeSubscription = this.form.valueChanges
      .subscribe(val => {
        this.valueChanges.emit(val);
      });

    this.statusSubscription = this.form.statusChanges
      .subscribe(val => {
        this.validityChanges.emit(val === 'VALID');
      });

    this.cdr.markForCheck();
  }
}
