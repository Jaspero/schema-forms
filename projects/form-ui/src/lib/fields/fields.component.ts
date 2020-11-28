import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
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

  @ViewChild('optionsDialog', {static: true})
  optionsDialogTemp: TemplateRef<any>;

  @ViewChild('editDialog', {static: true})
  editDialogTemp: TemplateRef<any>;

  @ViewChild('sizesDialog', {static: true})
  sizesDialogTemp: TemplateRef<any>;

  @ViewChild('organizeDialog', {static: true})
  organizeDialogTemp: TemplateRef<any>;

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

  selectedForm: FormGroup | FormArray;
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

    this.fields = this.buildFields();

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

  createField(field?: Partial<Field>, typ?: string) {

    const type = field?.type || typ || Object.keys(this.types)[0];

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
      this.selectedForm.get(key)?.setValue(data[key]);
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

  openOrganize() {
    this.selectedForm = this.buildFields(this.fields.getRawValue());
    this.dialog.open(
      this.organizeDialogTemp,
      {
        width: '700px'
      }
    )
  }

  saveOrganization() {
    this.fields.setValue(this.selectedForm.getRawValue());
    this.dialog.closeAll();
  }

  buildFields(value = this.cData.control.value) {
    return new FormArray(
      (value || [])
        .map(it => this.createField(it))
    )
  }

  sortDrop(event: CdkDragDrop<string[]>) {
    const value = this.selectedForm.getRawValue();
    moveItemInArray(value, event.previousIndex, event.currentIndex);
    this.selectedForm.setValue(value);
  }

  move(up = false, index: number) {
    const currentIndex = up ? index - 1 : index + 1;
    const value = this.selectedForm.getRawValue();
    moveItemInArray(value, index, currentIndex);
    this.selectedForm.setValue(value);
    this.cdr.detectChanges();
  }
}
