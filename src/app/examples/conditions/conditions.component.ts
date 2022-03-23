import {AfterViewInit, ChangeDetectorRef, Component, QueryList, TemplateRef, ViewChild, ViewChildren} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {FormBuilderComponent} from '@jaspero/form-builder';
import {CONDITIONS_EXAMPLE} from './forms/conditions-example';

@Component({
  selector: 'sc-conditions',
  templateUrl: './conditions.component.html',
  styleUrls: ['./conditions.component.scss']
})
export class ConditionsComponent implements AfterViewInit {
  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) { }

  active = false;

  @ViewChildren(FormBuilderComponent)
  formComponents: QueryList<FormBuilderComponent>;

  @ViewChild('dialogTemp', {read: TemplateRef})
  dialogtempRef: TemplateRef<any>;

  form = CONDITIONS_EXAMPLE;

  ngAfterViewInit() {
    this.formComponents.forEach(log => {
      log.form.valueChanges
        .subscribe();
    });
  }

  toggle() {
    this.active = !this.active;
    this.cdr.markForCheck();
  }

  open() {
    this.dialog.open(this.dialogtempRef);
  }
}
