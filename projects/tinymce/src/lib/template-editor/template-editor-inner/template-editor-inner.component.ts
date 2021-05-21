import {moveItemInArray} from '@angular/cdk/drag-drop';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
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

    el.innerHTML = segment.content;

    elWrapper.classList.add('segment');
    elWrapper.appendChild(el);
    elWrapper.appendChild(this.segmentSidebar());

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

  segmentSidebar() {

    const sidebarEl = this.renderer.createElement('div');

    sidebarEl.classList.add('segment-sidebar');

    const deleteEl = this.renderer.createElement('button');
    const upEl = this.renderer.createElement('button');
    const downEl = this.renderer.createElement('button');

    deleteEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width="18px" height="18px"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
    upEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width="18px" height="18px"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/></svg>';
    downEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width="18px" height="18px"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/></svg>';

    const swap = (nodeA, nodeB) => {
      const parentA = nodeA.parentNode;
      const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;
      nodeB.parentNode.insertBefore(nodeA, nodeB);
      parentA.insertBefore(nodeB, siblingA);
    };

    const getIndex = () => {
      return Array.from(this.mainEl.children).indexOf(sidebarEl.parentElement);
    };

    upEl.onclick = () => {
      const index = getIndex();

      if (index !== 0) {
        const toIndex = index - 1;
        moveItemInArray(this.segments, index, toIndex);
        swap(this.mainEl.children[index], this.mainEl.children[toIndex]);
        this.update.emit();
      }
    };

    downEl.onclick = () => {
      const index = getIndex();

      if ((this.segments.length - 1) > index) {
        const toIndex = index + 1;
        moveItemInArray(this.segments, index, toIndex);
        swap(this.mainEl.children[index], this.mainEl.children[toIndex]);
        this.update.emit();
      }
    };

    deleteEl.onclick = () => {
      const index = getIndex();
      this.segments.splice(index, 1);
      this.mainEl.removeChild(sidebarEl.parentElement);
      this.update.emit();
    };

    sidebarEl.appendChild(upEl);
    sidebarEl.appendChild(downEl);
    sidebarEl.appendChild(deleteEl);

    return sidebarEl;
  }
}
