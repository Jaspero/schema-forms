import {CommonModule} from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslocoModule} from '@ngneat/transloco';
import {CustomComponent} from './custom/custom.component';
import {FieldComponent} from './field/field.component';
import {FormBuilderContextService} from './form-builder-context.service';
import {FormBuilderComponent} from './form-builder.component';
import {ShowFieldPipe} from './pipes/show-field/show-field.pipe';
import {SegmentComponent} from './segment/segment.component';
import { ShowFieldComponent } from './modules/show-field/show-field.component';

@NgModule({
  declarations: [
    /**
     * Segments
     */
    SegmentComponent,

    /**
     * Pipes
     */
    ShowFieldPipe,

    FieldComponent,
    FormBuilderComponent,
    CustomComponent,
    ShowFieldComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    /**
     * Other
     */
    TranslocoModule
  ],
  exports: [FormBuilderComponent]
})
export class FormBuilderModule {
  static forRoot(): ModuleWithProviders<FormBuilderModule> {
    return {
      ngModule: FormBuilderModule,
      providers: [FormBuilderContextService]
    }
  }
}
