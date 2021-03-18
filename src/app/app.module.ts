import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TRANSLOCO_CONFIG, TranslocoConfig, TranslocoModule} from '@ngneat/transloco';
import {environment} from '../environments/environment';
import {AppComponent} from './app.component';
import {ExampleCustomComponent} from './example-custom/example-custom.component';
import {MockDbService} from './mock/mock-db.service';
import {MockStorageService} from './mock/mock-storage.service';
import {translocoLoader} from './transloco.loader';
import {FormBuilderModule} from '../../projects/form-builder/src/lib/form-builder.module';
import {STORAGE_URL} from '../../projects/form-builder/src/lib/utils/storage-url';
import {StorageService} from '../../projects/form-builder/src/lib/services/storage.service';
import {DbService} from '../../projects/form-builder/src/lib/services/db.service';
import {CUSTOM_COMPONENTS} from '../../projects/form-builder/src/lib/utils/custom-components';

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
    TranslocoModule,
    FormBuilderModule.forRoot(),

    MatSnackBarModule,
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
