import {HttpClient} from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {TranslocoService} from '@ngneat/transloco';
import {from, of, throwError} from 'rxjs';
import {switchMap, take, tap} from 'rxjs/operators';
import {FileSelectComponent} from '../../components/file-select/file-select.component';
import {FieldComponent} from '../../field/field.component';
import {FormBuilderService} from '../../form-builder.service';
import {FieldData} from '../../interfaces/field-data.interface';
import {GeneratedImage} from '../../interfaces/generated-image.interface';
import {StorageService} from '../../services/storage.service';
import {COMPONENT_DATA} from '../../utils/create-component-injector';
import {formatFileName} from '../../utils/format-file-name';
import {formatGeneratedImages} from '../../utils/format-generated-images';
import {parseSize} from '../../utils/parse-size';
import {random} from '../../utils/random';

interface ImageData extends FieldData {
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
}

@Component({
  selector: 'fb-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageComponent extends FieldComponent<ImageData>
  implements OnInit, OnDestroy {
  constructor(
    @Inject(COMPONENT_DATA) public cData: ImageData,
    @Optional() private storage: StorageService,
    private cdr: ChangeDetectorRef,
    private formBuilderService: FormBuilderService,
    private transloco: TranslocoService,
    private snackBar: MatSnackBar,
    private domSanitizer: DomSanitizer,
    private http: HttpClient,
    private dialog: MatDialog
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

  ngOnInit() {
    this.imageUrl = new FormControl(this.cData.control.value);
    this.formBuilderService.saveComponents.push(this);

    this.allowedImageTypes = this.cData.allowedImageTypes || [];
    this.forbiddenImageTypes = this.cData.forbiddenImageTypes || [];
    this.minSizeBytes = this.cData.minSize ? parseSize(this.cData.minSize) : 0;
    this.maxSizeBytes = this.cData.maxSize ? parseSize(this.cData.maxSize) : 0;
  }

  ngOnDestroy() {
    this.formBuilderService.removeComponent(this);
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
    const dialog = this.dialog.open(
      FileSelectComponent,
      {
        data: {
          ...this.cData,
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
          this.filesImage(data.event);
        } else if (data.type === 'url') {
          this.addImage(data.url);
        }
      })
    ).subscribe();
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

    const reader = new FileReader();
    reader.onload = () => {
      this.imageSrc = this.domSanitizer.bypassSecurityTrustResourceUrl(
        reader.result as string
      );

      /**
       * Set value in case it's needed for previews
       */
      this.cData.control.setValue(reader.result);

      this.cdr.detectChanges();
    };
    reader.readAsDataURL(this.value);

    el.value = '';
  }

  remove() {
    this.imageUrl.setValue('');
    this.value = null;
    this.disInput = false;
    this.cdr.detectChanges();
  }

  save(moduleId: string, documentId: string) {
    if (this.value) {
      if (this.imageUrl.value && this.imageUrl.value !== this.value.name) {
        return of(this.imageUrl.value).pipe(
          tap(() => this.cData.control.setValue(this.imageUrl.value))
        );
      } else {
        const name = this.cData.preserveFileName ? this.value.name : [
          moduleId,
          documentId,
          random.string()
        ].join('-');

        return from(
          this.storage.upload(name, this.value, {
            contentType: this.value.type,
            customMetadata: {
              moduleId,
              documentId,
              ...(this.cData.generatedImages &&
                formatGeneratedImages(this.cData.generatedImages))
            }
          })
        ).pipe(
          switchMap((res: any) => res.ref.getDownloadURL()),
          tap(url => this.cData.control.setValue(url))
        );
      }
    } else {
      this.cData.control.setValue(this.imageUrl.value);
      return of({});
    }
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

          /**
           * Set value in case it's needed for previews
           */
          this.cData.control.setValue(reader.result);

          this.cdr.detectChanges();
        };
      });
  }

  openUploadDialog() {
    this.dialog.open(this.modalTemplate, {
      width: '420px'
    });
  }
}
