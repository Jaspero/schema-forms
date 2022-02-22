import {HttpClient} from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {
  COMPONENT_DATA,
  FieldComponent,
  FieldData,
  FormBuilderService,
  GeneratedImage,
  StorageService,
  UploadMethod,
  formatFileName,
  formatGeneratedImages,
  ProcessConfig
} from '@jaspero/form-builder';
import {sizeToBytes, random} from '@jaspero/utils';
import {TranslocoService} from '@ngneat/transloco';
import {set} from 'json-pointer';
import {from, Observable, of, throwError} from 'rxjs';
import {map, startWith, switchMap, take, tap} from 'rxjs/operators';
import {FileSelectComponent} from '../../components/file-select/file-select.component';

export interface ImageConfiguration {
  preventServerUpload?: boolean;
  preventUrlUpload?: boolean;
  preventStorageUpload?: boolean;
  generatedImages?: GeneratedImage[];
  allowedImageTypes?: string[];
  forbiddenImageTypes?: string[];
  minSize?: string | number;
  maxSize?: string | number;
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

  @ViewChild('modal', {static: true})
  modalTemplate: TemplateRef<any>;

  @ViewChild('file', {static: true})
  fileEl: ElementRef<HTMLInputElement>;

  value: File | null;
  imageUrl: FormControl;
  disInput = false;
  imageSrc: SafeResourceUrl;

  allowedImageTypes: string[];
  forbiddenImageTypes: string[];
  minSizeBytes: number;
  maxSizeBytes: number;

  displayName$: Observable<string>;

  ngOnInit() {
    this.imageUrl = new FormControl(this.cData.control.value);

    this.allowedImageTypes = this.cData.allowedImageTypes || [];
    this.forbiddenImageTypes = this.cData.forbiddenImageTypes || [];
    this.minSizeBytes = this.cData.minSize ? sizeToBytes(this.cData.minSize) : 0;
    this.maxSizeBytes = this.cData.maxSize ? sizeToBytes(this.cData.maxSize) : 0;

    this.displayName$ = this.imageUrl.valueChanges
      .pipe(
        startWith(this.imageUrl.value),
        map(value =>
          typeof value === 'object' ? (value?.name || '') : value
        )
      )

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
            name += '.' + (current.value.name.split('.')[1]);;
          }

          return from(
            this.storage.upload(name, current.value, {
              contentType: current.value.type,
              customMetadata: {
                moduleId: data.collectionId,
                documentId: data.documentId,
                ...(data.cData.generatedImages &&
                  formatGeneratedImages(data.cData.generatedImages))
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
    });
  }

  errorSnack(message: string = 'GENERAL.ERROR', dismiss: string = 'GENERAL.DISMISS') {
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
            this.value = null;
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
      this.errorSnack('FIELDS.GALLERY.INVALID_IMAGE_FORMAT');
      return throwError('Invalid Image Format');
    }

    if (this.forbiddenImageTypes.includes(image.type)) {
      this.errorSnack('FIELDS.GALLERY.FORBIDDEN_IMAGE_FORMAT');
      return throwError('Forbidden Image Format');
    }

    if (image.size < this.minSizeBytes) {
      this.errorSnack('FIELDS.GALLERY.BELOW_SIZE');
      return throwError('Image below minimal allowed size');
    }

    if (image.size > this.maxSizeBytes && !!this.maxSizeBytes) {
      this.errorSnack('FIELDS.GALLERY.EXCEED_SIZE');
      return throwError('Image exceeding allowed size');
    }

    this.value = image;
    this.disInput = true;
    this.imageUrl.setValue(this.value.name);
    this.cData.control.setValue(image);

    const reader = new FileReader();
    reader.onload = () => {
      this.imageSrc = this.domSanitizer.bypassSecurityTrustResourceUrl(
        reader.result as string
      );
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(this.value);

    el.value = '';
  }

  remove() {
    this.imageUrl.setValue('');
    this.value = null;
    this.disInput = false;
    this.cData.control.setValue('');
    this.cdr.detectChanges();
  }

  addImage(image: string) {
    this.http
      .get(image, {
        withCredentials: false,
        responseType: 'blob'
      })
      .pipe(
        switchMap((blob: Blob) => {
          const type = blob.type.split('/')[1].toLowerCase();
          if (!this.allowedImageTypes.includes(type) && !!this.allowedImageTypes.length) {
            return throwError('Invalid Image Format');
          }

          if (this.forbiddenImageTypes.includes(type)) {
            return throwError('Forbidden Image Format');
          }

          if (blob.size < this.minSizeBytes) {
            return throwError('Image below minimal allowed size');
          }

          if (blob.size > this.maxSizeBytes && !!this.maxSizeBytes) {
            return throwError('Image exceeding allowed size');
          }

          return of(blob);
        }),
        this.formBuilderService.notify({
          error: 'FIELDS.GALLERY.UPLOAD_ERROR',
          success: null
        }))
      .subscribe(res => {
        this.value = new File([res], image);
        this.disInput = true;
        this.imageUrl.setValue(image);

        const reader = new FileReader();
        reader.readAsDataURL(res);
        reader.onload = () => {
          this.imageSrc = this.domSanitizer.bypassSecurityTrustResourceUrl(
            reader.result as string
          );
          this.cdr.detectChanges();
        };
      });
  }
}
