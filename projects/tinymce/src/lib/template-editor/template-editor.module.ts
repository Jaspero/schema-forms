import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyMenuModule as MatMenuModule} from '@angular/material/legacy-menu';
import {FormBuilderContextService, FormBuilderModule} from '@jaspero/form-builder';
import {TranslocoModule, TRANSLOCO_SCOPE} from '@ngneat/transloco';
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
