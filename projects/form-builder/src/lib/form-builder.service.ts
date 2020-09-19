import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslocoService} from '@ngneat/transloco';
import {Observable, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';

@Injectable()
export class FormBuilderService {
  constructor(
    private transloco: TranslocoService,
    private snackBar: MatSnackBar
  ) {
  }

  /**
   * Array of components that need to
   * run save() methods on single instance
   */
  saveComponents: any[] = [];

  removeComponent(component) {
    const index = this.saveComponents.indexOf(component);

    if (index !== -1) {
      this.saveComponents.splice(
        index,
        1
      )
    }
  }

  notify(
    options: {
      success?: string | null;
      error?: string;
    } = {}
  ): <T>(source$: Observable<T>) => Observable<T> {
    const finalOptions = {
      success: 'GENERAL.OPERATION_COMPLETED',
      error: 'GENERAL.OPERATION_FAILED',
      ...options
    };

    return <T>(source$: Observable<T>) => {
      return source$.pipe(
        tap(() => {
          if (finalOptions.success) {
            this.snackBar.open(
              this.transloco.translate(finalOptions.success),
              this.transloco.translate('GENERAL.DISMISS'),
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
              this.transloco.translate('GENERAL.DISMISS'),
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
