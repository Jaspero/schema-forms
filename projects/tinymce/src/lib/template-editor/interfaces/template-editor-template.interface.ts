import {TemplateEditorSegment} from './template-editor-segment.interface';

export interface TemplateEditorTemplate {
  id: string;
  name: string;
  style?: string;
  layout?: string;
  segments: TemplateEditorSegment[];
  defaultSegments: string[];
}
