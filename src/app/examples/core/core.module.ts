import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FormBuilderModule} from '../../../../projects/form-builder/src/lib/form-builder.module';
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

    FormBuilderModule
  ]
})
export class CoreModule { }
