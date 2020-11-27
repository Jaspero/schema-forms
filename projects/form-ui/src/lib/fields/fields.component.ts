import {CdkDrag, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {ViewportRuler} from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {
  COMPONENT_DATA,
  FieldComponent,
  FieldData,
  FormBuilderComponent,
  FormBuilderData,
  SegmentType
} from '@jaspero/form-builder';
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
  @ViewChild(CdkDropList, {static: true})
  placeholder: CdkDropList;
  target: CdkDropList | null;
  targetIndex: number;
  source: CdkDropList | null;
  sourceIndex: number;
  insertAfter: boolean;

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
    this.selectedFormData = this.types[group.get('type')?.value].added as any;
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
  indexOf(collection: any, node: any) {
    return Array.prototype.indexOf.call(collection, node);
  }

  dragDrop() {
    if (!this.target)
      return;

    let phElement = this.placeholder.element.nativeElement;
    let parent = phElement.parentNode as any;

    phElement.style.display = 'none';

    parent.removeChild(phElement);
    parent.appendChild(phElement);
    parent.insertBefore(this.source?.element.nativeElement, parent.children[this.sourceIndex]);

    this.target = null;
    this.source = null;

    if (this.insertAfter && this.fields.value.length > this.targetIndex + 1) {
      this.targetIndex ++;
    }

    if (this.sourceIndex != this.targetIndex) {
      const value = this.fields.getRawValue();
      moveItemInArray(value, this.sourceIndex, this.targetIndex);
      this.fields.setValue(value);
    }
  }

  dropListEnterPredicate = (drag: CdkDrag<any>, drop: CdkDropList<any>) => {
    if (drop == this.placeholder)
      return true;

    let phElement = this.placeholder.element.nativeElement;
    let dropElement = drop.element.nativeElement as any;

    let dragIndex = this.indexOf(dropElement.parentNode.children, drag.dropContainer.element.nativeElement);
    let dropIndex = this.indexOf(dropElement.parentNode.children, dropElement);

    let size: any = '';

    if (!this.source) {
      this.sourceIndex = dragIndex;
      this.source = drag.dropContainer;

      let sourceElement = this.source.element.nativeElement as any;
      phElement.style.width = sourceElement.clientWidth + 'px';
      phElement.style.height = sourceElement.clientHeight + 'px';

      sourceElement.parentNode.removeChild(sourceElement);
      size = Array.from(sourceElement.classList)
        .find((c: any) => c.startsWith('content-item-c'));
    }

    this.targetIndex = dropIndex;
    this.target = drop;

    phElement.style.display = '';
    this.insertAfter = (dragIndex < dropIndex);
    dropElement.parentNode.insertBefore(phElement, this.insertAfter ? dropElement.nextSibling : dropElement);


    const oldSize = Array.from(phElement.classList).find(c => c.startsWith('content-item-c'));
    if (oldSize) {
      phElement.classList.remove(oldSize);
    }

    if (size) {
      phElement.classList.add(size);
    }

    this.source._dropListRef.start();
    this.placeholder._dropListRef.enter(drag._dragRef, drag.element.nativeElement.offsetLeft, drag.element.nativeElement.offsetTop);

    return false;
  };
}
