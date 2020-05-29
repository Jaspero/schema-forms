import {Component, HostBinding, Inject, Injector, OnInit, Optional} from '@angular/core';
import {FormControl} from '@angular/forms';
import {get} from 'json-pointer';
import {CompiledField} from '../interfaces/compiled-field.interface';
import {CompiledSegment} from '../interfaces/compiled-segment.interface';
import {Definitions} from '../interfaces/definitions.interface';
import {SEGMENT_DATA} from '../utils/create-segment-injector';
import {filterAndCompileSegments} from '../utils/filter-and-compile-segments';
import {Parser, Pointers} from '../utils/parser';
import {ROLE} from '../utils/role';

export interface SegmentData {
  segment: CompiledSegment;
  parser: Parser;
  definitions: Definitions;
}

@Component({
  selector: 'fb-segment',
  template: ''
})
export class SegmentComponent<T = any> implements OnInit {
  constructor(
    @Inject(SEGMENT_DATA) public sData: SegmentData,
    public injector: Injector,
    @Optional()
    @Inject(ROLE)
    public role: string
  ) {}

  segment: CompiledSegment<T>;
  pointers: Pointers;
  nestedSegments: CompiledSegment<T>[];
  arrayFields: Array<CompiledField[]> = [];

  @HostBinding('class')
  classes: string;

  @HostBinding('id')
  id: string;

  ngOnInit() {
    this.segment = this.sData.segment;
    this.classes = this.sData.segment.classes.join(' ');
    this.pointers = this.sData.parser.pointers;
    this.id = this.sData.segment.id || '';

    /**
     * Each segment compiles all nested segments
     */
    this.nestedSegments = filterAndCompileSegments(
      this.role,
      this.sData.segment.nestedSegments || [],
      this.sData.parser,
      this.sData.definitions,
      this.injector,
      this.segment.entryValue
    );

    const array = this.segment.array as string;

    /**
     * Add array items if necessary
     */
    if (array && this.segment.entryValue) {
      let values;

      try {
        values = get(this.segment.entryValue, array);
      } catch (e) {}

      if (values) {
        values.forEach(() => this.addArrayItem(false));

        (this.pointers[array].control as FormControl).patchValue(
          values
        );

        for (let i = 0; i < values.length; i++) {
          // @ts-ignore
          this.sData.parser.loadHooks(this.pointers[array].arrayPointers[i]);
        }
      }
    }
  }

  addArrayItem(loadHook = true) {
    const array = this.segment.array as string;
    this.sData.parser.addArrayItem(array, loadHook);

    const arrayPointers = this.pointers[array].arrayPointers as Pointers[];

    this.arrayFields.unshift(
      Object.entries(arrayPointers[0])
        .map(
          ([key, pointer]) =>
            this.sData.parser.field(
              key,
              pointer,
              this.sData.definitions,
              true,
              array
            )
        )
        .sort((a, b) => {
          const originalIndexA = (this.segment.fields || []).findIndex(fi => fi === a.pointer);
          const originalIndexB = (this.segment.fields || []).findIndex(fi => fi === b.pointer);

          return originalIndexA - originalIndexB;
        })
    );
  }

  removeArrayItem(index: number) {
    this.sData.parser.removeArrayItem(this.segment.array as string, index);
    this.arrayFields.splice(index, 1);
  }
}
