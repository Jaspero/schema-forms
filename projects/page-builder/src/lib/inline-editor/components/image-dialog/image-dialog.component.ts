import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'fb-pb-image-dialog',
  templateUrl: './image-dialog.component.html',
  styleUrls: ['./image-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageDialogComponent implements OnInit {
  constructor(
    private fb: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA)
    private url: string
  ) { }

  form: UntypedFormGroup;

  ngOnInit() {
    this.form = this.fb.group({
      url: this.url || ''
    })
  }
}
