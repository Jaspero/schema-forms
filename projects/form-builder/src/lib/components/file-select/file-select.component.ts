import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatTabGroup} from '@angular/material/tabs';

export interface FileSelectData {
  multiple?: boolean;
  preventServerUpload?: boolean;
  preventUrlUpload?: boolean;
  uploadMethods?: {
    label: string;
    component: string;
  }[];
}

@Component({
  selector: 'fb-file-select',
  templateUrl: './file-select.component.html',
  styleUrls: ['./file-select.component.scss']
})
export class FileSelectComponent implements AfterViewInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: FileSelectData,
    private dialogRef: MatDialogRef<FileSelectComponent>
  ) {
    data.uploadMethods = data.uploadMethods || [];
  }

  @ViewChild('tabGroup')
  tabGroup: MatTabGroup;

  @ViewChild('file')
  fileEl: ElementRef<HTMLInputElement>;

  ngAfterViewInit() {
    (window as any).fileSelectDialogRef = this.dialogRef;
    (window as any).fileSelectRealignInkBar = this.tabGroup.realignInkBar;
  }

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

  urlChanged(url: string) {
    this.dialogRef.close({
      type: 'url',
      url
    });
  }
}
