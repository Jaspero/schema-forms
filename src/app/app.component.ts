import {AfterViewInit, ChangeDetectionStrategy, Component, QueryList, ViewChildren} from '@angular/core';
import {FormBuilderComponent} from '../../projects/form-builder/src/public-api';

@Component({
  selector: 'sc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements AfterViewInit {

  @ViewChildren(FormBuilderComponent)
  formComponents: QueryList<FormBuilderComponent>;

  ngAfterViewInit() {
    this.formComponents.forEach(log => {
      log.form.valueChanges
        .subscribe(value => {
          console.log(value);
        });
    });
  }

  // updateComponent() {
  //   this.exampleTwo = {
  //     schema: {
  //       properties: {
  //         title: {
  //           type: 'string'
  //         }
  //       }
  //     },
  //     definitions: {
  //       title: {
  //         label: 'Title'
  //       }
  //     },
  //     segments: [{
  //       fields: [
  //         '/title'
  //       ]
  //     }]
  //   };
  // }

  save() {
    // const valid = this.formComponents.toArray()[0].validate(this.exampleOne);
    // console.log({valid});
    this.formComponents.toArray()[0].save('example', 'example-id').subscribe();
  }
}
