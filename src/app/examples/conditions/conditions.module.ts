import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';
import {RouterModule, Routes} from '@angular/router';
import {FormBuilderModule} from '@jaspero/form-builder';
import {ConditionsComponent} from './conditions.component';

const routes: Routes = [
  {path: '', component: ConditionsComponent}
];

@NgModule({
  declarations: [
    ConditionsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormBuilderModule,

    MatDialogModule
  ]
})
export class ConditionsModule { }
