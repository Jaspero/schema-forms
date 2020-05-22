import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {from, of, throwError} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {FieldComponent} from '../../field/field.component';
import {FormBuilderService} from '../../form-builder.service';
import {FieldData} from '../../interfaces/field-data.interface';
import {StorageService} from '../../services/storage.service';
import {COMPONENT_DATA} from '../../utils/create-component-injector';
import {ALLOWED_FILE_TYPES, FILE_MAX_SIZE, FORBIDDEN_FILE_TYPES} from '../../consts/file-restriction.const';
import {TranslocoService} from '@ngneat/transloco';
import {MatSnackBar} from '@angular/material/snack-bar';

interface FileData extends FieldData {
  emptyLabel?: string;
  preventClear?: boolean;
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
  }

  fileChange(ev: Event) {
    const el = ev.target as HTMLInputElement;
    const file = Array.from(el.files as FileList)[0] as File;

    if (!ALLOWED_FILE_TYPES.includes('*')) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        this.snackBar.open(
          this.transloco.translate('FIELDS.FILE.INVALID_FILE_FORMAT'),
          this.transloco.translate('GENERAL.DISMISS'),
          {
            panelClass: 'snack-bar-error',
            duration: 5000
          }
        );
        return throwError('Invalid File Format');
      }
    }

    if (FORBIDDEN_FILE_TYPES.includes(file.type)) {
      this.snackBar.open(
        this.transloco.translate('FIELDS.FILE.FORBIDDEN_FILE_FORMAT'),
        this.transloco.translate('GENERAL.DISMISS'),
        {
          panelClass: 'snack-bar-error',
          duration: 5000
        }
      );
      return throwError('Forbidden File Format');
    }

    if (file.size > FILE_MAX_SIZE) {
      this.snackBar.open(
        this.transloco.translate('FIELDS.FILE.EXCEED_SIZE'),
        this.transloco.translate('GENERAL.DISMISS'),
        {
          panelClass: 'snack-bar-error',
          duration: 5000
        }
      );
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
