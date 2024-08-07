import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {FormBuilderContextService, FormBuilderModule} from '@jaspero/form-builder';
import {TranslocoModule, TRANSLOCO_SCOPE} from '@jsverse/transloco';
import {TemplateEditorInnerComponent} from './template-editor-inner/template-editor-inner.component';
import {TemplateEditorComponent} from './template-editor.component';
import {SanitizeModule} from '@jaspero/ng-helpers';

@NgModule({
  declarations: [TemplateEditorComponent, TemplateEditorInnerComponent],
  imports: [
    CommonModule,

    FormBuilderModule,

    MatButtonModule,
    MatMenuModule,

    TranslocoModule,
    SanitizeModule
  ],
  providers: [{
    provide: TRANSLOCO_SCOPE,
    useValue: 'fb-t'
  }]
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
