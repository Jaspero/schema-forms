import {DragDropModule} from '@angular/cdk/drag-drop';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyMenuModule as MatMenuModule} from '@angular/material/legacy-menu';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
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
