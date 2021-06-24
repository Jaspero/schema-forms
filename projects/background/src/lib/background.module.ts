import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {FormBuilderContextService, FormBuilderModule} from '../../../../dist/@jaspero/form-builder';
import {TranslocoModule} from '@ngneat/transloco';
import {BackgroundComponent} from './background.component';
import {MatIconModule} from '@angular/material/icon';

@NgModule({
  declarations: [BackgroundComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    FormBuilderModule,

    /**
     * Material
     */
    MatDialogModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,

    TranslocoModule
  ]
})
export class BackgroundModule {
  constructor(
    private ctx: FormBuilderContextService
  ) {
    this.ctx.registerField(
      'background',
      BackgroundComponent
    );
  }
}
