import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {
  COMPONENT_DATA,
  FieldComponent,
  FieldData
} from '@jaspero/form-builder';

import loader, {Monaco} from '@monaco-editor/loader';

interface MonacoData extends FieldData {
  language?: string;
  theme?: 'vs' | 'vs-dark' | 'hc-black';
  value?: string;
  height?: string;
}

@Component({
  selector: 'fb-monaco-editor',
  templateUrl: './monaco.component.html',
  styleUrls: ['./monaco.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MonacoComponent extends FieldComponent<MonacoData> implements AfterViewInit {

  constructor(
    @Inject(COMPONENT_DATA) public cData: MonacoData
  ) {
    super(cData);
  }

  code: FormControl;
  monaco: Monaco;

  @ViewChild('editor')
  editorElement: ElementRef;

  editor;

  ngAfterViewInit(): void {
    this.code = new FormControl(this.cData.value || '');

    loader.init().then(monaco => {
      this.monaco = monaco;
      const options = {
        language: this.cData.language || 'javascript',
        theme: this.cData.theme || 'vs',
        value: this.cData.control.value || this.cData.value || ''
      };

      this.editorElement.nativeElement.style.height = this.cData.height || '400px';
      this.editor = monaco.editor.create(this.editorElement.nativeElement, options);

      this.cData.control.setValue(options.value);

      const model = this.editor.getModel();
      model.onDidChangeContent(() => {
        this.cData.control.setValue(model.getValue());
      });
    });
  }
}
