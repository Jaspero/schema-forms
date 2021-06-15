import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FormBuilderContextService} from '@jaspero/form-builder';
import {TranslocoModule} from '@ngneat/transloco';
import {MonacoComponent} from './monaco.component';

@NgModule({
  declarations: [MonacoComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,

    TranslocoModule
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
