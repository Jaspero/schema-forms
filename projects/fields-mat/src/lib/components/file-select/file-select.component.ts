import {Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UploadMethod} from '@jaspero/form-builder';

export interface FileSelectData {
  multiple?: boolean;
  preventServerUpload?: boolean;
  uploadMethods?: UploadMethod[];
}

@Component({
  selector: 'fb-file-select',
  templateUrl: './file-select.component.html',
  styleUrls: ['./file-select.component.scss']
})
export class FileSelectComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: FileSelectData,
    private dialogRef: MatDialogRef<FileSelectComponent>
  ) {
    data.uploadMethods = data.uploadMethods || [];

    (window as any).fileSelect = {
      dialogRef: this.dialogRef,
      uploadMethods: this.data.uploadMethods
    }
  }

  @ViewChild('file')
  fileEl: ElementRef<HTMLInputElement>;

  openFileSystem() {
    this.fileEl.nativeElement.click();
  }

  filesChanged(event: Event) {
    this.dialogRef.close({
      type: 'file',
      event
    });
  }

  filesDropped(files: FileList) {
    this.fileEl.nativeElement.files = files;

    this.dialogRef.close({
      type: 'file',
      event: {
        target: this.fileEl.nativeElement
      }
    });
  }
}
