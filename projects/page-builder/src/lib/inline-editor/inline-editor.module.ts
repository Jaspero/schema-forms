import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {ImageDialogComponent} from './components/image-dialog/image-dialog.component';
import {ImageIEDirective} from './directives/image-ie.directive';
import {SingleLineIEDirective} from './directives/single-line-ie.directive';

const DIRECTIVES = [
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
