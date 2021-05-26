import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {InlineEditorDirective} from './inline-editor.directive';

@NgModule({
  declarations: [InlineEditorDirective],
  exports: [InlineEditorDirective],
  imports: [
    CommonModule
  ]
})
export class InlineEditorModule { }
