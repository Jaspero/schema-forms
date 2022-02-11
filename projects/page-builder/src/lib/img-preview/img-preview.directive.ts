import {Directive, ElementRef, Input, Optional, Renderer2} from '@angular/core';
import {OnChange} from '@jaspero/ng-helpers';
import {ToolbarService} from '../toolbar.service';

@Directive({selector: 'img[imgPreview]'})
export class ImgPreviewDirective {
  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    @Optional()
    private toolbarService: ToolbarService,
  ) {

    if (!this.toolbarService) {
      return;
    }

    this.reader = new FileReader();
    this.reader.onload = () =>
      this.setSrc(this.reader.result as string)
  }

  @OnChange(function(value) {
    if (value instanceof File) {
      this.reader.readAsDataURL(value);
    } else {
      this.setSrc(value);
    }
  })
  @Input('imgPreview')
  url: string | File;

  reader: FileReader;

  setSrc(src: string) {
    this.renderer.setAttribute(this.el.nativeElement, 'src', src);
  }
}
