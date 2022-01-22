import {HttpClient} from '@angular/common/http';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, Optional, TemplateRef, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {ImageComponent} from '@jaspero/fb-fields-mat';
import {COMPONENT_DATA, FieldData, FormBuilderService, StorageService} from '@jaspero/form-builder';
import {ImageConfiguration} from '@jaspero/fb-fields-mat';
import {TranslocoService} from '@ngneat/transloco';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {of} from 'rxjs';
import {debounceTime, filter, tap} from 'rxjs/operators';

export interface BackgroundConfiguration extends ImageConfiguration {
  position?: {
    active?: boolean;
    default?: string;
  };
  repeat?: {
    active?: boolean;
    default?: boolean;
  };
  size?: {
    active?: boolean;
    default?: string;
  };
}

export type BackgroundData = BackgroundConfiguration & FieldData;

@UntilDestroy()
@Component({
  selector: 'fb-pb-background',
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BackgroundComponent extends ImageComponent implements OnInit {
  constructor(
    @Inject(COMPONENT_DATA) public cData: BackgroundData,
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
  props = [
    {
      key: 'backgroundPosition',
      label: 'Background Position',
      cKey: 'position',
      default: 'center',
      options: [
        {value: 'left', name: 'Left'},
        {value: 'center', name: 'Center'},
        {value: 'right', name: 'Right'},
        {value: 'top', name: 'Top'},
        {value: 'bottom', name: 'Bottom'}
      ]
    },
    {
      key: 'backgroundRepeat',
      cKey: 'repeat',
      default: false,
      label: 'Background Repeat'
    },
    {
      key: 'backgroundSize',
      cKey: 'size',
      default: 'center',
      label: 'Background Size',
      options: [
        {value: 'cover', name: 'Cover'},
        {value: 'contain', name: 'Contain'},
        {value: 'auto', name: 'Auto'}
      ]
    }
  ];

  ngOnInit() {

    const controlString = this.parseSafeUrl(this.cData.control.value);

    this.imageUrl = new FormControl(controlString);
    this.formBuilderService.saveComponents.push(this);

    this.allowedImageTypes = this.cData.allowedImageTypes || [];
    this.forbiddenImageTypes = this.cData.forbiddenImageTypes || [];
    this.minSizeBytes = (this.cData.minSize || 0) as number;
    this.maxSizeBytes = (this.cData.maxSize || 0) as number;

    this.color = new FormControl(controlString.startsWith('#'));
    this.form = this.fb.group(this.props.reduce((acc, cur) => {
      const setting = this.cData[cur.cKey];

      if (!setting || setting.active) {
        const {value} = this.cData.form.get(cur.key);
        acc[cur.cKey] = value !== undefined ?
          value :
          (setting.default !== undefined ? setting.default : cur.default)
      }

      return acc;
    }, {}));


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
      .subscribe(changes =>
        this.propagateChanges(changes)
      );
  }

  parseSafeUrl(url: string | SafeUrl) {
    return typeof (url || '') === 'string' ? (url || '') : (url as any).changingThisBreaksApplicationSecurity;
  }

  save(moduleId: string, documentId: string) {
    if (this.color.value) {
      this.cData.control.setValue(this.imageUrl.value);
      return of(true);
    }

    this.propagateChanges();

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

  propagateChanges(changes: any = this.form.getRawValue()) {
    this.props.forEach(prop => {
      const setting = this.cData[prop.cKey];

      if (!setting || setting.active) {
        this.cData.form.get(prop.key).setValue(changes[prop.key]);
      }
    });
  }
}
