import {ChangeDetectionStrategy, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {COMPONENT_DATA, FieldComponent, FieldData} from '@jaspero/form-builder';
import {TemplateEditorSegment} from './interfaces/template-editor-segment.interface';
import {TemplateEditorTemplate} from './interfaces/template-editor-template.interface';
import {TemplateEditorInnerComponent} from './template-editor-inner/template-editor-inner.component';

export interface TemplateEditorConfig {
  templates: TemplateEditorTemplate[];
  defaultTemplate: string;
  wysiwygConfig?: any;
}

export type TemplateEditorData = TemplateEditorConfig & FieldData;

@Component({
  selector: 'fb-tm-template-editor',
  templateUrl: './template-editor.component.html',
  styleUrls: ['./template-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateEditorComponent extends FieldComponent<TemplateEditorData> implements OnInit {
  constructor(
    @Inject(COMPONENT_DATA) public cData: TemplateEditorData
  ) {
    super(cData);
  }

  @ViewChild(TemplateEditorInnerComponent)
  innerComponent: TemplateEditorInnerComponent;

  templates: TemplateEditorTemplate[];
  templateControl: FormControl;
  template: TemplateEditorTemplate;
  segments: TemplateEditorSegment[];
  segmentSelect: {
    grouped: Array<{
      group: string;
      segments: TemplateEditorSegment[];
    }>;
    root: TemplateEditorSegment[];
  };


  ngOnInit() {

    this.templates = this.cData.templates;

    const {
      template,
      segments
    } = this.cData.control.value;

    if (template) {
      this.template = this.templates.find(it => it.id === template) as TemplateEditorTemplate;
      this.templateControl = new FormControl(template);
    } else {
      this.template = this.templates.find(it => it.id === this.cData.defaultTemplate) as TemplateEditorTemplate;
      this.templateControl = new FormControl(this.template.id);
    }

    this.segments = (
      segments ||
      this.template.defaultSegments
        .map(segment => this.template.segments.find(it => it.id === segment))
    )
      .map(data => ({...data}));
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

  addSegment(segment: TemplateEditorSegment) {
    const seg = {...segment};
    this.segments.push(seg);
    this.innerComponent.compileSegment(seg);
    this.updateData();
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
