import {A11yModule} from '@angular/cdk/a11y';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {SanitizeModule} from '@jaspero/ng-helpers';
import {InlineEditorModule} from '../../../../../projects/page-builder/src/lib/inline-editor/inline-editor.module';
import {RegisterBlocks} from '../../../../../projects/page-builder/src/lib/register-blocks.class';
import {CardsComponent} from './cards/cards.component';
import {DividerComponent} from './divider/divider.component';
import {SimpleComponent} from './simple/simple.component';

const BLOCKS = [
  SimpleComponent,
  CardsComponent,
  DividerComponent
];

@NgModule({
  declarations: BLOCKS,
  exports: BLOCKS,
  imports: [
    CommonModule,
    InlineEditorModule,
    SanitizeModule,
    MatCardModule,
    A11yModule
  ]
})
export class BlocksModule extends RegisterBlocks {}
