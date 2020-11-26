import {CdkDragMove, CdkDropList, CdkDropListGroup, moveItemInArray} from '@angular/cdk/drag-drop';
import {ViewportRuler} from '@angular/cdk/overlay';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {COMPONENT_DATA, FieldComponent, FieldData, FormBuilderComponent, FormBuilderData, SegmentType} from '@jaspero/form-builder';
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
  added?: any;
  value?: any;
}

interface FieldsData extends FieldData {
  types: string[];
}

@Component({
  selector: 'fb-fu-fields',
  templateUrl: './fields.component.html',
  styleUrls: ['./fields.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldsComponent extends FieldComponent<FieldsData> implements OnInit, OnDestroy {
  constructor(
    @Inject(COMPONENT_DATA)
    public cData: FieldsData,
    private fb: FormBuilder,
    private viewportRuler: ViewportRuler,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
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

  @ViewChild('optionsDialog', {static: true})
  optionsDialogTemp: TemplateRef<any>;

  @ViewChild('editDialog', {static: true})
  editDialogTemp: TemplateRef<any>;

  @ViewChild('sizesDialog', {static: true})
  sizesDialogTemp: TemplateRef<any>;

  fields: FormArray;
  types: {
    [key: string]: {
      value: string;
      template: TemplateRef<any>;
      default: any;
      added?: FormBuilderData;
    }
  };
  sizes: number[] = [];

  selectedForm: FormGroup;
  sizeForm: FormGroup;
  selectedFormData: FormBuilderData;
  subscription: Subscription;

  ngOnInit() {
    const {types} = this.cData;

    for (let i = 1; i <= 12; i++) {
      this.sizes.push(i);
    }

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

    this.subscription =
      this.fields.valueChanges
        .subscribe(value => {
          this.cData.control.setValue(value);
        })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  fieldSize(group: FormGroup) {
    const {columnsDesktop, columnsTablet, columnsMobile} = group.getRawValue();

    return [
      `field-col-${columnsDesktop}`,
      `field-col-${columnsTablet}-md`,
      `field-col-${columnsMobile}-sm`,
    ].join(' ')
  }

  createField(field?: Partial<Field>) {

    const type = field?.type || Object.keys(this.types)[0];

    field = (field || this.types[type].default || {}) as Partial<Field>;

    return this.fb.group({
      id: [field.id || type, Validators.required],
      type,
      label: field.label || '',
      columnsDesktop: field.columnsDesktop || 12,
      columnsTablet: field.columnsTablet || 12,
      columnsMobile: field.columnsMobile || 12,
      hint: field.hint || '',
      required: field.required || false,
      placeholder: field.placeholder || '',
      value: field.value || '',
      added: [field.added ? field.added : {}]
    });
  }

  edit(group: FormGroup) {
    this.selectedForm = group;
    this.selectedFormData = {
      segments: [{
        type: SegmentType.Empty,
        fields: [
          '/id',
          '/label',
          '/hint',
          '/placeholder'
        ]
      }],
      definitions: {
        id: {label: 'FU.ID'},
        label: {label: 'FU.LABEL'},
        hint: {label: 'FU.HINT'},
        placeholder: {label: 'FU.PLACEHOLDER'}
      },
      schema: {
        properties: {
          id: {type: 'string'},
          label: {type: 'string'},
          hint: {type: 'string'},
          placeholder: {type: 'string'},
        }
      },
      value: group.getRawValue()
    };

    this.dialog.open(
      this.editDialogTemp,
      {
        width: '700px'
      }
    )
  }

  options(group: FormGroup) {
    this.selectedFormData = this.types[group.get('type')?.value] as any;
    this.selectedFormData.value = group.get('added')?.value || {};
    this.selectedForm = group;

    this.dialog.open(
      this.optionsDialogTemp,
      {
        width: '700px'
      }
    )
  }

  openSizes(group: FormGroup) {
    const {
      columnsDesktop,
      columnsMobile,
      columnsTablet
    } = group.getRawValue();

    this.selectedForm = group;
    this.sizeForm = this.fb.group({
      columnsDesktop,
      columnsMobile,
      columnsTablet
    });

    this.dialog.open(
      this.sizesDialogTemp,
      {
        width: '700px'
      }
    )
  }

  saveSize() {
    [
      'columnsDesktop',
      'columnsMobile',
      'columnsTablet'
    ].forEach(key => {
      const newValue = this.sizeForm.get(key)?.value;
      const oldValue = this.selectedForm.get(key)?.value;

      if (newValue !== oldValue) {
        this.selectedForm.get(key)?.setValue(newValue);
      }
    })

    this.dialog.closeAll();
    this.cdr.markForCheck();
  }

  saveEdit(form: FormBuilderComponent) {
    const data = form.form.getRawValue();

    // tslint:disable-next-line:forin
    for (const key in data) {
      this.selectedForm.get('key')?.setValue(data[key]);
    }

    this.dialog.closeAll();
  }

  saveOptions(form: FormBuilderComponent) {
    this.selectedForm.get('added')?.setValue(form.form.getRawValue());
    this.dialog.closeAll();
  }

  updateType(group: FormGroup, type: string) {
    group.get('added')?.setValue({...this.types[type].default?.added || {}});
    group.get('type')?.setValue(type);
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
    // if (!this.target) {
    //   return;
    // }

    const phElement = this.placeholder.element.nativeElement;
    const parent: any = phElement.parentElement;

    phElement.style.display = 'none';

    const {element} = this.source as any;

    parent.removeChild(phElement);
    parent.appendChild(phElement);
    parent.insertBefore(element.nativeElement, parent.children[this.sourceIndex]);

    this.target = null;
    this.source = null;

    console.log(this.sourceIndex);
    console.log(this.targetIndex);
    if (this.sourceIndex !== this.targetIndex) {
      const value = this.fields.getRawValue();
      moveItemInArray(value, this.sourceIndex, this.targetIndex);
      this.fields.setValue(value);
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
