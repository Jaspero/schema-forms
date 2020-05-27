import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {from, of, throwError} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {FieldComponent} from '../../field/field.component';
import {FormBuilderService} from '../../form-builder.service';
import {FieldData} from '../../interfaces/field-data.interface';
import {StorageService} from '../../services/storage.service';
import {COMPONENT_DATA} from '../../utils/create-component-injector';
import {TranslocoService} from '@ngneat/transloco';
import {MatSnackBar} from '@angular/material/snack-bar';
import {parseSize} from '../../utils/parse-size';

interface FileData extends FieldData {
  emptyLabel?: string;
  preventClear?: boolean;
  allowedFileTypes?: string[];
  forbiddenFileTypes?: string[];
  minSize?: string | number;
  maxSize?: string | number;
}

@Component({
  selector: 'fb-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileComponent extends FieldComponent<FileData> implements OnInit {
  @ViewChild('file', {static: true})
  fileEl: ElementRef<HTMLInputElement>;
  value: File;
  name: string;
  emptyLabel: string;

  allowedFileTypes: string[];
  forbiddenFileTypes: string[];
  minSizeBytes: number;
  maxSizeBytes: number;

  constructor(
    @Inject(COMPONENT_DATA) public cData: FileData,
    private storage: StorageService,
    private cdr: ChangeDetectorRef,
    private formBuilderService: FormBuilderService,
    private transloco: TranslocoService,
    private snackBar: MatSnackBar
  ) {
    super(cData);
  }

  ngOnInit() {
    if (this.cData.control.value) {
      this.name = this.cData.control.value;
    }

    this.emptyLabel = (this.cData.hasOwnProperty('emptyLabel') ? this.cData.emptyLabel : 'FIELDS.FILE.EMPTY') as string;

    this.formBuilderService.saveComponents.push(this);

    this.allowedFileTypes = this.cData.allowedFileTypes || [];
    this.forbiddenFileTypes = this.cData.forbiddenFileTypes || [];
    this.minSizeBytes = this.cData.minSize ? parseSize(this.cData.minSize) : 0;
    this.maxSizeBytes = this.cData.maxSize ? parseSize(this.cData.maxSize) : 0;
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

  fileChange(ev: Event) {
    const el = ev.target as HTMLInputElement;
    const file = Array.from(el.files as FileList)[0] as File;

    if (!this.allowedFileTypes.includes(file.type) && !!this.allowedFileTypes.length) {
      this.errorSnack('FIELDS.FILE.INVALID_FILE_FORMAT');
      return throwError('Invalid File Format');
    }

    if (this.forbiddenFileTypes.includes(file.type)) {
      this.errorSnack('FIELDS.FILE.FORBIDDEN_FILE_FORMAT');
      return throwError('Forbidden File Format');
    }

    if (file.size < this.minSizeBytes) {
      this.errorSnack('FIELDS.FILE.BELOW_SIZE');
      return throwError('File below minimal allowed size');
    }

    if (file.size > this.maxSizeBytes && !!this.maxSizeBytes) {
      this.errorSnack('FIELDS.FILE.EXCEED_SIZE');
      return throwError('File exceeding allowed size');
    }

    this.value = file;
    if (this.value) {
      this.name = this.value.name;
    }
    el.value = '';
  }

  clear() {
    this.name = '';
    this.cData.control.setValue('');
  }

  save(moduleId: string, documentId: string) {
    if (this.value) {
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
            documentId
          }
        })
      ).pipe(
        switchMap((res: any) => res.ref.getDownloadURL()),
        tap(url => this.cData.control.setValue(url))
      );
    } else {
      return of({});
    }
  }
}
