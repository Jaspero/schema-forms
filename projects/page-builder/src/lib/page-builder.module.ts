import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormBuilderContextService, FormBuilderModule} from '@jaspero/form-builder';
import {BlockComponent} from './block/block.component';
import {BlocksComponent} from './blocks/blocks.component';

@NgModule({
  declarations: [
    BlocksComponent,
    BlockComponent
  ],
  imports: [
    CommonModule,
    FormBuilderModule
  ]
})
export class PageBuilderModule {
  constructor(
    private ctx: FormBuilderContextService
  ) {
    this.ctx.registerField(
      'pb-blocks',
      BlocksComponent
    );
    this.ctx.registerField(
      'pb-block',
      BlockComponent
    )
  }
}
