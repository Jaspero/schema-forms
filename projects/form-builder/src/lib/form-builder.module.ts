import {PortalModule} from '@angular/cdk/portal';
import {CommonModule} from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslocoModule} from '@ngneat/transloco';
import {CustomComponent} from './custom/custom.component';
import {FieldComponent} from './field/field.component';
import {FormBuilderContextService} from './form-builder-context.service';
import {FormBuilderComponent} from './form-builder.component';
import {SegmentComponent} from './segment/segment.component';

@NgModule({
  declarations: [
    SegmentComponent,
    FieldComponent,
    FormBuilderComponent,
    CustomComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    /**
     * External
     */
    PortalModule,
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
