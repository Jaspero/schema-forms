import {AfterViewInit, ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';
import {FormBuilderComponent} from '@jaspero/form-builder';
import {tap} from 'rxjs/operators';
import {SCHEMA} from './schema.const';

@Component({
  selector: 'sc-page-builder',
  templateUrl: './page-builder.component.html',
  styleUrls: ['./page-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageBuilderComponent implements AfterViewInit {

  @ViewChild(FormBuilderComponent)
  component: FormBuilderComponent;

  pageBuilderExample = SCHEMA;

  ngAfterViewInit() {
    this.component.form.valueChanges.subscribe((v) => {
      console.log('change', v);
    });
  }

  save() {
    return () =>
      this.component.save('example', 'example-id').pipe(
        tap(data => {
          console.log('saved', data);
        })
      );
  }
}
