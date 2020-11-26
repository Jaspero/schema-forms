import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {ViewportRuler} from '@angular/cdk/overlay';
import {HttpClient} from '@angular/common/http';
import {
  AfterViewInit,
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
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslocoService} from '@ngneat/transloco';
import {forkJoin, from, of, throwError} from 'rxjs';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {FieldComponent} from '../../field/field.component';
import {FormBuilderService} from '../../form-builder.service';
import {FieldData} from '../../interfaces/field-data.interface';
import {GeneratedImage} from '../../interfaces/generated-image.interface';
import {StorageService} from '../../services/storage.service';
import {COMPONENT_DATA} from '../../utils/create-component-injector';
import {formatFileName} from '../../utils/format-file-name';
import {formatGeneratedImages} from '../../utils/format-generated-images';
import {parseSize} from '../../utils/parse-size';
import {STORAGE_URL} from '../../utils/storage-url';
import {switchItemLocations} from '../../utils/switch-item-locations';
import {readFile} from './read-file';

interface GalleryData extends FieldData {
  allowUrl?: boolean;
  allowServerUpload?: boolean;
  generatedImages?: GeneratedImage[];
  allowedImageTypes?: string[];
  forbiddenImageTypes?: string[];
  minSize?: string | number;
  maxSize?: string | number;
}

