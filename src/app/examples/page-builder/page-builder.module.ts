import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FormBuilderModule} from '../../../../projects/form-builder/src/lib/form-builder.module';
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

    BlocksModule,
    FormBuilderModule,
    PBModule
  ]
})
export class PageBuilderModule { }
