import {ChangeDetectionStrategy, Component, OnInit, ViewChild, Inject} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {COMPONENT_DATA, ImageComponent} from '@jaspero/form-builder';

@Component({
  selector: 'fb-background',
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BackgroundComponent extends ImageComponent implements OnInit {
  constructor(
    @Inject(COMPONENT_DATA) public cData,
    private fb: FormBuilder
  ) {
    super(cData)
  }

  @ViewChild('colorInput', {static: true}) colorInput: HTMLInputElement;

  form: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      background: [{value: '', disabled: true}],

      // TODO: Show only when background is url
      backgroundRepeat: '',
      backgroundSize: '',
      contained: '',
    });
  }

  writeValue(e) {
    this.form.get('background').setValue(e.target.value)
    // todo: hide/show backgroundRepeat, backgroundSize add contained
  }
}
