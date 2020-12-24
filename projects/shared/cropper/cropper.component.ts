import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {ImageDataConverter} from './utils/image-data-converter';
import Cropper from 'cropperjs';
import {CropperData} from './cropper.interface';

@Component({
  selector: 'fb-cr-cropper',
  templateUrl: './cropper.component.html',
  styleUrls: ['./cropper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CropperComponent implements OnInit, AfterViewInit {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: CropperData,
    private dialogRef: MatDialogRef<CropperComponent>,
    private sanitizer: DomSanitizer
  ) {
  }

  @ViewChild('image', {static: false})
  public imageElement: ElementRef;

  cropper: Cropper;
  file: SafeUrl;

  ngOnInit() {
    this.file = this.sanitizer.bypassSecurityTrustUrl(
      URL.createObjectURL(this.data.file)
    );
  }

  ngAfterViewInit() {
    this.cropper = new Cropper(
      this.imageElement.nativeElement,
      this.data.cropperOptions || {}
    );
  }

  submit() {
    const canvas = this.cropper.getCroppedCanvas({
      fillColor: 'white',
      maxWidth: this.data.maxWidth || 200,
      maxHeight: this.data.maxHeight || 200,
      minWidth: this.data.minWidth || 200,
      minHeight: this.data.minHeight || 200
    });
    const dataUrl = canvas.toDataURL('image/jpeg');
    this.dialogRef.close({
      file: new ImageDataConverter(dataUrl).dataURItoBlob()
    });
  }
}
