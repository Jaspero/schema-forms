import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TinymceModule} from '@jaspero/fb-tinymce';
import {
  CUSTOM_COMPONENTS,
  DbService,
  FormBuilderModule,
  ROLE,
  STORAGE_URL,
  StorageService
} from '@jaspero/form-builder';
import {SanitizeModule} from '@jaspero/ng-helpers';
import {TRANSLOCO_CONFIG, TranslocoConfig, TranslocoModule} from '@ngneat/transloco';
import {FB_PAGE_BUILDER_OPTIONS} from '../../projects/page-builder/src/lib/options.token';
import {PageBuilderModule} from '../../projects/page-builder/src/lib/page-builder.module';
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
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    TranslocoModule,
    FormBuilderModule.forRoot(),
    PageBuilderModule,
    TinymceModule,

    MatSnackBarModule,

    BlocksModule
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
        'example': ExampleCustomComponent
      }
    },
    {
      provide: FB_PAGE_BUILDER_OPTIONS,
      useValue: {
        previewModules: [MatButtonModule, SanitizeModule, BlocksModule]
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
