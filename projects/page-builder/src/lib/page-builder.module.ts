import {DragDropModule} from '@angular/cdk/drag-drop';
import {CommonModule} from '@angular/common';
import {Compiler, COMPILER_OPTIONS, CompilerFactory, NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatRippleModule} from '@angular/material/core';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatTreeModule} from '@angular/material/tree';
import {JitCompilerFactory} from '@angular/platform-browser-dynamic';
import {FormBuilderContextService, FormBuilderModule} from '@jaspero/form-builder';
import {SanitizeModule, StopPropagationModule} from '@jaspero/ng-helpers';
import {TranslocoModule} from '@ngneat/transloco';
import {BlockComponent} from './block/block.component';
import {BlocksComponent} from './blocks/blocks.component';
import {BlockNavigationComponent} from './blocks/components/block-navigation/block-navigation.component';
import {PageBuilderCtxService} from './page-builder-ctx.service';
import {ToolbarService} from './toolbar.service';
import {MatListModule} from '@angular/material/list';

export function createCompiler(compilerFactory: CompilerFactory) {
  return compilerFactory.createCompiler();
}

@NgModule({
  declarations: [
    BlocksComponent,
    BlockComponent,
    BlockNavigationComponent
  ],
  imports: [
    CommonModule,
    FormBuilderModule,

    MatButtonModule,
    MatDialogModule,
    MatRippleModule,
    MatButtonToggleModule,
    MatIconModule,
    DragDropModule,
    MatTreeModule,
    MatListModule,

    StopPropagationModule,
    SanitizeModule,

    TranslocoModule
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
    ToolbarService,
    PageBuilderCtxService
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
    );
  }
}
