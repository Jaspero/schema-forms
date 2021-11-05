import {Inject, InjectionToken, ModuleWithProviders, NgModule} from '@angular/core';
import {FormBuilderContextService} from '@jaspero/form-builder';

export interface FieldsMatConfig {
  prefix: string;
}

const FIELDS_CONFIG = new InjectionToken<FieldsMatConfig>('config');

@NgModule({
  declarations: [],
  imports: [
  ],
  exports: []
})
export class FbFieldsMatModule {

  static forRoot(config): ModuleWithProviders<FbFieldsMatModule> {
    return {
      ngModule: FbFieldsMatModule,
      providers: [{provide: FIELDS_CONFIG, useValue: config}]
    }
  }

  constructor(
    private ctx: FormBuilderContextService,
    @Inject(FIELDS_CONFIG)
    private config: FieldsMatConfig
  ) {
    console.log(config);
    // this.ctx.registerField(
    //   'tinymce',
    //   TinymceComponent
    // );
  }
}
