import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {COMPONENT_DATA, FieldComponent, FieldData, FormBuilderComponent, StorageService} from '@jaspero/form-builder';
import {filter, take} from 'rxjs/operators';
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

declare const tinymce: any;

export interface TinyData extends FieldData {
  menubar?: string;
  toolbar?: string;
  height?: number;
}

@Component({
  selector: 'fb-tm-tinymce',
  templateUrl: './tinymce.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TinymceComponent extends FieldComponent<TinyData>
  implements OnInit, AfterViewInit {
  constructor(
    @Inject(COMPONENT_DATA) public cData: TinyData,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private storage: StorageService,
    private formBuilderComponent: FormBuilderComponent
  ) {
    super(cData);
  }

  @ViewChild('textarea', {static: true})
  textarea: ElementRef;

  @ViewChild('youTubeDialog', {static: true})
  youTubeDialogTemplate: TemplateRef<any>;

  editor: any;
  ytForm: FormGroup;
  ytDefault = {
    fullWidth: true,
    showPlayerControls: true,
    privacyEnhancedMode: false,
    align: 'left'
  };

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
  }

  ngAfterViewInit() {
    this.registerTiny();
  }

  private registerTiny() {
    tinymce.init({
      target: this.textarea.nativeElement,
      branding: false,
      height: this.cData.height || 420,
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
        'table'
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
        'link',
        'image',
        'youTube',
        'fullscreen',
      ].join(' | '),

      images_upload_handler: (blobInfo: any, success: any, failure: any) => {
        this.storage
          .upload(
            blobInfo.filename(),
            blobInfo.blob(),
            this.formBuilderComponent.id ? {
              customMetadata: {
                collection: this.formBuilderComponent.id
              }
            } : {}
          )
          .then((data: any) => data.ref.getDownloadURL())
          .then((url: any) => success(url))
          .catch((error: any) => failure(error.toString()));
      },

      setup: (editor: any) => {
        this.editor = editor;

        editor.on('keyup change', () => {
          const tinyContent = editor.getContent();
          this.cData.control.setValue(tinyContent);
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
      }
    });
  }
}

