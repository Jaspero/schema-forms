import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  Optional,
  ViewChild
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {
  COMPONENT_DATA,
  FieldComponent,
  FieldData,
  StorageService,
  UploadMethod,
  formatFileName,
  ProcessConfig
} from '@jaspero/form-builder';
import {sizeToBytes, random} from '@jaspero/utils';
import {TranslocoService} from '@jsverse/transloco';
import {set} from 'json-pointer';
import {from, of, throwError} from 'rxjs';
import {switchMap, take, tap} from 'rxjs/operators';
import {FileSelectComponent} from '../../components/file-select/file-select.component';

export interface FileConfiguration {
  emptyLabel?: string;
  preventClear?: boolean;
  allowedFileTypes?: string[];
  forbiddenFileTypes?: string[];
  minSize?: string | number;
  maxSize?: string | number;
  filePrefix?: string;
  /**
   * Overwrite existing file if already exists
   */
  preserveFileName?: boolean;
  uploadMethods?: UploadMethod[];
}

export type FileData = FileConfiguration & FieldData;

@Component({
  selector: 'fb-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileComponent extends FieldComponent<FileData> implements OnInit {
  constructor(
    @Inject(COMPONENT_DATA) public cData: FileData,
    @Optional() private storage: StorageService,
    private cdr: ChangeDetectorRef,
    private transloco: TranslocoService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    super(cData);
  }

  @ViewChild('file', {static: true})
  fileEl: ElementRef<HTMLInputElement>;
  value: File;
  name: string;
  emptyLabel: string;

  allowedFileTypes: string[];
  forbiddenFileTypes: string[];
  minSizeBytes: number;
  maxSizeBytes: number;

  ngOnInit() {
    if (this.cData.control.value) {
      this.name = this.cData.control.value;
    }

    this.emptyLabel = (this.cData.hasOwnProperty('emptyLabel') ? this.cData.emptyLabel : 'fbFieldsMat.FILE.EMPTY') as string;

    this.allowedFileTypes = this.cData.allowedFileTypes || [];
    this.forbiddenFileTypes = this.cData.forbiddenFileTypes || [];
    this.minSizeBytes = this.cData.minSize ? sizeToBytes(this.cData.minSize) : 0;
    this.maxSizeBytes = this.cData.maxSize ? sizeToBytes(this.cData.maxSize) : 0;

    /**
     * TODO:
     * Handle cases when !data.direct
     * currently any url selection is treaded as direct
     */
    window.jpFb.assignOperation({
      cData: this.cData,
      save: (data: ProcessConfig<FileData>) => {

        const current = window.jpFb.exists(data);

        if (!current.exists || !window.jpFb.change(data)) {
          return of(true);
        }

        if (current.value && typeof current.value !== 'string') {
          let name = data.cData.preserveFileName ? current.value.name : [
            data.collectionId,
            data.documentId,
            random.string()
          ].join('-');

          if (!data.cData.preserveFileName) {
            /**
             * TODO:
             * Maybe we should put a type extension based on type
             * instead of taking from the name
             */
            name += '.' + (current.value.name.split('.')[1]);
          }

          return from(
            this.storage.upload((this.cData.filePrefix || '') + name, this.value, {
              contentType: this.value.type,
              customMetadata: {
                moduleId: data.collectionId,
                documentId: data.documentId
              }
            })
          )
            .pipe(
              switchMap((res: any) => this.storage.getDownloadURL(res.ref)),
              tap(url => set(data.outputValue, data.pointer, url))
            );
        }

        return of(true);
      }
    })
  }

  errorSnack(message: string = 'ERROR', dismiss: string = 'DISMISS') {
    this.snackBar.open(
      this.transloco.translate(message),
      this.transloco.translate(dismiss),
      {
        panelClass: 'snack-bar-error',
        duration: 5000
      }
    );
  }

  openFileUpload() {
    const dialog = this.dialog.open(
      FileSelectComponent,
      {
        autoFocus: false,
        data: {
          ...this.cData,
          preventUrlUpload: true,
          multiple: false
        }
      }
    );

    dialog.afterClosed().pipe(
      take(1),
      tap(data => {
        if (!data) {
          return;
        }

        if (data.type === 'file') {
          this.fileChange(data.event);
        } else if (data.type === 'url') {
          this.name = data.name || data.url || '';
          this.cData.control.setValue(data.url);
          this.cdr.markForCheck();
        }
      })
    ).subscribe();
  }

  fileChange(ev: Event) {
    const el = ev.target as HTMLInputElement;
    const file = Array.from(el.files as FileList)[0] as File;

    Object.defineProperty(file, 'name', {
      writable: true,
      value: formatFileName(file.name)
    });

    if (!this.allowedFileTypes.includes(file.type) && !!this.allowedFileTypes.length) {
      this.errorSnack('fbFieldsMat.FILE.INVALID_FILE_FORMAT');
      return throwError('Invalid File Format');
    }

    if (this.forbiddenFileTypes.includes(file.type)) {
      this.errorSnack('fbFieldsMat.FILE.FORBIDDEN_FILE_FORMAT');
      return throwError('Forbidden File Format');
    }

    if (file.size < this.minSizeBytes) {
      this.errorSnack('fbFieldsMat.FILE.BELOW_SIZE');
      return throwError('File below minimal allowed size');
    }

    if (file.size > this.maxSizeBytes && !!this.maxSizeBytes) {
      this.errorSnack('fbFieldsMat.FILE.EXCEED_SIZE');
      return throwError('File exceeding allowed size');
    }

    this.value = file;
    if (this.value) {
      this.name = this.value.name;
    }
    el.value = '';
    this.cData.control.setValue(file);
    this.cdr.markForCheck();
  }

  clear() {
    this.name = '';
    this.cData.control.setValue('');
  }
}
