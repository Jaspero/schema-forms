import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule, Routes} from '@angular/router';
import {FbFieldsMatModule} from '@jaspero/fb-fields-mat';
import {FbSegmentsMatModule} from '@jaspero/fb-segments-mat';
import {TinymceModule} from '@jaspero/fb-tinymce';
import {CUSTOM_COMPONENTS, DbService, FormBuilderModule, ROLE, StorageService, STORAGE_URL} from '@jaspero/form-builder';
import {TranslocoConfig, TranslocoModule, TRANSLOCO_CONFIG} from '@ngneat/transloco';
import {environment} from '../environments/environment';
import {AppComponent} from './app.component';
import {ExampleCustomComponent} from './example-custom/example-custom.component';
import {MockDbService} from './mock/mock-db.service';
import {MockStorageService} from './mock/mock-storage.service';
import {translocoLoader} from './transloco.loader';

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
    HttpClientModule,
    RouterModule.forRoot(routes),
    TranslocoModule,
    TinymceModule,
    FormBuilderModule.forRoot(),
    FbFieldsMatModule.forRoot({prefix: ''}),
    FbSegmentsMatModule.forRoot({prefix: ''}),

    MatSnackBarModule,
    MatCheckboxModule
  ],
  providers: [
    {
      provide: TRANSLOCO_CONFIG,
      useValue: {
        listenToLangChange: true,
        defaultLang: 'en',
        prodMode: environment.production,
        missingHandler: {
          logMissingKey: false,
          allowEmpty: true
        }
      } as TranslocoConfig
    },
    translocoLoader,

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
