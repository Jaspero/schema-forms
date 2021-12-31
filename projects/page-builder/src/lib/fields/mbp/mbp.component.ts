import {Component, OnInit} from '@angular/core';
import {FieldComponent, FieldData} from '@jaspero/form-builder';

type Unit = 'em' | 'rem' | 'px';
type BorderStyle = 'solid' | 'dotted' | 'dashed';

interface Sides<T = string> {
  top?: T;
  right?: T;
  bottom?: T;
  left?: T;
}

interface BorderSide {
  size: string;
  style: BorderStyle;
  radius: string;
  color: string;
}

interface Preset<T = string> {
  name: string;
  sides: Sides<T>;
}

interface MbpData extends FieldData {
  units?: Unit[];
  presets?: {
    border?: Preset<BorderSide>;
    margin?: Preset;
    padding?: Preset;
  };
  margin?: boolean;
  border?: boolean;
  padding?: boolean;
}

@Component({
  selector: 'fb-pb-mbp',
  templateUrl: './mbp.component.html',
  styleUrls: ['./mbp.component.scss']
})
export class MbpComponent extends FieldComponent<MbpData> implements OnInit {
  ngOnInit() {
  }
}
