import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FormBuilderModule} from '@jaspero/form-builder';
import {SeoEditorModule} from '../../../../projects/seo-editor/src/lib/seo-editor.module';
import {SeoComponent} from './seo.component';

const routes: Routes = [{
  path: '',
  component: SeoComponent
}];

@NgModule({
  declarations: [
    SeoComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormBuilderModule,
    SeoEditorModule
  ]
})
export class SeoModule { }
