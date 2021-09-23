import {ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {COMPONENT_DATA, FieldData, Pointers} from '@jaspero/form-builder';
import {App, SnippetPreview} from 'yoastseo';

export interface SeoEditorData extends FieldData {

  /**
   * The following should all be pointers
   * to string controls
   */
  title: string;
  fallbackTitle?: string;
  metadata: string;
  fallbackMetadata?: string;
  keywords: string;

  /**
   * A pointer to a control to use for
   * the site content
   */
  content?: string;
  contentFormatter?: (value: any) => string;

  urlPath?: (pointers: Pointers) => string;
  baseUrl?: string;
}

@Component({
  selector: 'fb-seo-editor-seo-editor',
  templateUrl: './seo-editor.component.html',
  styleUrls: ['./seo-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeoEditorComponent implements OnInit {
  constructor(
    @Inject(COMPONENT_DATA)
    public cData: SeoEditorData,
    private fb: FormBuilder
  ) { }

  @ViewChild('preview', {static: true}) previewEl: ElementRef<HTMLDivElement>;

  form: FormGroup;
  app: App;

  ngOnInit() {
    const snippetPreview = new SnippetPreview({
      targetElement: this.previewEl.nativeElement,
      i18n: {dgettext: (a, b) => b},
      data: {
        title: this.cData.pointers[this.cData.title]?.control.value || this.cData.pointers[this.cData.fallbackTitle]?.control.value || 'Example',
        metaDesc: this.cData.pointers[this.cData.metadata]?.control.value || this.cData.pointers[this.cData.fallbackMetadata]?.control.value || 'This is an example snippet.',
        urlPath: this.cData.urlPath ? this.cData.urlPath(this.cData.pointers) : ''
      },
      baseURL: this.cData.baseUrl || 'example.com'
    });

    this.app = new App({
      snippetPreview,
      targets: {
        output: 'output',
        contentOutput: 'contentOutput',
      },
      callbacks: {
        getData: () => {
          return {
            keyword: '',
            text: 'lorem ipsum test lorem sda pero perica',
            synonyms: ''
          };
        },
      },
    });
  }
}
