import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FormBuilderModule} from '@jaspero/form-builder';
import {TemplateEditorModule} from '../../../../projects/tinymce/src/public-api';
import {CoreComponent} from './core.component';

const routes: Routes = [{
  path: '',
  component: CoreComponent
}];

@NgModule({
  declarations: [CoreComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),

    FormBuilderModule,
    TemplateEditorModule
  ]
})
export class CoreModule { }
