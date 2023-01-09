import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';
import {MatIconModule} from '@angular/material/icon';
import {FormBuilderContextService, FormBuilderModule} from '@jaspero/form-builder';
import {TranslocoModule} from '@ngneat/transloco';
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
