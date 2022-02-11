import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ImgPreviewDirective} from './img-preview.directive';

@NgModule({
  declarations: [ImgPreviewDirective],
  exports: [ImgPreviewDirective],
  imports: [
    CommonModule
  ]
})
export class ImgPreviewModule { }
