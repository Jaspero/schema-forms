import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {
  COMPONENT_DATA,
  FieldComponent,
  FieldData,
  formatGeneratedImages,
  FormBuilderComponent,
  FormBuilderService,
  StorageService
} from '@jaspero/form-builder';
import {forkJoin, from, of} from 'rxjs';
import {filter, switchMap, take, tap} from 'rxjs/operators';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/code';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/image';
import 'tinymce/plugins/imagetools';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/print';
import 'tinymce/plugins/table';
import 'tinymce/plugins/wordcount';
import 'tinymce/plugins/emoticons';

declare const tinymce: any;

export interface TinyData extends FieldData {
  menubar?: string;
  toolbar?: string;
  height?: number;
  options?: any;
  generatedImages?: any[];
}

@Component({
  selector: 'fb-tm-tinymce',
  templateUrl: './tinymce.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TinymceComponent extends FieldComponent<TinyData>
  implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    @Inject(COMPONENT_DATA) public cData: TinyData,
    private fb: FormBuilder,
    private dialog: MatDialog,
    @Optional() private storage: StorageService,
    private formBuilderComponent: FormBuilderComponent,
    private zone: NgZone,
    private formBuilderService: FormBuilderService
  ) {
    super(cData);
  }

  @ViewChild('textarea', {static: true})
  textarea: ElementRef;

  @ViewChild('youTubeDialog', {static: true})
  youTubeDialogTemplate: TemplateRef<any>;

  ytForm: FormGroup;
  ytDefault = {
    fullWidth: true,
    showPlayerControls: true,
    privacyEnhancedMode: false,
    align: 'left'
  };

  imageReplacements: Array<{ blobInfo: any, replace: string }> = [];

  ngOnInit() {
    this.ytForm = this.fb.group({
      value: ['', Validators.required],
      ...this.ytDefault
    });

    this.cData.control.statusChanges.subscribe(value => {
      if (value === 'DISABLED') {
        tinymce.activeEditor.getBody().setAttribute('readonly', true);
      } else if (this.cData.control.disabled) {
        tinymce.activeEditor.getBody().setAttribute('readonly', false);
      }
    });

    this.formBuilderService.saveComponents.push(this);
  }

  ngAfterViewInit() {
    this.registerTiny();
  }

  ngOnDestroy() {
    this.formBuilderService.removeComponent(this);
  }

  private registerTiny() {
    tinymce.init({
      target: this.textarea.nativeElement,
      branding: false,
      height: this.cData.height || 420,
      paste_as_text: true,
      plugins: [
        'code',
        'print',
        'wordcount',
        'link',
        'lists',
        'advlist',
        'autolink',
        'image',
        'imagetools',
        'fullscreen',
        'table',
        'emoticons'
      ],
      menubar: this.cData.menubar || 'edit insert view format table tools help',
      image_advtab: true,

      /**
       * Link settings
       */
      default_link_target: '_blank',
      readonly: this.cData.control.disabled,
      toolbar: this.cData.toolbar || [
        'undo redo',
        'insert',
        'styleselect',
        'bold italic',
        'forecolor backcolor',
        'alignleft aligncenter alignright alignjustify',
        'bullist numlist outdent indent',
        'link emoticons',
        'image youTube',
        'fullscreen',
      ].join(' | '),

      images_upload_handler: (blobInfo: any, success: any, failure: any) => {
        let first = false;

        const reader = new FileReader();

        reader.onload = (e) => {

          if (first) {
            return;
          }

          // @ts-ignore
          const replace = e.target.result as string;
          this.imageReplacements.push({blobInfo, replace});
          success(replace);
          first = true;
        };

        reader.readAsDataURL(blobInfo.blob());

      },

      setup: (editor: any) => {
        editor.on('keyup change', () => {
          this.zone.run(() =>
            this.cData.control.setValue(editor.getContent())
          );
        });

        editor.ui.registry.addButton('youTube', {
          type: 'button',
          icon: 'embed',
          tooltip: 'Embed youtube video',
          onAction: () => {
            this.ytForm.reset(this.ytDefault);
            this.dialog
              .open(this.youTubeDialogTemplate, {width: '500px'})
              .afterClosed()
              .pipe(
                filter(value => !!value),
                take(1)
              )
              .subscribe(() => {
                const data = this.ytForm.getRawValue();
                let url = data.privacyEnhancedMode
                  ? 'https://www.youtube-nocookie.com/embed/'
                  : 'https://www.youtube.com/embed/';

                url = url + data.value;

                if (!data.showPlayerControls) {
                  data.value += '?controls=0';
                }

                const iframe = `<iframe width="560" height="315" src="${url}" frameborder="0"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;

                editor.insertContent(
                  data.fullWidth
                    ? `<div class="evw-full" style="text-align: ${data.align}">${iframe}</div>`
                    : `<div style="text-align: ${data.align}">${iframe}</div>`
                );
              });
          }
        });
      },
      ...!!this.cData.options && this.cData.options
    });
  }

  save(moduleId: string, documentId: string) {
    if (this.imageReplacements.length) {

      let {value} = this.cData.control;

      const toUpload = this.imageReplacements.reduce((acc: any[], {blobInfo, replace}, index) => {

        if (value.includes(replace)) {

          const name = [
            moduleId,
            documentId,
            index,
            blobInfo.filename(),
          ]
            .join('-');

          acc.push(
            from(
              this.storage.upload(
                name,
                blobInfo.blob(),
                {
                  customMetadata: {
                    moduleId,
                    documentId,
                    ...this.cData.generatedImages &&
                    formatGeneratedImages(this.cData.generatedImages)
                  }
                }
              )
            )
              .pipe(
                switchMap((task: any) => task.ref.getDownloadURL()),
                tap(url => {
                  value = value.replace(replace, url);
                })
              )
          )
        }

        return acc;
      }, []);

      if (toUpload.length) {
        return forkJoin(toUpload)
          .pipe(
            tap(() => {
              this.cData.control.setValue(value);
            })
          )
      } else {
        return of({});
      }
    } else {
      return of({});
    }
  }
}

