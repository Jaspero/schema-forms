import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {SanitizeModule} from '@jaspero/ng-helpers';
import {InlineEditorModule} from '../../../../../projects/page-builder/src/lib/inline-editor/inline-editor.module';
import {CardsComponent} from './cards/cards.component';
import {SimpleComponent} from './simple/simple.component';

@NgModule({
  declarations: [SimpleComponent, CardsComponent],
  exports: [SimpleComponent, CardsComponent],
  imports: [
    CommonModule,
    InlineEditorModule,
    SanitizeModule
  ]
})
export class BlocksModule { }
