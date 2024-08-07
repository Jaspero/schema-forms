import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule, Routes} from '@angular/router';
import {
  CUSTOM_COMPONENTS,
  DbService,
  FormBuilderModule,
  ROLE,
  STORAGE_URL,
  StorageService
} from '@jaspero/form-builder';
import {AppComponent} from './app.component';
import {ExampleCustomComponent} from './example-custom/example-custom.component';
import {MockDbService} from './mock/mock-db.service';
import {MockStorageService} from './mock/mock-storage.service';
import {TinymceModule} from '@jaspero/fb-tinymce/src/lib/tinymce/tinymce.module';
import {FbFieldsMatModule} from '@jaspero/fb-fields-mat/src/lib/fields-mat.module';
import {FbSegmentsMatModule} from '@jaspero/fb-segments-mat/src/lib/segments-mat.module';
import {TranslocoModule} from '@jsverse/transloco';
import {TranslocoRootModule} from './transloco-root.module';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./examples/core/core.module')
      .then(m => m.CoreModule)
  },
  {
    path: 'page-builder',
    loadChildren: () => import('./examples/page-builder/page-builder.module')
      .then(m => m.PageBuilderModule)
  },
  {path: 'conditions', loadChildren: () => import('./examples/conditions/conditions.module').then(m => m.ConditionsModule)}
];

@NgModule({
  declarations: [
    AppComponent,
    ExampleCustomComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    TranslocoModule,
    TinymceModule,
    FormBuilderModule.forRoot(),
    FbFieldsMatModule.forRoot({prefix: ''}),
    FbSegmentsMatModule.forRoot({prefix: ''}),

    TranslocoRootModule,

    MatSnackBarModule,
    MatCheckboxModule
  ],
  providers: [
    /**
     * FormBuilder
     */
    {
      provide: ROLE,
      useValue: 'admin'
    },
    {
      provide: STORAGE_URL,
      useValue: ''
    },
    {
      provide: StorageService,
      useClass: MockStorageService
    },
    {
      provide: DbService,
      useClass: MockDbService
    },
    {
      provide: CUSTOM_COMPONENTS,
      useValue: {
        example: ExampleCustomComponent
      }
    },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: 'outline'
      }
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
