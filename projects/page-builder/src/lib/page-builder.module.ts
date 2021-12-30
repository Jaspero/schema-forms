import {DragDropModule} from '@angular/cdk/drag-drop';
import {ObserversModule} from '@angular/cdk/observers';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatRippleModule} from '@angular/material/core';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatTreeModule} from '@angular/material/tree';
import {FormBuilderContextService, FormBuilderModule} from '@jaspero/form-builder';
import {SanitizeModule, StopPropagationModule} from '@jaspero/ng-helpers';
import {TranslocoModule} from '@ngneat/transloco';
import {BlockFormComponent} from './block-form/block-form.component';
import {NavigationComponent} from './navigation/navigation.component';
import {PageBuilderCtxService} from './page-builder-ctx.service';
import {PageBuilderComponent} from './page-builder/page-builder.component';
import {ToolbarService} from './toolbar.service';
import { BlockComponent } from './block/block.component';

@NgModule({
  declarations: [
    PageBuilderComponent,
    BlockFormComponent,
    NavigationComponent,
    BlockComponent
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

    StopPropagationModule,
    SanitizeModule,
    ObserversModule,

    TranslocoModule
  ],
  providers: [
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
      PageBuilderComponent
    );
    this.ctx.registerField(
      'pb-block',
      BlockFormComponent
    );
  }
}
