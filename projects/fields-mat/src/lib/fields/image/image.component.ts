import {HttpClient} from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, Inject,
  OnInit,
  Optional
} from '@angular/core';
import {UntypedFormControl} from '@angular/forms';
import {MatLegacyDialog as MatDialog} from '@angular/material/legacy-dialog';
import {MatLegacySnackBar as MatSnackBar} from '@angular/material/legacy-snack-bar';
import {DomSanitizer} from '@angular/platform-browser';
import {
  COMPONENT_DATA,
  FieldComponent,
  FieldData, formatFileName,
  formatGeneratedImages, FormBuilderService,
  GeneratedImage, ProcessConfig, StorageService,
  UploadMethod
} from '@jaspero/form-builder';
import {random, sizeToBytes} from '@jaspero/utils';
import {TranslocoService} from '@ngneat/transloco';
import {set} from 'json-pointer';
import {from, Observable, of, throwError} from 'rxjs';
import {map, startWith, switchMap, take, tap} from 'rxjs/operators';
import {FileSelectComponent} from '../../components/file-select/file-select.component';

export interface ImageConfiguration {
  preventServerUpload?: boolean;
  preventStorageUpload?: boolean;
  generatedImages?: GeneratedImage[];
  allowedImageTypes?: string[];
  forbiddenImageTypes?: string[];
  minSize?: string | number;
  maxSize?: string | number;
  filePrefix?: string;
  /**
   * Overwrite existing file if already exists
   */
  preserveFileName?: boolean;
  uploadMethods?: UploadMethod[];
}

export type ImageData = ImageConfiguration & FieldData;

@Component({
  selector: 'fb-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageComponent extends FieldComponent<ImageData> implements OnInit {
  constructor(
    @Inject(COMPONENT_DATA) public cData: ImageData,
    @Optional() public storage: StorageService,
    public cdr: ChangeDetectorRef,
    public formBuilderService: FormBuilderService,
    public transloco: TranslocoService,
    public snackBar: MatSnackBar,
    public domSanitizer: DomSanitizer,
    public http: HttpClient,
    public dialog: MatDialog
  ) {
    super(cData);
  }

  imageUrl: UntypedFormControl;
  disInput = false;

  allowedImageTypes: string[];
  forbiddenImageTypes: string[];
  minSizeBytes: number;
  maxSizeBytes: number;

  displayName$: Observable<string>;

  get control() {
    return this.cData.control;
  }

  get cValue() {
    return this.control.value;
  }

  ngOnInit() {
    this.imageUrl = new UntypedFormControl(this.cValue);

    this.allowedImageTypes = this.cData.allowedImageTypes || [];
    this.forbiddenImageTypes = this.cData.forbiddenImageTypes || [];
    this.minSizeBytes = this.cData.minSize ? sizeToBytes(this.cData.minSize) : 0;
    this.maxSizeBytes = this.cData.maxSize ? sizeToBytes(this.cData.maxSize) : 0;

    this.displayName$ = this.imageUrl.valueChanges
      .pipe(
        startWith(this.imageUrl.value),
        map(value => {
          if (!value) {
            return '';
          }

          let url: URL;

          try {
            url = new URL(
              value
                .replace(/^blob:/, '')
                .replace('#', '')
            );
          } catch (e) {
            return value;
          }

          if (url.searchParams.has('name')) {
            return url.searchParams.get('name');
          }

          return url.pathname;
        })
      );

    /**
     * TODO:
     * Handle cases when !data.direct
     * currently any url selection is treaded as direct
     */
    window.jpFb.assignOperation({
      cData: this.cData,
      save: (data: ProcessConfig<ImageData>) => {

        const current = window.jpFb.exists(data);

        if (!current.exists || !window.jpFb.change(data)) {
          return of(true);
        }

        if (
          current.value &&
          /**
           * We create blobs only when a file was selected
           */
          current.value.startsWith('blob:')
        ) {

          let name: string;

          if (data.cData.preserveFileName) {
            const url = new URL(
              current.value
                .replace(/^blob:/, '')
                .replace('#', '')
            );

            if (url.searchParams.has('name')) {
              name = url.searchParams.get('name');
            }
          } else {
            name = [
              data.collectionId,
              data.documentId,
              random.string()
            ].join('-') + '.' + (current.value.split('.').pop());
          }

          return this.http.get(current.value, {responseType: 'blob'})
            .pipe(
              switchMap(res =>
                from(
                  this.storage.upload((this.cData.filePrefix || '') + name, res, {
                    contentType: res.type,
                    customMetadata: {
                      moduleId: data.collectionId,
                      documentId: data.documentId,
                      ...(data.cData.generatedImages &&
                        formatGeneratedImages(data.cData.generatedImages))
                    }
                  })
                )
              ),
              switchMap((res: any) => this.storage.getDownloadURL(res.ref)),
              tap(url => set(data.outputValue, data.pointer, url))
            );
        }

        return of(true);
      }
    });
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
    this.dialog.open(
      FileSelectComponent,
      {
        autoFocus: false,
        data: {
          ...this.cData,
          multiple: false
        }
      }
    ).afterClosed()
      .pipe(
        take(1),
        tap(data => {
          if (!data) {
            return;
          }

          if (data.type === 'file') {
            this.filesImage(data.event);
          } else if (data.type === 'url') {
            this.imageUrl.setValue(data.url);
            this.cData.control.setValue(data.url);
          }
        })
      )
      .subscribe();
  }

  filesImage(event: Event) {
    const el = event.target as HTMLInputElement;
    const image = Array.from(el.files as FileList)[0] as File;

    Object.defineProperty(image, 'name', {
      writable: true,
      value: formatFileName(image.name)
    });

    if (!this.allowedImageTypes.includes(image.type) && !!this.allowedImageTypes.length) {
      this.errorSnack('fbFieldsMat.GALLERY.INVALID_IMAGE_FORMAT');
      return throwError('Invalid Image Format');
    }

    if (this.forbiddenImageTypes.includes(image.type)) {
      this.errorSnack('fbFieldsMat.GALLERY.FORBIDDEN_IMAGE_FORMAT');
      return throwError('Forbidden Image Format');
    }

    if (image.size < this.minSizeBytes) {
      this.errorSnack('fbFieldsMat.GALLERY.BELOW_SIZE');
      return throwError('Image below minimal allowed size');
    }

    if (image.size > this.maxSizeBytes && !!this.maxSizeBytes) {
      this.errorSnack('fbFieldsMat.GALLERY.EXCEED_SIZE');
      return throwError('Image exceeding allowed size');
    }

    // @ts-ignore
    const url = URL.createObjectURL(image) + `#?name=${image.name}`;

    this.disInput = true;
    this.imageUrl.setValue(url);
    this.cData.control.setValue(url);

    el.value = '';
  }

  remove() {
    this.imageUrl.setValue('');
    this.disInput = false;
    this.cData.control.setValue('');
    this.cdr.detectChanges();
  }
}
