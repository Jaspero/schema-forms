import {AfterViewInit, ChangeDetectionStrategy, Component, QueryList, ViewChildren} from '@angular/core';
import {FormBuilderComponent} from '../../../../projects/form-builder/src/lib/form-builder.component';
import {ARRAY_EXAMPLE} from './forms/array-example';

@Component({
  selector: 'sc-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoreComponent implements AfterViewInit {

  @ViewChildren(FormBuilderComponent)
  formComponents: QueryList<FormBuilderComponent>;

  form = ARRAY_EXAMPLE;

  ngAfterViewInit() {
    this.formComponents.forEach(log => {
      log.form.valueChanges
        .subscribe();
    });
  }

  updateComponent() {
    this.form = {
      schema: {
        properties: {
          title: {
            type: 'string'
          }
        }
      },
      definitions: {
        title: {
          label: 'Title'
        }
      },
      segments: [{
        fields: [
          '/title'
        ]
      }]
    };
  }

  save() {
    this.formComponents.toArray()[0].save('example', 'example-id').subscribe();
  }
}
