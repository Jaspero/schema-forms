import {ChangeDetectionStrategy, Component} from '@angular/core';
import {SegmentComponent} from '@jaspero/form-builder';

@Component({
  selector: 'fb-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepperComponent extends SegmentComponent {}
