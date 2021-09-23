import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {FormBuilderContextService, FormBuilderModule} from '@jaspero/form-builder';
import {SeoEditorComponent} from './seo-editor.component';
import {SeoEditorService} from './seo-editor.service';

@NgModule({
  declarations: [
    SeoEditorComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormBuilderModule,
  ],
  providers: [SeoEditorService]
})
export class SeoEditorModule {
  constructor(
    private ctx: FormBuilderContextService
  ) {
    this.ctx.registerField(
      'seo-editor',
      SeoEditorComponent
    );
  }
}
