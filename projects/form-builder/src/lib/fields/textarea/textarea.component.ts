import {Component, ChangeDetectionStrategy, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {FieldComponent} from '../../field/field.component';
import {FieldData} from '../../interfaces/field-data.interface';
import {getHsd, HSD} from '../../utils/get-hsd';

interface TextareaData extends FieldData {
  rows?: number;
  cols?: number;
  autocomplete: string;
  suffix?: HSD;
  prefix?: HSD;
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
