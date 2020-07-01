import {moveItemInArray} from '@angular/cdk/drag-drop';
import {Component, HostBinding, Inject, Injector, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {get} from 'json-pointer';
import {CompiledField} from '../interfaces/compiled-field.interface';
import {CompiledSegment} from '../interfaces/compiled-segment.interface';
import {Definitions} from '../interfaces/definitions.interface';
import {SEGMENT_DATA} from '../utils/create-segment-injector';
import {filterAndCompileSegments} from '../utils/filter-and-compile-segments';
import {Parser, Pointers} from '../utils/parser';

export interface SegmentData {
  segment: CompiledSegment;
  parser: Parser;
  definitions: Definitions;
  parent?: string;
}

@Component({
  selector: 'fb-segment',
  template: ''
})
export class SegmentComponent<T = any> implements OnInit {
  constructor(
    @Inject(SEGMENT_DATA) public sData: SegmentData,
    public injector: Injector
  ) {}

  segment: CompiledSegment<T>;
  pointers: Pointers;
  nestedSegments: CompiledSegment<T>[];
  nestedArraySegments: Array<CompiledSegment[]> = [];
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
    const pointers: any = this.sData.parser.addArrayItem(
      (this.sData.parent || '') + array,
      loadHook,
      this.sData.parent ? {
        pointer: this.sData.parent,
        index: 0
      } : undefined
    );

    let fields: CompiledField[];

    if (this.segment.fields && this.segment.fields.length) {
      fields = (this.segment.fields as string[]).map(key => {

        key = (this.sData.parent || '') + key;

        return this.sData.parser.field(
          key,
          pointers[key],
          this.sData.definitions,
          true,
          array
        );
      });
    } else {
      fields = [this.sData.parser.field(
        array,
        {
          ...this.pointers[array],
          control: pointers
        },
        this.sData.definitions
      )];
    }

    this.arrayFields.unshift(
      fields
    );

    this.nestedArraySegments.unshift(
      this.nestedSegments = filterAndCompileSegments(
        this.sData.segment.nestedSegments || [],
        this.sData.parser,
        this.sData.definitions,
        this.injector,
        this.segment.entryValue,
        this.segment.array
      )
    );
  }

  moveArray(up: boolean, fromIndex: number) {
    let toIndex: number;

    if (up) {
      toIndex = fromIndex === 0 ? this.arrayFields.length - 1 : fromIndex - 1;
    } else {
      toIndex = fromIndex === (this.arrayFields.length - 1) ? 0 : fromIndex + 1;
    }

    moveItemInArray(
      this.arrayFields,
      fromIndex,
      toIndex
    );

    moveItemInArray(
      this.nestedArraySegments,
      fromIndex,
      toIndex
    );

    this.sData.parser.moveArrayItem(
      (this.sData.parent || '') + this.segment.array as string,
      fromIndex,
      toIndex,
      this.sData.parent ? {
        pointer: this.sData.parent,
        index: 0
      } : undefined
    );
  }

  removeArrayItem(index: number) {
    this.sData.parser.removeArrayItem(
      (this.sData.parent || '') + this.segment.array as string,
      index,
      this.sData.parent ? {
        pointer: this.sData.parent,
        index: 0
      } : undefined
    );
    this.nestedArraySegments.splice(index, 1);
    this.arrayFields.splice(index, 1);
  }
}
