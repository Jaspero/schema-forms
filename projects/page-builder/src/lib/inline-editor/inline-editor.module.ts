import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {ImageIEDirective} from './directives/image-ie.directive';
import {MultiLineIEDirective} from './directives/multi-line-ie.directive';
import {SingleLineIEDirective} from './directives/single-line-ie.directive';
import { ImageDialogComponent } from './components/image-dialog/image-dialog.component';

const DIRECTIVES = [
  MultiLineIEDirective,
  SingleLineIEDirective,
  ImageIEDirective
];

@NgModule({
  declarations: [
    ImageDialogComponent,

    ...DIRECTIVES,
  ],
  exports: [
    ...DIRECTIVES
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class InlineEditorModule { }
