import {A11yModule} from '@angular/cdk/a11y';
import {CommonModule} from '@angular/common';
import {NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {SanitizeModule} from '@jaspero/ng-helpers';
import {ImgPreviewModule, InlineEditorModule} from '@jaspero/page-builder';
import {TestContentComponent} from '../test-content/test-content.component';
import {CardsComponent} from './cards/cards.component';
import {DividerComponent} from './divider/divider.component';
import {SimpleComponent} from './simple/simple.component';

const BLOCKS: any[] = [
  SimpleComponent,
  CardsComponent,
  DividerComponent,
  TestContentComponent
];

@NgModule({
  declarations: BLOCKS,
  exports: BLOCKS,
  imports: [
    CommonModule,
    InlineEditorModule,
    ImgPreviewModule,
    SanitizeModule,
    MatCardModule,
    A11yModule
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class BlocksModule {}
