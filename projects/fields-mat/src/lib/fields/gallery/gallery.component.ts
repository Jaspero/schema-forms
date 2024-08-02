import {CdkDragDrop, CdkDropList, CdkDropListGroup, moveItemInArray} from '@angular/cdk/drag-drop';
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
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {
  COMPONENT_DATA,
  FieldComponent,
  FieldData,
  formatFileName,
  formatGeneratedImages,
  FormBuilderService,
  GeneratedImage,
  STORAGE_URL,
  StorageService,
  ProcessConfig
} from '@jaspero/form-builder';
import {random, sizeToBytes} from '@jaspero/utils';
import {TranslocoService} from '@jsverse/transloco';
import {set} from 'json-pointer';
import {forkJoin, from, of, throwError} from 'rxjs';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {readFile} from './read-file';

export interface GalleryConfiguration {
  allowUrl?: boolean;
  allowServerUpload?: boolean;
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
  toRemove?: any[];
}

export type GalleryData = GalleryConfiguration & FieldData;

@Component({
  selector: 'fb-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryComponent extends FieldComponent<GalleryData> implements OnInit {
  constructor(
    @Inject(COMPONENT_DATA)
    public cData: GalleryData,
    @Optional()
    @Inject(STORAGE_URL)
    private storageUrl: string,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    @Optional() private storage: StorageService,
    private formBuilderService: FormBuilderService,
    private transloco: TranslocoService,
    private snackBar: MatSnackBar
  ) {
    super(cData);
  }

  @ViewChild('dlg', {static: true, read: CdkDropListGroup})
  listGroup: CdkDropListGroup<CdkDropList>;

  @ViewChild('dl', {static: true, read: CdkDropList})
  placeholder: CdkDropList;

  @ViewChild('modal', {static: true})
  modalTemplate: TemplateRef<any>;

  @ViewChild('imagesSort', {static: true})
  imagesSort: TemplateRef<any>;

  @ViewChild('file', {static: true})
  fileEl: ElementRef<HTMLInputElement>;

  target: CdkDropList | null;
  insertAfter: boolean;
  source: CdkDropList | null;
  sourceIndex: number;
  files: File[] = [];

  allowedImageTypes: string[];
  forbiddenImageTypes: string[];
  minSizeBytes: number;
  maxSizeBytes: number;
  activeContainer;

  ngOnInit() {
    this.allowedImageTypes = this.cData.allowedImageTypes || [];
    this.forbiddenImageTypes = this.cData.forbiddenImageTypes || [];
    this.minSizeBytes = this.cData.minSize ? sizeToBytes(this.cData.minSize) : 0;
    this.maxSizeBytes = this.cData.maxSize ? sizeToBytes(this.cData.maxSize) : 0;

    this.cData.toRemove = [];

    if (!this.cData.hasOwnProperty('allowServerUpload')) {
      this.cData.allowServerUpload = true;
    }

    window.jpFb.assignOperation({
      cData: this.cData,
      save: (data: ProcessConfig<GalleryData>) => {

        const current = window.jpFb.exists(data);

        if (!current.exists) {
          return of(true);
        }

        if (
          !data.cData.toRemove.length &&
          !current.value ||
          !current.value.find((val: any) => !val.live)
        ) {
          return of(true);
        }

        return forkJoin([
          ...data.cData.toRemove.map(file =>
            from(this.storage.storage.refFromURL(file).delete()).pipe(
              /**
               * Dont' fail if files didn't delete
               */
              catchError(() => of([]))
            )
          ),
          ...current.value.reduce((acc: any[], cur: any) => {
            if (cur.live !== undefined && !cur.live) {

              let name = data.cData.preserveFileName ? cur.pushToLive.name : [
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
                name += '.' + (cur.pushToLive.name.split('.')[1]);;
              }

              acc.push(
                from(
                  this.storage.upload((this.cData.filePrefix || '') + name, cur.pushToLive, {
                    contentType: cur.pushToLive.type,
                    customMetadata: {
                      moduleId: data.collectionId,
                      documentId: data.documentId,
                      ...data.cData.generatedImages &&
                      formatGeneratedImages(data.cData.generatedImages)
                    }
                  })
                )
                  .pipe(
                    switchMap((task: any) => this.storage.getDownloadURL(task.ref)),
                    tap(url => cur.data = url)
                  )
              );
            } else {
              acc.push(cur);
            }

            return acc;
          }, [])
        ])
          .pipe(
            tap(() =>
              set(
                data.outputValue,
                data.pointer,
                current.value.map((item: any) => (item.data ? item.data : item))
              )
            )
          );
      }
    });
  }

  openUploadDialog() {
    this.dialog.open(this.modalTemplate, {
      width: '420px'
    });
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
          error: 'fbFieldsMat.GALLERY.UPLOAD_ERROR',
          success: null
        }))
      .subscribe(res => {
        const urlCreator = window.URL || (window as any).webkitURL;
        const value = this.cData.control.value;

        value.push({
          data: urlCreator.createObjectURL(res),
          live: true
        });

        this.cData.control.setValue(value);
        this.cdr.detectChanges();
      });
  }

  openFileUpload() {
    this.fileEl.nativeElement.click();
  }

  openSortImages() {
    this.dialog.open(this.imagesSort, {
      width: '800px'
    });
  }

  drop(event: CdkDragDrop<number>) {
    const value = this.cData.control.value;
    moveItemInArray(
      value,
      event.previousContainer.data,
      event.container.data
    );
    this.cData.control.setValue(value);
    this.cdr.detectChanges();
  }

  move(up = false, index: number) {
    const currentIndex = up ? index - 1 : index + 1;
    const value = this.cData.control.value;
    moveItemInArray(value, index, currentIndex);
    this.cData.control.setValue(value);
    this.cdr.detectChanges();
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

  filesUploaded(el: HTMLInputElement | FileList) {
    const files = Array.from((el instanceof FileList ? el : el.files) as FileList);
    for (const file of files) {
      Object.defineProperty(file, 'name', {
        writable: true,
        value: formatFileName(file.name)
      });

      const type = file.type.split('/')[1].toLowerCase();

      if (!this.allowedImageTypes.includes(type) && !!this.allowedImageTypes.length) {
        this.errorSnack('fbFieldsMat.GALLERY.INVALID_IMAGE_FORMAT');
        return throwError('Invalid Image Format');
      }

      if (this.forbiddenImageTypes.includes(type)) {
        this.errorSnack('fbFieldsMat.GALLERY.FORBIDDEN_IMAGE_FORMAT');
        return throwError('Forbidden Image Format');
      }

      if (file.size < this.minSizeBytes) {
        this.errorSnack('fbFieldsMat.GALLERY.BELOW_SIZE');
        return throwError('Image below minimal allowed size');
      }

      if (file.size > this.maxSizeBytes && !!this.maxSizeBytes) {
        this.errorSnack('fbFieldsMat.GALLERY.EXCEED_SIZE');
        return throwError('Image exceeding allowed size');
      }
    }

    forkJoin(
      files.map(file =>
        readFile(file).pipe(
          map(data => ({
            data,
            pushToLive: file,
            live: false
          }))
        )
      )
    ).subscribe(
      fls => {
        const value = this.cData.control.value;
        value.push(...fls);
        this.cData.control.setValue(value);

        if (!(el instanceof FileList)) {
          el.value = '';
        }

        this.cdr.detectChanges();
      },
      () => {
        if (!(el instanceof FileList)) {
          el.value = '';
        }
      }
    );
  }

  removeImage(index: number, item: any) {
    if (item.live && item.data.includes(this.storageUrl)) {
      this.cData.toRemove.push(item.data);
    }

    this.cData.control.value.splice(index, 1);
  }

  sortDrop(event: CdkDragDrop<string[]>) {
    const value = this.cData.control.value;
    moveItemInArray(value, event.previousIndex, event.currentIndex);
    this.cData.control.setValue(value);
    this.cdr.detectChanges();
  }
}
