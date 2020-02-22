import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TRANSLOCO_CONFIG, TranslocoConfig, TranslocoModule} from '@ngneat/transloco';
import {FormBuilderModule} from 'form-builder';
import {environment} from '../environments/environment';

import {AppComponent} from './app.component';
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
    FormBuilderModule
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
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
