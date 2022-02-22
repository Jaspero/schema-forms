import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
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
import {get} from 'json-pointer';
import {map, of, Subscription, switchMap} from 'rxjs';
import {State} from './enums/state.enum';
import {FormBuilderService} from './form-builder.service';
import {CompiledSegment} from './interfaces/compiled-segment.interface';
import {FormBuilderData} from './interfaces/form-builder-data.interface';
import {GlobalState, Operation} from './interfaces/global-state.interface';
import {DEFAULT_SEGMENT} from './utils/default-segment';
import {filterAndCompileSegments} from './utils/filter-and-compile-segments';
import {Parser} from './utils/parser';
import {ROLE} from './utils/role';

declare global {
  interface Window {
    // @ts-ignore
    jpFb: GlobalState;
  }
}
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
  @Input() parser: Parser;
  @Input() state: State = State.Create;

  @HostBinding('id')
  @Input() id = 'jp-fb-main';

  /**
   * Used when child forms are rendered in parent
   */
  @Input() parent: {
    id: string;
    pointer: string;
  };

  @Output() valueChanges = new EventEmitter<any>();
  @Output() validityChanges = new EventEmitter<boolean>();

  form: FormGroup;
  segments: CompiledSegment[];
  innerParser: Parser;

  private changeSubscription: Subscription;
  private statusSubscription: Subscription;

  ngOnChanges(changes: SimpleChanges) {

    /**
     * In case the provider is provided internally
     * and the id has changed we delete it here
     * before going in to rendering to force the
     * creation of a new parser
     */
    if (changes.id && (changes.id.currentValue !== changes.id.previousValue)) {
      delete this.innerParser;
    }

    if (changes.parser?.currentValue) {
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
      delete window.jpFb.operations[this.id];
    } catch (e) { }
  }

  process() {
    this.innerParser.preSaveHooks(
      this.state
    );

    return this.form.getRawValue();
  }

  save(collectionId: string, documentId: string) {

    const data = this.form.getRawValue();

    /**
     * Child forms processes are run on save
     * of the parent form
     */
    if (this.parent) {
      return of(data);
    }

    const processes = Object.entries<Operation>(window.jpFb.operations[this.id])
      .sort((p1, p2) => p1[1].priority - p2[1].priority)
      .filter(process => process[1].save);

    if (!processes.length) {
      return of(data);
    }


    const operations = [
      ...processes.map(([pointer, process]) =>
        switchMap(() => process.save({
          cData: process.cData,
          pointer,
          collectionId,
          documentId,
          entryValue: this.value,
          outputValue: data
        }))
      ),
      map(() => data)
    ]

    return (of(data).pipe as any)(...operations)
  }

  saveAndProcess(collectionId: string, documentId: string) {
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
    } catch (error) {
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
        assignOperation: config => {
          const {cData, ...operation} = config;
          const parentForm = cData.parentForm || {} as any;
          const formId = parentForm?.id || cData.formId || 'jb-fb-main';
          const path = parentForm?.pointer ?
            (parentForm.pointer + cData.pointer) :
            cData.pointer;

          window.jpFb.operations[formId][path] = {
            priority: 1,
            cData,
            ...operation
          };
        },
        exists: config => {
          let value: any;

          try {
            value = get(config.outputValue, config.pointer);
          } catch (e) {
            return {exists: false};
          }

          return {value, exists: true};
        },
        change: (config) => {
          if (!config.entryValue) {
            return true;
          }

          let originalValue: any;

          try {
            originalValue = get(config.entryValue, config.pointer);
          } catch (e) {
            return true;
          }

          let currentValue: any;

          try {
            currentValue = get(config.outputValue, config.pointer);
          } catch (e) {
            return false;
          }

          return currentValue !== originalValue;
        },
        forms: {},
        parsers: {},
        operations: {}
      }
    }

    window.jpFb.forms[this.id] = this.form;
    // @ts-ignore
    window.jpFb.parsers[this.id] = this.innerParser;

    /**
     * Child forms push operations to their parent form
     */
    if (!this.parent) {
      window.jpFb.operations[this.id] = {};
    }

    this.innerParser.loadHooks();

    this.segments = filterAndCompileSegments({
      segments: this.data.segments || [{
        title: '',
        fields: Object.keys(this.innerParser.pointers),
        columnsDesktop: 12,
        type: this.defaultSegment || 'empty'
      }],
      parser: this.innerParser,
      definitions,
      injector: this.injector,
      value,
      formId: this.id,
      parentForm: this.parent
    });

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
