import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatLegacySlideToggleModule as MatSlideToggleModule} from '@angular/material/legacy-slide-toggle';
import {FormBuilderContextService, FormBuilderModule} from '@jaspero/form-builder';
import {TranslocoModule, TRANSLOCO_SCOPE} from '@ngneat/transloco';
import {TinymceComponent} from './tinymce.component';

@NgModule({
  declarations: [TinymceComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    FormBuilderModule,

    /**
     * Material
     */
    MatDialogModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,

    TranslocoModule
  ],
  providers: [{
    provide: TRANSLOCO_SCOPE,
    useValue: 'fb-fields-mat'
  }]
})
export class TinymceModule {
  constructor(
    private ctx: FormBuilderContextService
  ) {
    this.ctx.registerField(
      'tinymce',
      TinymceComponent
    );
  }
}
