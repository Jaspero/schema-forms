import {ChangeDetectorRef, Component, Input} from '@angular/core';

@Component({template: ''})
export class BlockData<T = any> {
  constructor(
    public cdr: ChangeDetectorRef
  ) {}

  @Input() id: string;
  @Input() set change(data: any) {
    this.cdr.markForCheck();
  }

  get data() {
    return {} as T;
  }
}
