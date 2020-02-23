import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Injector,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {SegmentType} from './enums/segment-type.enum';
import {CompiledSegment} from './interfaces/compiled-segment.interface';
import {FormBuilderData} from './interfaces/form-builder-data.interface';
import {State} from './interfaces/state.interface';
import {filterAndCompileSegments} from './utils/filter-and-compile-segments';
import {Parser} from './utils/parser';
import {ROLE} from './utils/role';

@Component({
  selector: 'fb-form-builder',
  templateUrl: './form-builder.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormBuilderComponent implements OnChanges {
  constructor(
    private injector: Injector,
    @Inject(ROLE)
    private role: string,
    private cdr: ChangeDetectorRef
  ) { }

  @Input()
  data: FormBuilderData;

  @Input()
  value: any;

  @Input()
  id: string;

  @Input()
  state: State = State.Create;

  form: FormGroup;
  parser: Parser;
  segments: CompiledSegment[];

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data) {
      this.render();
    }

    if (changes.value && this.form) {
      this.form.patchValue(changes.value.currentValue);
    }
  }

  private render() {
    const value = this.data.value || {};
    const definitions = this.data.definitions || {};

    this.parser = new Parser(
      this.data.schema,
      this.injector,
      this.state,
      definitions
    );

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

    this.cdr.markForCheck();
  }
}
