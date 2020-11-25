import {DragDropModule} from '@angular/cdk/drag-drop';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FormBuilderContextService, FormBuilderModule} from '@jaspero/form-builder';
import {LoadClickModule} from '@jaspero/ng-helpers';
import {TranslocoModule} from '@ngneat/transloco';
import {FieldsComponent} from './fields/fields.component';
import {MatDialogModule} from '@angular/material/dialog';

@NgModule({
  declarations: [FieldsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormBuilderModule,

    /**
     * Material
     */
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    DragDropModule,
    MatMenuModule,
    MatDialogModule,
    MatIconModule,
    MatTooltipModule,

    TranslocoModule,
    LoadClickModule
  ]
})
export class FormUiModule {
  constructor(
    private ctx: FormBuilderContextService
  ) {
    this.ctx.registerField(
      'fu-fields',
      FieldsComponent
    );
  }
}
