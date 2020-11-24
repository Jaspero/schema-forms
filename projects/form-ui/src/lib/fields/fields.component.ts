import {CdkDragMove, CdkDropList, CdkDropListGroup, moveItemInArray} from '@angular/cdk/drag-drop';
import {ViewportRuler} from '@angular/cdk/overlay';
import {ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {COMPONENT_DATA, FieldComponent, FieldData} from '@jaspero/form-builder';
import {Subscription} from 'rxjs';
import {TYPES} from '../consts/types.const';

interface Field {
  id: string;
  type: string;
  label?: string;
  columnsDesktop?: number;
  columnsTablet?: number;
  columnsMobile?: number;
  hint?: string;
  required?: boolean;
  placeholder?: string;

  options?: Array<{value: string; label: string;}>;
  value?: any;
}

interface FieldsData extends FieldData {
  types: string[];
}

@Component({
  selector: 'fb-fu-fields',
  templateUrl: './fields.component.html',
  styleUrls: ['./fields.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldsComponent extends FieldComponent<FieldsData> implements OnInit, OnDestroy {
  constructor(
    @Inject(COMPONENT_DATA)
    public cData: FieldsData,
    private fb: FormBuilder,
    private viewportRuler: ViewportRuler,
  ) {
    super(cData);
  }

  @ViewChild('text', {static: true}) textField: TemplateRef<any>;
  @ViewChild('number', {static: true}) numberField: TemplateRef<any>;
  @ViewChild('email', {static: true}) emailField: TemplateRef<any>;
  @ViewChild('textarea', {static: true}) textareaField: TemplateRef<any>;
  @ViewChild('select', {static: true}) selectField: TemplateRef<any>;
  @ViewChild('checkbox', {static: true}) checkboxField: TemplateRef<any>;

  /**
   * Drag and Drop
   */
  @ViewChild(CdkDropListGroup, {static: true})
  listGroup: CdkDropListGroup<CdkDropList>;
  @ViewChild(CdkDropList, {static: true})
  placeholder: CdkDropList;
  activeContainer: any;
  target: CdkDropList | null;
  targetIndex: number;
  source: CdkDropList | null;
  sourceIndex: number;

  fields: FormArray;
  types: {
    [key: string]: {
      value: string;
      template: TemplateRef<any>;
    }
  };

  selectedForm: FormGroup;

  subscription: Subscription;

  ngOnInit() {
    const {types} = this.cData;

    this.types = (types || TYPES.map(it => it.value)).reduce((acc, cur) => {

      const type = TYPES.find(t => t.value === cur);

      if (type) {
        acc[cur] = {
          ...type,
          template: this[`${cur}Field`]
        }
      }

      return acc;
    }, {});

    this.fields = new FormArray(
      (this.cData.control.value || [])
        .map(it => this.createField(it))
    );

    this.subscription.add(
      this.fields.valueChanges
        .subscribe(value => {
          this.cData.control.setValue(value);
        })
    )
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  createField(field: Partial<Field> = {}) {

    const group = this.fb.group({
      id: [field.id || '', Validators.required],
      type: field.type || this.types[0].value,
      label: field.label || '',
      columnsDesktop: field.columnsDesktop || 12,
      columnsTablet: field.columnsTablet || 12,
      columnsMobile: field.columnsMobile || 12,
      hint: field.hint || '',
      required: field.required || false,
      placeholder: field.placeholder || '',
      value: field.value || ''
    });

    this.subscription.add(
      group
        .get('type')?.valueChanges
        .subscribe(type => {

        })
    );

    return group;
  }

  edit(group: FormGroup) {
    this.selectedForm = group;
  }

  /**
   * Drag and Drop
   */
  dragMoved(e: CdkDragMove) {
    const point = this.getPointerPositionOnPage(e.event);

    this.listGroup._items.forEach(dropList => {
      if (__isInsideDropListClientRect(dropList, point.x, point.y)) {
        this.activeContainer = dropList;
        return;
      }
    });
  }

  dropListDropped() {
    if (!this.target) {
      return;
    }

    const phElement = this.placeholder.element.nativeElement;
    const parent: any = phElement.parentElement;

    phElement.style.display = 'none';

    const {element} = this.source as any;

    parent.removeChild(phElement);
    parent.appendChild(phElement);
    parent.insertBefore(element.nativeElement, parent.children[this.sourceIndex]);

    this.target = null;
    this.source = null;

    if (this.sourceIndex !== this.targetIndex) {
      const value = this.cData.control.value;
      moveItemInArray(value, this.sourceIndex, this.targetIndex);
      this.cData.control.setValue(value);
    }
  }

  /** Determines the point of the page that was touched by the user. */
  getPointerPositionOnPage(event: MouseEvent | TouchEvent) {
    // `touches` will be empty for start/end events so we have to fall back to `changedTouches`.
    const point = __isTouchEvent(event) ? (event.touches[0] || event.changedTouches[0]) : event;
    const scrollPosition = this.viewportRuler.getViewportScrollPosition();

    return {
      x: point.pageX - scrollPosition.left,
      y: point.pageY - scrollPosition.top
    };
  }
}

/** Determines whether an event is a touch event. */
function __isTouchEvent(event: MouseEvent | TouchEvent): event is TouchEvent {
  return event.type.startsWith('touch');
}

function __isInsideDropListClientRect(dropList: CdkDropList, x: number, y: number) {
  const {top, bottom, left, right} = dropList.element.nativeElement.getBoundingClientRect();
  return y >= top && y <= bottom && x >= left && x <= right;
}
