import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {from, of} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {FieldComponent} from '../../field/field.component';
import {FormBuilderService} from '../../form-builder.service';
import {FieldData} from '../../interfaces/field-data.interface';
import {GeneratedImage} from '../../interfaces/generated-image.interface';
import {StorageService} from '../../services/storage.service';
import {COMPONENT_DATA} from '../../utils/create-component-injector';
import {formatGeneratedImages} from '../../utils/format-generated-images';

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
  constructor(
    @Inject(COMPONENT_DATA) public cData: ImageData,
    private storage: StorageService,
    private cdr: ChangeDetectorRef,
    private formBuilderService: FormBuilderService
  ) {
    super(cData);
  }

  @ViewChild('file', {static: true})
  fileEl: ElementRef<HTMLInputElement>;

  value: File | null;
  imageUrl: FormControl;
  disInput = false;
  imageSrc: string;

  ngOnInit() {
    this.imageUrl = new FormControl(this.cData.control.value);
    this.formBuilderService.saveComponents.push(this);
  }

  openFileUpload() {
    this.fileEl.nativeElement.click();
  }

  filesImage(el: HTMLInputElement) {
    this.value = Array.from(el.files as FileList)[0] as File;

    el.value = '';

    this.disInput = true;
    this.imageUrl.setValue(this.value.name);

    const reader = new FileReader();
    reader.onload = () => {
      this.imageSrc = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(this.value);
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
