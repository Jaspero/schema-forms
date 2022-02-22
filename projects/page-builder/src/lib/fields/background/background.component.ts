import {HttpClient} from '@angular/common/http';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, Optional, TemplateRef, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {ImageComponent, ImageConfiguration} from '@jaspero/fb-fields-mat';
import {COMPONENT_DATA, FieldData, formatGeneratedImages, FormBuilderService, ProcessConfig, StorageService} from '@jaspero/form-builder';
import {random} from '@jaspero/utils';
import {TranslocoService} from '@ngneat/transloco';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {set} from 'json-pointer';
import {from, of} from 'rxjs';
import {debounceTime, filter, switchMap, tap} from 'rxjs/operators';

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

    /**
     * TODO:
     * Handle cases when !data.direct
     * currently any url selection is treaded as direct
     */
    window.jpFb.assignOperation({
      cData: this.cData,
      save: (data: ProcessConfig<BackgroundData>) => {

        const current = window.jpFb.exists(data);

        if (!current.exists) {
          return of(true);
        }

        if (this.color.value) {
          set(data.outputValue, data.pointer, this.imageUrl.value);
          return of(true);
        }

        if (current.value && typeof current.value !== 'string') {
          let name = data.cData.preserveFileName ? current.value.name : [
            data.collectionId,
            data.documentId,
            random.string()
          ].join('-');

          if (!data.cData.preserveFileName) {
            /**
             * TODO:
             * Maybe we should put a type extension based on type
             * instead of taking from the name
             */
            name += '.' + (current.value.name.split('.')[1]);;
          }

          return from(
            this.storage.upload(name, current.value, {
              contentType: current.value.type,
              customMetadata: {
                moduleId: data.collectionId,
                documentId: data.documentId,
                ...(data.cData.generatedImages &&
                  formatGeneratedImages(data.cData.generatedImages))
              }
            })
          )
            .pipe(
              switchMap((res: any) => this.storage.getDownloadURL(res.ref)),
              tap(url => set(data.outputValue, data.pointer, url))
            );
        }

        return of(true);
      }
    });
  }

  parseSafeUrl(url: string | SafeUrl) {
    return typeof (url || '') === 'string' ? (url || '') : (url as any).changingThisBreaksApplicationSecurity;
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
