import {FormBuilderData} from '@jaspero/form-builder';

export interface Selected {
  id: number;
  index: number;
  label?: string;
  form: FormBuilderData;
  previewTemplate?: string;
  previewStyle?: string;
  previewFormat?: string;
  icon?: string;
  value?: any;
  nested?: any;
}
