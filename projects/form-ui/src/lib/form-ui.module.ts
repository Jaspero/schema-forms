import {DragDropModule} from '@angular/cdk/drag-drop';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FormBuilderContextService, FormBuilderModule} from '@jaspero/form-builder';
import {LoadClickModule, StopPropagationModule} from '@jaspero/ng-helpers';
import {TranslocoModule, TRANSLOCO_SCOPE} from '@ngneat/transloco';
import {FieldsComponent} from './fields/fields.component';

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
    MatButtonToggleModule,

    TranslocoModule,
    LoadClickModule,
    StopPropagationModule
  ],
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'fb-fu'
    }
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
