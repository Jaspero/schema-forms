import {Injectable} from '@angular/core';
import {MatLegacySnackBar as MatSnackBar} from '@angular/material/legacy-snack-bar';
import {TranslocoService} from '@ngneat/transloco';
import {Observable, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';

@Injectable()
export class FormBuilderService {
  constructor(
    private transloco: TranslocoService,
    private snackBar: MatSnackBar
  ) {}

  notify(
    options: {
      success?: string | null;
      error?: string;
    } = {}
  ): <T>(source$: Observable<T>) => Observable<T> {
    const finalOptions = {
      success: 'OPERATION_COMPLETED',
      error: 'OPERATION_FAILED',
      ...options
    };

    return <T>(source$: Observable<T>) => {
      return source$.pipe(
        tap(() => {
          if (finalOptions.success) {
            this.snackBar.open(
              this.transloco.translate(finalOptions.success),
              this.transloco.translate('DISMISS'),
              {
                duration: 5000
              }
            );
          }
        }),
        catchError(err => {
          if (finalOptions.error) {
            this.snackBar.open(
              this.transloco.translate(finalOptions.error),
              this.transloco.translate('DISMISS'),
              {
                panelClass: 'snack-bar-error',
                duration: 5000
              }
            );
          }

          console.error(err);
          return throwError(err);
        })
      );
    };
  }
}
