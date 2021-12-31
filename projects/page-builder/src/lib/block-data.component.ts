import {Component, Input} from '@angular/core';

@Component({template: ''})
export class BlockData<T = any> {

  @Input() id: string;

  get data() {
    return {} as T;
  }
}