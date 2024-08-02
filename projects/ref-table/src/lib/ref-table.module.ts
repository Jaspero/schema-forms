import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {FormBuilderContextService, FormBuilderModule} from '@jaspero/form-builder';
import {TranslocoModule} from '@jsverse/transloco';
import {RefTableComponent} from './ref-table/ref-table.component';

@NgModule({
  declarations: [RefTableComponent],
  imports: [
    CommonModule,

    FormBuilderModule,

    MatCardModule,
    MatButtonModule,
    MatIconModule,

    TranslocoModule
  ]
})
export class FbRefTableModule {
  constructor(
    private ctx: FormBuilderContextService
  ) {
    this.ctx.registerField(
      'ref-table',
      RefTableComponent
    );
  }
}
