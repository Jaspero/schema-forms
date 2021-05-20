import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormBuilderModule} from '../../../../projects/form-builder/src/lib/form-builder.module';
import {PageBuilderModule as PBModule} from '../../../../projects/page-builder/src/lib/page-builder.module';
import {BlocksModule} from './blocks/blocks.module';
import {PageBuilderComponent} from './page-builder.component';


@NgModule({
  declarations: [PageBuilderComponent],
  imports: [
    CommonModule,
    BlocksModule,

    FormBuilderModule,
    PBModule
  ]
})
export class PageBuilderModule { }
