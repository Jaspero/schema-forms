import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FieldComponent, FieldData} from '@jaspero/form-builder';

export interface SliderConfiguration {
  validation: {
    minimum: number;
    maximum: number;
  };
  displayWith?: (num: number) => any;
  step?: number;
  starAt: number;
  endAt: number;
}

export type SliderData = SliderConfiguration & FieldData;

@Component({
  selector: 'fb-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderComponent extends FieldComponent<SliderData>
  implements OnInit {
  startAt: number;
  endAt: number;

  ngOnInit() {
    this.cData.displayWith = this.cData.displayWith || (value => value);
    this.cData.step = this.cData.step || 1;
    this.startAt = this.cData.starAt
      ? this.cData.starAt
      : this.cData.validation.minimum
      ? this.cData.validation.minimum
      : 0;
    this.endAt = this.cData.endAt
      ? this.cData.endAt
      : this.cData.validation.maximum
      ? this.cData.validation.maximum
      : 100;
  }

  changed(event) {
    if (this.cData.control.value !== event.value) {
      this.cData.control.setValue(event.value);
    }
  }
}
