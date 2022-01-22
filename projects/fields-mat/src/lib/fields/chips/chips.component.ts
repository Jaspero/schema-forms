import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {MatChipInputEvent} from '@angular/material/chips';
import {FieldComponent, FieldData, HSD, getHsd} from '@jaspero/form-builder';
import {Observable} from 'rxjs';

export interface ChipsData extends FieldData {
  selectable: boolean;
  removable: boolean;
  addOnBlur: boolean;
  unique: boolean;
  autocomplete?: string;
  suffix?: HSD | string;
  prefix?: HSD | string;
}

@Component({
  selector: 'fb-chips',
  templateUrl: './chips.component.html',
  styleUrls: ['./chips.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChipsComponent extends FieldComponent<ChipsData>
  implements OnInit {

  data: string[] = [];
  removable: boolean;
  prefix$: Observable<string>;
  suffix$: Observable<string>;

  ngOnInit() {
    this.data = this.cData.control.value;
    this.removable = this.cData.hasOwnProperty('removable') ? this.cData.removable : true;
    this.prefix$ = getHsd('prefix', this.cData);
    this.suffix$ = getHsd('suffix', this.cData);
  }

  add(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    const input = event.input;

    if (value && (this.cData.unique ? !this.data.includes(value) : true)) {
      this.data.push(value);
      this.cData.control.setValue(this.data);
    }

    if (input) {
      input.value = '';
    }
  }

  remove(chip: string) {
    const index = this.cData.control.value.indexOf(chip);

    if (index >= 0) {
      this.data.splice(index, 1);
      this.cData.control.setValue(this.data);
    }
  }
}
