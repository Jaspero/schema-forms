import {NgModule} from '@angular/core';
import {GalleryComponent} from './gallery.component';
import {MatButtonModule} from '@angular/material/button';
import {DropzoneDirective} from './directives/dropzone/dropzone.directive';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {CommonModule} from '@angular/common';
import {MatTooltipModule} from '@angular/material/tooltip';
import {SanitizeModule} from '@jaspero/ng-helpers';
import {MatIconModule} from '@angular/material/icon';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {TranslocoModule} from '@ngneat/transloco';
import {FormBuilderContextService} from '@jaspero/form-builder';
import {MatInputModule} from '@angular/material/input';

@NgModule({
  imports: [
    CommonModule,

    /**
     * Internal
     */
    DragDropModule,

    /**
     * Material
     */
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,

    /**
     * Other
     */
    TranslocoModule,
    SanitizeModule
  ],
  exports: [],
  declarations: [GalleryComponent, DropzoneDirective],
  providers: [DropzoneDirective]
})
export class GalleryModule {
  constructor(
    private ctx: FormBuilderContextService
  ) {
    this.ctx.registerField(
      'gallery',
      GalleryComponent
    );
  }
}
