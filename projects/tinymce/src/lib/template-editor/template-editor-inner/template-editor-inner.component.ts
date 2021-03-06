import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Renderer2, ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {StorageService} from '@jaspero/form-builder';
import {TemplateEditorSegment} from '../interfaces/template-editor-segment.interface';
import {TemplateEditorTemplate} from '../interfaces/template-editor-template.interface';

declare const tinymce: any;

@Component({
  selector: 'fb-tm-template-editor-inner',
  templateUrl: './template-editor-inner.component.html',
  styleUrls: ['./template-editor-inner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom
})
export class TemplateEditorInnerComponent implements OnInit, AfterViewInit {
  constructor(
    private storage: StorageService,
    private renderer: Renderer2
  ) { }

  @ViewChild('wrapper', {read: ElementRef})
  wrapperEl: ElementRef<HTMLDivElement>;

  @Input() segments: TemplateEditorSegment[];
  @Input() template: TemplateEditorTemplate;
  @Input() wysiwygConfig: any;

  mainEl: HTMLDivElement;
  value: string;

  @Output()
  update = new EventEmitter();

  ngOnInit() {
    this.value = this.template.layout || `<div class="main-content"></div>`;
  }

  ngAfterViewInit() {
    this.mainEl = this.wrapperEl.nativeElement.querySelector('.main-content') as HTMLDivElement;
    this.compileSegments();
  }

  compileSegments() {
    this.segments.forEach(segment => {
      this.compileSegment(segment);
    });
  }

  compileSegment(segment: TemplateEditorSegment) {
    const elWrapper = this.renderer.createElement('div');
    const el = this.renderer.createElement('div');
    const cleanUpTrigger = this.renderer.createElement('i');

    const sidebarEl = this.renderer.createElement('div');
    sidebarEl.classList.add('segment-sidebar');

    elWrapper.style.marginBottom = '1rem';
    elWrapper.style.position = 'relative';

    el.innerHTML = segment.content;

    cleanUpTrigger.classList.add('material-icons');

    cleanUpTrigger.style.position = 'absolute';
    cleanUpTrigger.style.right = '-50px';
    cleanUpTrigger.style.top = '0';
    cleanUpTrigger.style.cursor = 'pointer';

    cleanUpTrigger.innerText = 'close';

    cleanUpTrigger.onclick = () => {
      const index = this.segments.findIndex(it => it === segment);

      this.segments.splice(index, 1);
      this.mainEl.removeChild(cleanUpTrigger.parentElement as HTMLDivElement);
    };

    elWrapper.appendChild(el);
    elWrapper.appendChild(cleanUpTrigger);

    this.mainEl.appendChild(elWrapper);

    tinymce.init({
      target: el,
      plugins: ['link', 'lists', 'image', 'code'],
      toolbar: ['styleselect', 'bold italic underline', 'link image emoticons', 'align bullist numlist', 'code removeformat'].join(' | '),
      menubar: false,
      inline: true,
      target_list: false,
      object_resizing: false,
      paste_as_text: true,
      image_dimensions: false,
      extended_valid_elements: [
        'svg[*]',
        'defs[*]',
        'pattern[*]',
        'desc[*]',
        'metadata[*]',
        'g[*]',
        'mask[*]',
        'path[*]',
        'line[*]',
        'marker[*]',
        'rect[*]',
        'circle[*]',
        'ellipse[*]',
        'polygon[*]',
        'polyline[*]',
        'linearGradient[*]',
        'radialGradient[*]',
        'stop[*]',
        'image[*]',
        'view[*]',
        'text[*]',
        'textPath[*]',
        'title[*]',
        'tspan[*]',
        'glyph[*]',
        'symbol[*]',
        'switch[*]',
        'use[*]'
      ].join(','),
      images_upload_handler: (blobInfo, success, failure) => {

        /**
         * TODO:
         * We need to give a module and document here
         * so that images are properly removed when
         * a document is remove
         */
        this.storage
          .upload(blobInfo.filename(), blobInfo.blob())
          .then(data => data.ref.getDownloadURL())
          .then(url => success(url))
          .catch(error => failure(error.toString()));
      },
      setup: editor => {
        editor.on('keyup change', () => {
          segment.content = editor.getContent();
          this.update.emit();
        });
      },
      style_formats: [
        {title: 'Image', selector: 'img', styles: {width : '100%', height: 'auto'}}
      ],
      ...this.template.style && {content_style: this.template.style},
      ...this.wysiwygConfig || {}
    });
  }
}
