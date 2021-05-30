import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SanitizeModule} from '@jaspero/ng-helpers';
import {InlineEditorModule} from '../../../../../projects/page-builder/src/lib/inline-editor/inline-editor.module';
import {SimpleComponent} from './simple/simple.component';

@NgModule({
  declarations: [SimpleComponent],
  exports: [SimpleComponent],
  imports: [
    CommonModule,
    InlineEditorModule,
    SanitizeModule
  ]
})
export class BlocksModule { }
