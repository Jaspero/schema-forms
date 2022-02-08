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
import {State} from './enums/state.enum';
import {FormBuilderService} from './form-builder.service';
import {CompiledSegment} from './interfaces/compiled-segment.interface';
import {FormBuilderData} from './interfaces/form-builder-data.interface';
import {GlobalState} from './interfaces/global-state.interface';
import {DEFAULT_SEGMENT} from './utils/default-segment';
import {filterAndCompileSegments} from './utils/filter-and-compile-segments';
import {Parser} from './utils/parser';
import {ROLE} from './utils/role';

declare const window: Window & {jpFb: GlobalState};

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
    @Inject(DEFAULT_SEGMENT)
    private defaultSegment: string,
    private cdr: ChangeDetectorRef
  ) { }

  @Input() data: FormBuilderData;
  @Input() value: any;
  @Input() id = 'main';
  @Input() parser: Parser;
  @Input() state: State = State.Create;
  @Input() metadata: any;

  @Output() valueChanges = new EventEmitter<any>();
  @Output() validityChanges = new EventEmitter<boolean>();

  form: FormGroup;
  segments: CompiledSegment[];

  private innerParser: Parser;
  private changeSubscription: Subscription;
  private statusSubscription: Subscription;

  ngOnChanges(changes: SimpleChanges) {

    /**
     * In case the provider is provided internally
     * and the id has changed we delete it here
     * before going in to rendering to force the
     * creation of a new parser
     */
    if (changes.id.currentValue !== changes.id.previousValue) {
      delete this.innerParser;
    }

    if (changes.parser.currentValue) {
      this.innerParser = changes.parser.currentValue;
    }

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

    try {
      delete window.jpFb.forms[this.id];
      delete window.jpFb.parsers[this.id];
    } catch (e) {}
  }

  process() {
    this.innerParser.preSaveHooks(
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

  validate(data: FormBuilderData) {
    this.data = data;
    try {
      this.render();
      return {
        error: false,
        message: ''
      };
    } catch(error) {
      return {
        error: true,
        message: error.message || 'Invalid Schema provided!'
      };
    }
  }

  private render() {
    const value = this.data.value || {};
    const definitions = this.data.definitions || {};

    if (!this.innerParser) {
      this.innerParser = new Parser(
        this.data.schema,
        this.injector,
        this.state,
        this.role,
        definitions
      );

      this.form = this.innerParser.buildForm(
        value,
        null,
        '/',
        false
      );
    } else {
      this.form = this.innerParser.form;
    }

    if (!window.jpFb) {
      window.jpFb = {
        forms: {},
        parsers: {}
      }
    }

    window.jpFb.forms[this.id] = this.form;
    window.jpFb.parsers[this.id] = this.innerParser;

    this.innerParser.loadHooks();

    this.segments = filterAndCompileSegments(
      this.data.segments ||
      [{
        title: '',
        fields: Object.keys(this.innerParser.pointers),
        columnsDesktop: 12,
        type: this.defaultSegment || 'empty'
      }],
      this.innerParser,
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
