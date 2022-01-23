import {ChangeDetectorRef, Component, ElementRef, HostBinding, Input} from '@angular/core';
import {blockStyle} from './utils/block-style';

@Component({template: ''})
export class BlockData<T = any> {
  constructor(
    public cdr: ChangeDetectorRef,
    public el: ElementRef
  ) {}

  @Input() id: string;
  @Input() set change(data: any) {
    this.triggerChange();
    this.cdr.markForCheck();
  }

  styleEl: HTMLStyleElement;
  additionalStyle: string;

  get data() {
    return {} as T;
  }

  get addedClasses() {
    return [];
  }

  @HostBinding('class')
  get classes() {
    return [
      'block',
      ...this.addedClasses
    ];
  }

  @HostBinding('style')
  get style() {
    return blockStyle(this.data);
  }

  triggerChange() {

    const additionalStyle = (this.data as any).additionalStyle;

    if (
      this.styleEl &&
      (!additionalStyle || (this.additionalStyle !== additionalStyle))
    ) {
      this.additionalStyle = '';
      this.el.nativeElement.removeChild(this.styleEl);
    }

    if (additionalStyle) {
      this.styleEl = document.createElement('style');
      this.additionalStyle = additionalStyle;
      this.styleEl.innerHTML = this.additionalStyle;
      this.el.nativeElement.appendChild(this.styleEl);
    }
  }
}
