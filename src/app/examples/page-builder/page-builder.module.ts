import {CommonModule} from '@angular/common';
import {NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CUSTOM_COMPONENTS, FormBuilderModule} from '@jaspero/form-builder';
import {PageBuilderModule as PBModule} from '../../../../projects/page-builder/src/lib/page-builder.module';
import {BlocksModule} from './blocks/blocks.module';
import {SimpleComponent} from './blocks/simple/simple.component';
import {PageBuilderComponent} from './page-builder.component';

const routes: Routes = [{
  path: '',
  component: PageBuilderComponent
}];

@NgModule({
  declarations: [PageBuilderComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),

    BlocksModule,
    FormBuilderModule,
    PBModule
  ],
  providers: [
    {
      provide: CUSTOM_COMPONENTS,
      useValue: {
        'sc-simple': SimpleComponent
      }
    }
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class PageBuilderModule { }
