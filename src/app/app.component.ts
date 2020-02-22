import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'sc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  exampleOne = {
    schema: {

    },
    definitions: {

    },
    segments: {

    }
  };

  exampleTwo = {
    schema: {

    },
    definitions: {

    },
    segments: {

    }
  }
}
