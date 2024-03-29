import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FormBuilderModule} from '@jaspero/form-builder';
import {LoadClickModule} from '@jaspero/ng-helpers';
import {PageBuilderModule as PBModule} from '@jaspero/page-builder';
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
    PBModule,
    LoadClickModule,
    BlocksModule
  ]
})
export class PageBuilderModule { }