@Component({
  selector: 'fb-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryComponent extends FieldComponent<GalleryData>
  implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    @Inject(COMPONENT_DATA)
    public cData: GalleryData,
    @Optional()
    @Inject(STORAGE_URL)
    private storageUrl: string,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private storage: StorageService,
    private formBuilderService: FormBuilderService,
    private viewportRuler: ViewportRuler,
    private transloco: TranslocoService,
    private snackBar: MatSnackBar
  ) {
    super(cData);
  }

  @ViewChild(CdkDropList, {static: true})
  placeholder: CdkDropList;
  @ViewChild('modal', {static: true})
  modalTemplate: TemplateRef<any>;
  @ViewChild('imagesSort', {static: true})
  imagesSort: TemplateRef<any>;
  @ViewChild('file', {static: true})
  fileEl: ElementRef<HTMLInputElement>;
  target: CdkDropList | null;
  targetIndex: number;
  insertAfter: boolean;
  source: CdkDropList | null;
  sourceIndex: number;;
  files: File[] = [];
  toRemove: any[] = [];

  allowedImageTypes: string[];
  forbiddenImageTypes: string[];
  minSizeBytes: number;
  maxSizeBytes: number;

  ngOnInit() {
    this.formBuilderService.saveComponents.push(this);

    this.allowedImageTypes = this.cData.allowedImageTypes || [];
    this.forbiddenImageTypes = this.cData.forbiddenImageTypes || [];
    this.minSizeBytes = this.cData.minSize ? parseSize(this.cData.minSize) : 0;
    this.maxSizeBytes = this.cData.maxSize ? parseSize(this.cData.maxSize) : 0;

    if (!this.cData.hasOwnProperty('allowServerUpload')) {
      this.cData.allowServerUpload = true;
    }
  }

  ngAfterViewInit() {
    const phElement = this.placeholder.element.nativeElement;
    const {parentElement} = phElement as any;

    phElement.style.display = 'none';
    parentElement.removeChild(phElement);
  }

  ngOnDestroy() {
    this.formBuilderService.removeComponent(this);
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
          error: 'FIELDS.GALLERY.UPLOAD_ERROR',
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

  drop(event: CdkDragDrop<string[]>) {
    const value = this.cData.control.value;
    switchItemLocations(value, event.previousIndex, event.currentIndex);
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

  filesUploaded(el: HTMLInputElement | FileList) {
    const files = Array.from((el instanceof FileList ? el : el.files) as FileList);
    for (const file of files) {
      Object.defineProperty(file, 'name', {
        writable: true,
        value: formatFileName(file.name)
      });

      const type = file.type.split('/')[1].toLowerCase();

      if (!this.allowedImageTypes.includes(type) && !!this.allowedImageTypes.length) {
        this.errorSnack('FIELDS.GALLERY.INVALID_IMAGE_FORMAT');
        return throwError('Invalid Image Format');
      }

      if (this.forbiddenImageTypes.includes(type)) {
        this.errorSnack('FIELDS.GALLERY.FORBIDDEN_IMAGE_FORMAT');
        return throwError('Forbidden Image Format');
      }

      if (file.size < this.minSizeBytes) {
        this.errorSnack('FIELDS.GALLERY.BELOW_SIZE');
        return throwError('Image below minimal allowed size');
      }

      if (file.size > this.maxSizeBytes && !!this.maxSizeBytes) {
        this.errorSnack('FIELDS.GALLERY.EXCEED_SIZE');
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
      this.toRemove.push(item.data);
    }

    this.cData.control.value.splice(index, 1);
  }

  sortDrop(event: CdkDragDrop<string[]>) {
    const value = this.cData.control.value;
    moveItemInArray(value, event.previousIndex, event.currentIndex);
    this.cData.control.setValue(value);
  }

  /**
   * Drag and Drop
   */
  indexOf(collection: any, node: any) {
    return Array.prototype.indexOf.call(collection, node);
  }

  dragDrop() {
    if (!this.target)
      return;

    let phElement = this.placeholder.element.nativeElement;
    let parent = phElement.parentNode as any;

    phElement.style.display = 'none';

    parent.removeChild(phElement);
    parent.appendChild(phElement);
    parent.insertBefore(this.source?.element.nativeElement, parent.children[this.sourceIndex]);

    this.target = null;
    this.source = null;

    if (this.insertAfter && this.cData.control.value.length > this.targetIndex + 1) {
      this.targetIndex ++;
    }

    if (this.sourceIndex != this.targetIndex) {
      const value = this.cData.control.value;
      moveItemInArray(value, this.sourceIndex, this.targetIndex);
      this.cData.control.setValue(value);
    }
  }

  dropListEnterPredicate = (drag: CdkDrag<any>, drop: CdkDropList<any>) => {
    if (drop == this.placeholder)
      return true;

    let phElement = this.placeholder.element.nativeElement;
    let dropElement = drop.element.nativeElement as any;

    let dragIndex = this.indexOf(dropElement.parentNode.children, drag.dropContainer.element.nativeElement);
    let dropIndex = this.indexOf(dropElement.parentNode.children, dropElement);

    let size: any = '';

    if (!this.source) {
      this.sourceIndex = dragIndex;
      this.source = drag.dropContainer;

      let sourceElement = this.source.element.nativeElement as any;
      phElement.style.width = sourceElement.clientWidth + 'px';
      phElement.style.height = sourceElement.clientHeight + 'px';

      sourceElement.parentNode.removeChild(sourceElement);
      size = Array.from(sourceElement.classList)
        .find((c: any) => c.startsWith('content-item-c'));
    }

    this.targetIndex = dropIndex;
    this.target = drop;

    phElement.style.display = '';
    this.insertAfter = (dragIndex < dropIndex);
    dropElement.parentNode.insertBefore(phElement, this.insertAfter ? dropElement.nextSibling : dropElement);


    const oldSize = Array.from(phElement.classList).find(c => c.startsWith('content-item-c'));
    if (oldSize) {
      phElement.classList.remove(oldSize);
    }

    if (size) {
      phElement.classList.add(size);
    }

    this.source._dropListRef.start();
    this.placeholder._dropListRef.enter(drag._dragRef, drag.element.nativeElement.offsetLeft, drag.element.nativeElement.offsetTop);

    return false;
  };

  /**
   * Executes all uploads/removes to persist
   * the changes on server
   */
  save(moduleId: string, documentId: string) {
    if (
      !this.toRemove.length &&
      !this.cData.control.value ||
      !this.cData.control.value.find((val: any) => !val.live)
    ) {
      return of([]);
    }

    return forkJoin([
      ...this.toRemove.map(file =>
        from(this.storage.storage.refFromURL(file).delete()).pipe(
          /**
           * Dont' fail if files didn't delete
           */
          catchError(() => of([]))
        )
      ),
      ...this.cData.control.value.reduce((acc: any[], cur: any) => {
        if (cur.live !== undefined && !cur.live) {

          const name = [
            moduleId,
            documentId,
            cur.pushToLive.name
          ]
            .join('-');

          acc.push(
            from(
              this.storage.upload(name, cur.pushToLive, {
                contentType: cur.pushToLive.type,
                customMetadata: {
                  moduleId,
                  documentId,
                  ...this.cData.generatedImages &&
                  formatGeneratedImages(this.cData.generatedImages)
                }
              })
            ).pipe(
              switchMap((task: any) => task.ref.getDownloadURL()),
              tap(url => {
                cur.data = url;
              })
            )
          );
        } else {
          acc.push(cur);
        }

        return acc;
      }, [])
    ]).pipe(
      tap(() =>
        this.cData.control.setValue(
          this.cData.control.value.map((item: any) => (item.data ? item.data : item))
        )
      )
    );
  }
}
