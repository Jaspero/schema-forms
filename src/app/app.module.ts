import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
  CUSTOM_COMPONENTS,
  DbService,
  FormBuilderModule,
  ROLE,
  STORAGE_URL,
  StorageService
} from '../../projects/form-builder/src/public-api';
import {SanitizeModule} from '@jaspero/ng-helpers';
import {TRANSLOCO_CONFIG, TranslocoConfig, TranslocoModule} from '@ngneat/transloco';
import {environment} from '../environments/environment';
import {AppComponent} from './app.component';
import {BlocksModule} from './blocks/blocks.module';
import {ExampleCustomComponent} from './example-custom/example-custom.component';
import {MockDbService} from './mock/mock-db.service';
import {MockStorageService} from './mock/mock-storage.service';
import {translocoLoader} from './transloco.loader';

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
    MatCheckboxModule,
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
