import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {PageBuilderModule} from '@jaspero/fb-page-builder';
import {CUSTOM_FIELDS, DbService, FormBuilderModule, ROLE, STORAGE_URL, StorageService} from '@jaspero/form-builder';
import {TRANSLOCO_CONFIG, TranslocoConfig, TranslocoModule} from '@ngneat/transloco';
import {environment} from '../environments/environment';
import {AppComponent} from './app.component';
import {MockDbService} from './mock/mock-db.service';
import {MockStorageService} from './mock/mock-storage.service';
import {translocoLoader} from './transloco.loader';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    TranslocoModule,
    FormBuilderModule.forRoot(),
    PageBuilderModule,

    MatSnackBarModule
  ],
  providers: [
    {
      provide: TRANSLOCO_CONFIG,
      useValue: {
        listenToLangChange: true,
        defaultLang: 'en',
        prodMode: environment.production
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
      provide: CUSTOM_FIELDS,
      useValue: {}
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
