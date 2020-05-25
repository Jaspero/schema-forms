import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {from, of, throwError} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {FieldComponent} from '../../field/field.component';
import {FormBuilderService} from '../../form-builder.service';
import {FieldData} from '../../interfaces/field-data.interface';
import {GeneratedImage} from '../../interfaces/generated-image.interface';
import {StorageService} from '../../services/storage.service';
import {COMPONENT_DATA} from '../../utils/create-component-injector';
import {formatGeneratedImages} from '../../utils/format-generated-images';
import {IMAGE_MAX_SIZE, IMAGE_TYPES} from '../../consts/image-restriction.const';
import {TranslocoService} from '@ngneat/transloco';
import {MatSnackBar} from '@angular/material/snack-bar';

interface ImageData extends FieldData {
  preventServerUpload?: boolean;
  generatedImages?: GeneratedImage[];
}

@Component({
  selector: 'fb-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageComponent extends FieldComponent<ImageData>
  implements OnInit {
  @ViewChild('file', {static: true})
  fileEl: ElementRef<HTMLInputElement>;
  value: File | null;
  imageUrl: FormControl;
  disInput = false;
  imageSrc: string;

  constructor(
    @Inject(COMPONENT_DATA) public cData: ImageData,
    private storage: StorageService,
    private cdr: ChangeDetectorRef,
    private formBuilderService: FormBuilderService,
    private transloco: TranslocoService,
    private snackBar: MatSnackBar
  ) {
    super(cData);
  }

  ngOnInit() {
    this.imageUrl = new FormControl(this.cData.control.value);
    this.formBuilderService.saveComponents.push(this);
  }

  openFileUpload() {
    this.fileEl.nativeElement.click();
  }

  filesImage(event: Event) {
    const el = event.target as HTMLInputElement;
    const image = Array.from(el.files as FileList)[0] as File;

    if (!IMAGE_TYPES.includes(image.type)) {
      this.snackBar.open(
        this.transloco.translate('FIELDS.GALLERY.INVALID_IMAGE_FORMAT'),
        this.transloco.translate('GENERAL.DISMISS'),
        {
          panelClass: 'snack-bar-error',
          duration: 5000
        }
      );
      return throwError('Invalid Image Format');
    }

    if (image.size > IMAGE_MAX_SIZE) {
      this.snackBar.open(
        this.transloco.translate('FIELDS.GALLERY.EXCEED_SIZE'),
        this.transloco.translate('GENERAL.DISMISS'),
        {
          panelClass: 'snack-bar-error',
          duration: 5000
        }
      );
      return throwError('Image exceeding allowed size');
    }

    this.value = image;
    this.disInput = true;
    this.imageUrl.setValue(this.value.name);

    const reader = new FileReader();
    reader.onload = () => {
      this.imageSrc = reader.result as string;
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

        const name = [
          moduleId,
          documentId,
          this.value.name
        ]
          .join('-');

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
}
