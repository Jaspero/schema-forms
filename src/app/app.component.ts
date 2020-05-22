import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormBuilderData} from 'form-builder';

@Component({
  selector: 'sc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  exampleOne: FormBuilderData = {
    schema: {
      properties: {
        photos: {
          type: 'array'
        },
        title: {
          type: 'string'
        },
        description: {
          type: 'string'
        }
      }
    },
    definitions: {
      photos: {
        component: {
          type: 'gallery',
          configuration: {
            allowServerUpload: true,
            allowUrl: true
          }
        },
        label: 'Photos'
      },
      title: {
        label: 'Title'
      },
      description: {
        label: 'Description',
        component: {
          type: 'textarea'
        }
      }
    },
    segments: [
      {
        fields: [
          '/photos',
          '/title',
          '/description'
        ]
      }]
  };

  exampleTwo: FormBuilderData = {
    schema: {
      properties: {
        title: {
          type: 'string'
        },
        description: {
          type: 'string'
        },
        content: {
          type: 'string'
        }
      }
    },
    definitions: {
      title: {
        label: 'Title'
      },
      description: {
        label: 'Description',
        component: {
          type: 'textarea'
        }
      },
      content: {
        label: 'Content',
        component: {
          type: 'wysiwyg'
        }
      }
    },
    segments: [{
      fields: [
        '/title',
        '/description',
        '/content'
      ]
    }]
  };

  updateComponent() {
    this.exampleTwo = {
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
}
