import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FormBuilderModule} from '@jaspero/form-builder';
import {FB_PAGE_BUILDER_OPTIONS} from '../../../../projects/page-builder/src/lib/options.token';
import {PageBuilderModule as PBModule} from '../../../../projects/page-builder/src/lib/page-builder.module';
import {BlocksModule} from './blocks/blocks.module';
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
    FormBuilderModule,
    PBModule
  ],
  providers: [
    {
      provide: FB_PAGE_BUILDER_OPTIONS,
      useValue: {
        previewModules: [BlocksModule]
      }
    }
  ]
})
export class PageBuilderModule { }
