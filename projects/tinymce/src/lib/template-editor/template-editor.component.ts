import {AfterViewInit, ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {COMPONENT_DATA, FieldComponent, FieldData, StorageService} from '@jaspero/form-builder';
import {TemplateEditorTemplate} from './interfaces/template-editor-template.interface';

declare const tinymce: any;

interface Segment {
  id: string;
  name: string;
  content: string;
  editors: any[];
  group: string;
}

interface Template {
  id: string;
  name: string;
  style?: string;
  layout?: string;
  segments: Segment[];
  defaultSegments: string[];
}

interface TemplateEditorData extends FieldData {
  templates: TemplateEditorTemplate[];
  defaultTemplate: string;
}

@Component({
  selector: 'fb-tm-template-editor',
  templateUrl: './template-editor.component.html',
  styleUrls: ['./template-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateEditorComponent extends FieldComponent<TemplateEditorData> implements OnInit, AfterViewInit {
  constructor(
    @Inject(COMPONENT_DATA) public cData: TemplateEditorData,
    private storage: StorageService
  ) {
    super(cData);
  }

  templates: Template[];
  templateControl: FormControl;
  template: Template;
  segments: Segment[];
  value: string;
  mainEl: HTMLDivElement;
  segmentSelect: {
    grouped: Array<{
      group: string;
      segments: Segment[];
    }>;
    root: Segment[];
  };


  ngOnInit() {

    this.templates = this.cData.templates;

    const {
      template,
      segments
    } = this.cData.control.value;

    if (template) {
      this.template = this.templates.find(it => it.id === template) as Template;
      this.templateControl = new FormControl(template);
    } else {
      this.template = this.templates.find(it => it.id === this.cData.defaultTemplate) as Template;
      this.templateControl = new FormControl(this.template.id);
    }

    this.segments = (
      segments ||
      this.template.defaultSegments
        .map(segment => this.template.segments.find(it => it.id === segment))
    )
      .map(data => ({...data}));
    this.value = this.template.layout || `<div class="main-content"></div>`;
    this.segmentSelect = this.template.segments.reduce((acc: any, cur: any) => {

      if (!cur.group) {
        acc.root.push(cur);
        return acc;
      }

      const index = acc.grouped.findIndex(it => it.group === cur.group);

      if (index !== -1) {
        acc.grouped[index].segments.push(cur);
      } else {
        acc.grouped.push({
          group: cur.group,
          segments: [cur]
        });
      }

      return acc;
    }, {
      grouped: [],
      root: []
    });

    if (!template) {
      this.updateData();
    }
  }

  ngAfterViewInit() {
    this.mainEl = document.querySelector('.main-content') as HTMLDivElement;
    this.compileSegments();
  }

  addSegment(segment: Segment) {

    const seg = {...segment};

    this.segments.push(seg);
    this.compileSegment(seg);
    this.updateData();
  }

  compileSegments() {
    this.segments.forEach(segment => {
      this.compileSegment(segment);
    });
  }

  compileSegment(segment: Segment) {
    const elWrapper = document.createElement('div');
    const el = document.createElement('div');
    const cleanUpTrigger = document.createElement('i');

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
      toolbar: 'styleselect | bold italic underline | link image emoticons | align bullist numlist | code removeformat',
      menubar: false,
      inline: true,
      target_list: false,
      object_resizing: false,
      paste_as_text: true,
      image_dimensions: false,
      ...this.template.style && {content_style: this.template.style},
      // tslint:disable-next-line:max-line-length
      extended_valid_elements: 'svg[*],defs[*],pattern[*],desc[*],metadata[*],g[*],mask[*],path[*],line[*],marker[*],rect[*],circle[*],ellipse[*],polygon[*],polyline[*],linearGradient[*],radialGradient[*],stop[*],image[*],view[*],text[*],textPath[*],title[*],tspan[*],glyph[*],symbol[*],switch[*],use[*]',
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
          this.updateData();
        });
      },
      style_formats: [
        {title: 'Image', selector: 'img', styles: {width : '100%', height: 'auto'}}
      ]
    });
  }

  updateData() {
    this.cData.control.setValue({
      segments: this.segments,
      template: this.template.id,
      ...this.template.style && {style: this.template.style},
      ...this.template.layout && {layout: this.template.layout}
    });
  }
}
