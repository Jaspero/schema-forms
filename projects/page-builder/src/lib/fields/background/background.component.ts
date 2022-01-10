import {HttpClient} from '@angular/common/http';
import {Component, OnInit, ChangeDetectionStrategy, Optional, Inject, ChangeDetectorRef, ViewChild, TemplateRef} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {ImageComponent} from '@jaspero/fb-fields-mat';
import {COMPONENT_DATA, FormBuilderService, StorageService} from '@jaspero/form-builder';
import {TranslocoService} from '@ngneat/transloco';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {debounceTime, filter, tap} from 'rxjs/operators';
import {of} from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'fb-pb-background',
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BackgroundComponent extends ImageComponent implements OnInit {
  constructor(
    @Inject(COMPONENT_DATA) public cData: any,
    @Optional() public storage: StorageService,
    public cdr: ChangeDetectorRef,
    public formBuilderService: FormBuilderService,
    public transloco: TranslocoService,
    public snackBar: MatSnackBar,
    public domSanitizer: DomSanitizer,
    public http: HttpClient,
    public dialog: MatDialog,
    public fb: FormBuilder
  ) {
    super(cData, storage, cdr, formBuilderService, transloco, snackBar, domSanitizer, http, dialog);
  }
  
  @ViewChild('advanced', {static: true})
  advancedDialog: TemplateRef<any>;
  color: FormControl;
  form: FormGroup;

  ngOnInit() {

    const controlString = this.parseSafeUrl(this.cData.control.value);

    this.imageUrl = new FormControl(controlString);
    this.formBuilderService.saveComponents.push(this);

    this.allowedImageTypes = this.cData.allowedImageTypes || [];
    this.forbiddenImageTypes = this.cData.forbiddenImageTypes || [];
    this.minSizeBytes = this.cData.minSize || 0;
    this.maxSizeBytes = this.cData.maxSize || 0;

    this.color = new FormControl(controlString.startsWith('#'));
    this.form = this.fb.group({
      position: this.cData.form.get('backgroundPosition').value || 'center',
      repeat: this.cData.form.get('backgroundRepeat').value || false,
      size: this.cData.form.get('backgroundSize').value || 'center'
    });
    

    super.ngOnInit();

    this.imageUrl.valueChanges
      .pipe(
        debounceTime(300),
        untilDestroyed(this)
      )
      .subscribe((v) => {
        if (v.startsWith('#')) {
          this.cData.control.setValue(v);
        } else {
          this.cData.control.setValue(
            this.parseSafeUrl(this.imageSrc || this.imageUrl.value || this.value)
          );
        }
      });

    this.form.valueChanges
      .pipe(
        filter(() => !this.color.value),
        untilDestroyed(this)
      )
      .subscribe(({position, repeat, size}) => {
        this.cData.form.get('backgroundPosition').setValue(position);
        this.cData.form.get('backgroundRepeat').setValue(repeat);
        this.cData.form.get('backgroundSize').setValue(size);
      });
  }

  parseSafeUrl(url: string | SafeUrl) {
    return typeof (url || '') === 'string' ? (url || '') : (url as any).changingThisBreaksApplicationSecurity;
  }

  save(moduleId: string, documentId: string) {
    if (this.color.value) {
      this.cData.control.value = this.imageUrl.value;
      return of(true);
    }

    const {position, repeat, size} = this.form.getRawValue();

    this.cData.form.get('backgroundPosition').setValue(position);
    this.cData.form.get('backgroundRepeat').setValue(repeat);
    this.cData.form.get('backgroundSize').setValue(size);

    return super.save(moduleId, documentId).pipe(tap((data) => {
      const safeLink = this.parseSafeUrl(data);

      this.imageSrc = safeLink;
      this.imageUrl.setValue(safeLink);
      this.value = safeLink;

      this.cData.control.setValue(this.parseSafeUrl(data));
      this.cData.form.controls.background.setValue(this.parseSafeUrl(data));
      setTimeout(() => {
        this.imageSrc = safeLink;
        this.imageUrl.setValue(safeLink);
        this.value = safeLink;
        this.cData.control.setValue(this.parseSafeUrl(data));
        this.cData.form.controls.background.setValue(this.parseSafeUrl(data));
      }, 100);
    }));
  }

  advancedOptions() {
    this.dialog.open(
      this.advancedDialog
    );
  }
}
