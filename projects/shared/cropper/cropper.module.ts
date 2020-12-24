import {NgModule} from '@angular/core';
import {FormBuilderContextService} from '@jaspero/form-builder';
import {CropperComponent} from './cropper.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';

@NgModule({
  declarations: [CropperComponent],
  imports: [
    MatDialogModule,
    MatButtonModule

    /**
     * Material
     */
  ]
})
export class CropperModule {
  constructor(
    private ctx: FormBuilderContextService
  ) {
    this.ctx.registerField(
      'cropper',
      CropperComponent
    );
  }
}
