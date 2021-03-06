import {moveItemInArray} from '@angular/cdk/drag-drop';
import {ComponentPortal} from '@angular/cdk/portal';
import {Component, HostBinding, Inject, Injector, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {get} from 'json-pointer';
import {CustomComponent} from '../custom/custom.component';
import {CompiledField, Condition} from '../interfaces/compiled-field.interface';
import {CompiledSegment} from '../interfaces/compiled-segment.interface';
import {Definitions} from '../interfaces/definitions.interface';
import {SEGMENT_DATA} from '../utils/create-segment-injector';
import {filterAndCompileSegments} from '../utils/filter-and-compile-segments';
import {Parser, Pointer, Pointers} from '../utils/parser';
import {safeEval} from '../utils/safe-eval';

export interface SegmentData {
  segment: CompiledSegment;
  parser: Parser;
  definitions: Definitions;
  parent?: string;
  index?: number;
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
  pointer: Pointer;
  nestedSegments: CompiledSegment<T>[];
  nestedArraySegments: Array<CompiledSegment[]> = [];
  arrayFields: Array<CompiledField[]> = [];
  components: ComponentPortal<CustomComponent>[];

  @HostBinding('class')
  classes: string;

  @HostBinding('id')
  id: string;

  get parentIndex() {
    if (!this.sData.parent) {
      return 0;
    }

    return (this.pointers[this.sData.parent] as any).arrayPointers.indexOf(this.pointer);
  }

  ngOnInit() {
    this.segment = this.sData.segment;
    this.classes = this.sData.segment.classes.join(' ');
    this.pointers = this.sData.parser.pointers;
    this.id = this.sData.segment.id || '';
    this.components = this.segment.customComponents || [];
    this.pointer = this.sData.parent ?
      (this.pointers[this.sData.parent] as any).arrayPointers[this.sData.index as number] :
      this.pointers as any;

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

    const array = ((this.sData.parent || '') + this.segment.array) as string;
    const arrayPointer = this.sData.index !== undefined ?
      ((this.sData.parent as string) + '/' + this.sData.index + this.segment.array) :
      array;

    /**
     * Add array items if necessary
     */
    if (array && this.segment.entryValue) {
      let values;

      try {
        values = get(this.segment.entryValue, arrayPointer);
      } catch (e) {}

      if (values) {
        values.forEach((v, i) => this.addArrayItem(false, false, i));

        const pointer = this.pointer[array] as any;

          (pointer.control as FormControl).patchValue(
            values
          );

        for (let i = 0; i < values.length; i++) {
          // @ts-ignore
          this.sData.parser.loadHooks(pointer.arrayPointers[i]);
        }
      }
    }
  }

  addArrayItem(
    loadHook = true,
    reverse = true,
    index?: number
  ) {
    const operation = reverse ? 'unshift' : 'push';
    const array = this.segment.array as string;
    const pointers: any = this.sData.parser.addArrayItem(
      (this.sData.parent || '') + array,
      loadHook,
      this.sData.parent ? {
        pointer: this.sData.parent,
        index: this.sData.index || 0
      } : undefined
    );

    let fields: CompiledField[];

    if (this.segment.fields && this.segment.fields.length) {
      fields = (this.segment.fields as Array<string | Condition>).map((keyObject) => {
        let condition: any;
        let key: string;

        if (keyObject?.constructor === Object) {

          const {field, action, deps} = keyObject as any;

          condition = {field};

          switch (action?.constructor) {
            case Object:
              condition.action = [action];
              break;
            case Array:
              condition.action = action;
              break;
            default:
              condition.action = [{}];
              break;
          }

          condition.action.forEach((item) => {
            item.type = item.type || 'show';
            item.eval = safeEval(item.function) || null;
          });
          condition.deps = deps || [];

          key = (this.sData.parent || '') + field;
        } else {
          key = (this.sData.parent || '') + (keyObject as string);
        }

        return this.sData.parser.field(
          key,
          pointers[key],
          this.sData.definitions,
          true,
          array,
          condition
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

    this.arrayFields.unshift(fields);

    this.nestedArraySegments[operation](
      filterAndCompileSegments(
        this.sData.segment.nestedSegments || [],
        this.sData.parser,
        this.sData.definitions,
        this.injector,
        index !== undefined ? this.segment.entryValue : undefined,
        this.segment.array,
        index || (reverse ? 0 : this.nestedArraySegments.length)
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
}
