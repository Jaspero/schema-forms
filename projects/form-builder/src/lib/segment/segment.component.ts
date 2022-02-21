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
import {Parser, Pointers} from '../utils/parser';

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

    // return (this.pointers[this.sData.parent] as any).arrayPointers.indexOf(this.pointer);

    return this.sData.parser.parent.pointers[this.sData.parent].arrayPointers.indexOf(this.pointers);
  }

  ngOnInit() {
    this.segment = this.sData.segment;
    this.arrayConfiguration = {
      add: true,
      remove: true,
      sort: true,
      ...this.segment.arrayConfiguration || {}
    };
    this.classes = this.sData.segment.classes.join(' ');
    this.pointers = this.sData.parser.pointers;
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
    reverse = true,
    index?: number
  ) {
    const operation = reverse ? 'unshift' : 'push';
    const array = this.segment.array as string;
    // const pointers: any = this.sData.parser.addArrayItem(
    //   (this.sData.parent || '') + array,
    //   loadHook,
    //   this.sData.parent ? {
    //     pointer: this.sData.parent,
    //     index: this.sData.index || 0
    //   } : undefined,
    //   undefined,
    //   reverse
    // );

    // const fields = this.generateArrayFields(
    //   array,
    //   pointers
    // );

    // this.arrayFields[operation](fields);

    // this.nestedArraySegments[operation](
    //   filterAndCompileSegments({
    //     segments: this.sData.segment.nestedSegments || [],
    //     parser: this.sData.parser,
    //     definitions: this.sData.definitions,
    //     injector: this.injector,
    //     ...index !== undefined && {value: this.segment.entryValue},
    //     parent: this.segment.array,
    //     index: index || (reverse ? 0 : this.nestedArraySegments.length),
    //     formId: this.sData.formId,
    //     parentForm: this.sData.parentForm
    //   })
    // );
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
        index: this.parentIndex
      } : undefined
    );
  }

  removeArrayItem(index: number) {
    this.sData.parser.removeArrayItem(
      (this.sData.parent || '') + this.segment.array as string,
      index,
      this.sData.parent ? {
        pointer: this.sData.parent,
        index: this.parentIndex
      } : undefined
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

    // console.log({
    //   pointers: this.pointers,
    //   array,
    //   arrayPointer,
    //   parent: this.sData.parent,
    //   index: this.sData.index,
    //   entry: this.segment.entryValue
    // });

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

        const pointers = this.pointers[(this.sData.parent || '') + segment.array].arrayPointers[index];
        const parser = this.sData.parser.copy({pointers});
        const fields = this.generateArrayFields(pointers, segment);

        arrayFields.push(fields);

        nestedArraySegments.push(
          filterAndCompileSegments({
            segments: this.sData.segment.nestedSegments || [],
            parser,
            definitions: this.sData.definitions,
            injector: this.injector,
            value,
            parent: (this.sData.parent || '') + segment.array,
            index,
            formId: this.sData.formId,
            parentForm: this.sData.parentForm
          })
        );
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
}
