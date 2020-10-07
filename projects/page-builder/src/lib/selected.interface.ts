import {FormBuilderData} from '@jaspero/form-builder';

export interface Selected {
  id: string;
  label?: string;
  form: FormBuilderData;
  previewTemplate?: string;
  previewStyle?: string;
  previewFormat?: string;
  icon?: string;
  value?: any;
}
