import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {FormBuilderContextService, FormBuilderModule} from '@jaspero/form-builder';
import {TranslocoModule} from '@ngneat/transloco';
import {TemplateEditorInnerComponent} from './template-editor-inner/template-editor-inner.component';
import {TemplateEditorComponent} from './template-editor.component';

@NgModule({
  declarations: [TemplateEditorComponent, TemplateEditorInnerComponent],
  imports: [
    CommonModule,

    FormBuilderModule,

    MatButtonModule,
    MatMenuModule,

    TranslocoModule
  ]
})
export class TemplateEditorModule {
  constructor(
    private ctx: FormBuilderContextService
  ) {
    this.ctx.registerField(
      'template-editor',
      TemplateEditorComponent
    );
  }
}
