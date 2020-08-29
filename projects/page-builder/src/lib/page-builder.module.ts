import {CommonModule} from '@angular/common';
import {Compiler, COMPILER_OPTIONS, CompilerFactory, NgModule} from '@angular/core';
import {JitCompilerFactory} from '@angular/platform-browser-dynamic';
import {FormBuilderContextService, FormBuilderModule} from '@jaspero/form-builder';
import {BlockComponent} from './block/block.component';
import {BlocksComponent} from './blocks/blocks.component';

export function createCompiler(compilerFactory: CompilerFactory) {
  return compilerFactory.createCompiler();
}

@NgModule({
  declarations: [
    BlocksComponent,
    BlockComponent
  ],
  imports: [
    CommonModule,
    FormBuilderModule
  ],
  providers: [
    {
      provide: COMPILER_OPTIONS,
      useValue: {},
      multi: true
    },
    {
      provide: CompilerFactory,
      useClass: JitCompilerFactory,
      deps: [COMPILER_OPTIONS]
    },
    {
      provide: Compiler,
      useFactory: createCompiler,
      deps: [CompilerFactory]
    },
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
