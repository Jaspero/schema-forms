import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {FieldComponent} from '../../field/field.component';
import {FieldData} from '../../interfaces/field-data.interface';
import {getHsd, HSD} from '../../utils/get-hsd';

interface InputData extends FieldData {
  /**
   * @default 'text'
   */
  type?: 'text' | 'number' | 'email' | 'color';

  /**
   * HTML autocomplete attribute
   * @default 'on'
   */
  autocomplete?: string;

  suffix?: HSD | string;
  prefix?: HSD | string;
}

@Component({
  selector: 'fb-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputComponent extends FieldComponent<InputData> implements OnInit {

  prefix$: Observable<string>;
  suffix$: Observable<string>;

  ngOnInit() {
    this.prefix$ = getHsd('prefix', this.cData);
    this.suffix$ = getHsd('suffix', this.cData);
  }
}
