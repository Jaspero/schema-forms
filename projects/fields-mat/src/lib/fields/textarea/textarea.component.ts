import {Component, ChangeDetectionStrategy, OnInit} from '@angular/core';
import {FieldComponent, FieldData, getHsd, HSD} from '@jaspero/form-builder';
import {Observable} from 'rxjs';

export interface TextareaData extends FieldData {
  rows?: number;
  cols?: number;
  autocomplete?: string;
  suffix?: HSD | string;
  prefix?: HSD | string;
}

@Component({
  selector: 'fb-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextareaComponent extends FieldComponent<TextareaData> implements OnInit {

  prefix$: Observable<string>;
  suffix$: Observable<string>;

  ngOnInit() {
    this.prefix$ = getHsd('prefix', this.cData);
    this.suffix$ = getHsd('suffix', this.cData);
  }
}
