import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SimpleComponent} from './simple/simple.component';

@NgModule({
  declarations: [SimpleComponent],
  exports: [SimpleComponent],
  imports: [
    CommonModule
  ]
})
export class BlocksModule { }
