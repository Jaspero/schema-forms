import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {FormBuilderContextService, FormBuilderModule} from '@jaspero/form-builder';
import {TranslocoModule, TRANSLOCO_SCOPE} from '@jsverse/transloco';
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
