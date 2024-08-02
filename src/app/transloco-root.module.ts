import {HttpClient, provideHttpClient} from '@angular/common/http';
import {inject, Injectable, NgModule} from '@angular/core';
import {provideTransloco, Translation, TranslocoLoader, TranslocoModule} from '@jsverse/transloco';
import {environment} from '../environments/environment';

@Injectable({providedIn: 'root'})
export class TranslocoHttpLoader implements TranslocoLoader {
  private http = inject(HttpClient);

  getTranslation(lang: string) {
    return this.http.get<Translation>(`/assets/i18n/${lang}.json`);
  }
}

@NgModule({
  exports: [TranslocoModule],
  providers: [
    provideHttpClient(),
    provideTransloco({
      config: {
        availableLangs: [
          {
            id: 'en',
            label: 'English'
          }
        ],
        defaultLang: 'en',
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: environment.production
      },
      loader: TranslocoHttpLoader
    })
  ]
})
export class TranslocoRootModule {}
