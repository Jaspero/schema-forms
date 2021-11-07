import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ShowFieldPipe} from './show-field.pipe';

@NgModule({
  declarations: [ShowFieldPipe],
  imports: [CommonModule],
  exports: [ShowFieldPipe]
})
export class ShowFieldModule { }
