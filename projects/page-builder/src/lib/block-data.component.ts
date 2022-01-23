import {ChangeDetectorRef, Component, ElementRef, HostBinding, Input} from '@angular/core';
import {BackgroundData, blockStyle, BoxData} from './utils/block-style';

export interface BlockDataOptions extends BackgroundData {
  additionalStyle?: string;
  box?: BoxData;
}

@Component({template: ''})
export class BlockData<Options extends BlockDataOptions> {
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
    return {} as Options;
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

    const additionalStyle = this.data.additionalStyle;

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
