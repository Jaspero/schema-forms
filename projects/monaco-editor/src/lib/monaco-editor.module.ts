import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FormBuilderContextService} from '@jaspero/form-builder';
import {MonacoComponent} from './monaco.component';

@NgModule({
  declarations: [MonacoComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class MonacoEditorModule {

  constructor(
    private ctx: FormBuilderContextService
  ) {
    this.ctx.registerField(
      'monaco',
      MonacoComponent
    );
  }
}
