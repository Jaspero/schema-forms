import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  ViewChild
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {
  COMPONENT_DATA,
  FieldComponent,
  FieldData
} from '@jaspero/form-builder';

import loader, {Monaco} from '@monaco-editor/loader';

export interface MonacoData extends FieldData {
  value?: string;
  height?: string;
  /**
   * Monaco Options passed to constructor
   */
  options?: object;
}

@Component({
  selector: 'fb-monaco-editor',
  templateUrl: './monaco.component.html',
  styleUrls: ['./monaco.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MonacoComponent extends FieldComponent<MonacoData> implements AfterViewInit {

  constructor(
    @Inject(COMPONENT_DATA) public cData: MonacoData,
    private cdr: ChangeDetectorRef
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
        language: 'javascript',
        theme: 'vs',
        automaticLayout: true,
        ...(this.cData.options || {}),
        value: this.cData.control.value || this.cData.value || ''
      };

      this.editorElement.nativeElement.style.height = this.cData.height || '400px';
      this.editor = monaco.editor.create(this.editorElement.nativeElement, options);

      this.cData.control.setValue(options.value);

      const model = this.editor.getModel();
      model.onDidChangeContent(() => {
        this.cData.control.setValue(model.getValue());
        this.cdr.detectChanges();
      });
    });
  }
}
