import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormBuilderModule} from '../../../../projects/form-builder/src/lib/form-builder.module';
import {CoreComponent} from './core.component';


@NgModule({
  declarations: [CoreComponent],
  imports: [
    CommonModule,

    FormBuilderModule
  ]
})
export class CoreModule { }
