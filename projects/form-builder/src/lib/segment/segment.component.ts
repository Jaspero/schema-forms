import {moveItemInArray} from '@angular/cdk/drag-drop';
import {ComponentPortal} from '@angular/cdk/portal';
import {Component, HostBinding, Inject, Injector, OnInit} from '@angular/core';
import {get, has} from 'json-pointer';
import {CustomComponent} from '../custom/custom.component';
import {SEGMENT_DATA} from '../injection-tokens/segment-data.token';
import {CompiledField} from '../interfaces/compiled-field.interface';
import {CompiledSegment} from '../interfaces/compiled-segment.interface';
import {Definitions} from '../interfaces/definitions.interface';
import {ArrayConfiguration} from '../interfaces/segment.interface';
import {compileFields} from '../utils/compile-fields';
import {filterAndCompileSegments} from '../utils/filter-and-compile-segments';
import {Parser, Pointer, Pointers} from '../utils/parser';

export interface SegmentData {
  segment: CompiledSegment;
  parser: Parser;
  definitions: Definitions;
  parent?: string;
  index?: number;
  formId?: string;
  parentForm?: {
    id: string;
    pointer: string;
  };
}

@Component({
  selector: 'fb-segment',
  template: ''
})
export class SegmentComponent<T = any> implements OnInit {
  constructor(
    @Inject(SEGMENT_DATA) public sData: SegmentData,
    public injector: Injector
  ) { }

  segment: CompiledSegment<T>;
  arrayConfiguration: ArrayConfiguration;
  pointers: Pointers;
  arrayPointer: Pointer;
  nestedSegments: CompiledSegment<T>[];
  nestedArraySegments: Array<CompiledSegment[]> = [];
  arrayFields: Array<CompiledField[]> = [];
  components: ComponentPortal<CustomComponent>[];

  @HostBinding('class') classes: string;
  @HostBinding('id') id: string;

  get parentIndex() {
    if (!this.sData.parent) {
      return 0;
    }

    return this.sData.parser.parent.pointers[this.sData.parent].arrayPointers.indexOf(this.pointers);
  }

  ngOnInit() {
    this.segment = this.sData.segment;
    this.arrayConfiguration = {
      add: true,
      remove: true,
      sort: true,
      reverse: true,
      ...this.segment.arrayConfiguration || {}
    };
    this.classes = this.sData.segment.classes.join(' ');
    this.pointers = this.sData.parser.pointers;
    this.arrayPointer = this.pointers[(this.sData.parent || '') + this.segment.array];
    this.id = this.sData.segment.id || '';
    this.components = this.segment.customComponents || [];

    /**
     * Each segment compiles all nested segments
     */
    this.nestedSegments = this.compileNestedSegments(this.sData.segment.nestedSegments);

    const {arrayFields, nestedArraySegments} = this.populateArrayFields(this.segment);

    this.arrayFields = arrayFields;
    this.nestedArraySegments = nestedArraySegments;
  }

  addArrayItem(
    loadHook = true,
    index?: number
  ) {
    const operation = this.arrayConfiguration.reverse ? 'unshift' : 'push';
    // debugger;
    const {arrayFields, nestedArraySegments} = this.generateArrayFieldsAndSegments(
      index || (this.arrayConfiguration.reverse ? 0 : this.nestedArraySegments.length),
      this.segment,
      this.sData.parser.addArrayItem(
        (this.sData.parent || '') + this.segment.array,
        this.arrayPointer,
        loadHook,
        this.arrayConfiguration.reverse
      )
    )

    this.arrayFields[operation](arrayFields);
    this.nestedArraySegments[operation](nestedArraySegments);
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
      this.arrayPointer,
      fromIndex,
      toIndex
    );
  }

  removeArrayItem(index: number) {
    this.sData.parser.removeArrayItem(
      this.arrayPointer,
      index,
    );
    this.nestedArraySegments.splice(index, 1);
    this.arrayFields.splice(index, 1);
  }

  generateArrayFields(pointers: any, segment: CompiledSegment<T> = this.segment) {

    if (!segment.fields?.length) {
      return [];
    }

    return compileFields({
      parser: this.sData.parser,
      definitions: this.sData.definitions,
      fields: segment.fields,
      pointers,
      mutateKey: key => (this.sData.parent || '') + key,
      formId: this.sData.formId,
      parentForm: this.sData.parentForm,
    });
  }

  compileNestedSegments(segments: CompiledSegment<T>[]) {

    let parser = this.sData.parser;

    if (this.sData.parent) {
      parser = parser.copy({
        pointers: this.pointers[this.sData.parent + this.sData.segment.array].arrayPointers[this.sData.index as number]
      })
    }

    return filterAndCompileSegments({
      segments: (segments || []).map(item => {
        if (!item.classes?.length) {
          item.classes = ['fb-field-12'];
        }

        return item;
      }) || [],
      parser,
      definitions: this.sData.definitions,
      injector: this.injector,
      value: this.segment.entryValue,
      formId: this.sData.formId,
      parentForm: this.sData.parentForm
    })
  }

  populateArrayFields(segment: CompiledSegment<T>) {
    const arrayFields: Array<CompiledField[]> = [];
    const nestedArraySegments: Array<CompiledSegment[]> = [];

    /**
     * Populate array fields
     */
    if (
      segment.array &&
      this.segment.entryValue &&
      has(this.segment.entryValue, segment.array)
    ) {

      const values = get(this.segment.entryValue, segment.array);

      values.forEach((value, index) => {
        const generated = this.generateArrayFieldsAndSegments(index, segment, undefined, value);

        arrayFields.push(generated.arrayFields);
        nestedArraySegments.push(generated.nestedArraySegments);
      });

      for (let i = 0; i < values.length; i++) {
        const pointers = (this.pointers[(this.sData.parent || '') + segment.array] as any).arrayPointers[i];
        this.sData.parser.loadHooks(pointers);
      }
    }

    return {
      arrayFields,
      nestedArraySegments
    }
  }

  generateArrayFieldsAndSegments(
    index: number,
    segment: CompiledSegment<T>,
    pointers?: Pointers,
    value?: any
  ) {

    if (!pointers) {
      pointers = this.pointers[(this.sData.parent || '') + segment.array].arrayPointers[index];
    }

    const parser = this.sData.parser.copy({pointers});
    const arrayFields = this.generateArrayFields(pointers, segment);
    const nestedArraySegments =  filterAndCompileSegments({
      segments: this.sData.segment.nestedSegments || [],
      parser,
      definitions: this.sData.definitions,
      injector: this.injector,
      ...value && {value},
      parent: (this.sData.parent || '') + segment.array,
      index,
      formId: this.sData.formId,
      parentForm: this.sData.parentForm
    })

    return {arrayFields, nestedArraySegments};
  }
}
