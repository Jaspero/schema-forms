import {DOCUMENT} from '@angular/common';
import {ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {
  COMPONENT_DATA,
  FieldComponent,
  FieldData,
  FormBuilderComponent,
  FormBuilderData,
  FormBuilderService
} from '@jaspero/form-builder';
import {of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

interface Block {
  label: string;
  id: string;
  form: FormBuilderData;
  preview?: string;
}

interface BlocksData extends FieldData {
  blocks: Block[];
  style?: string;
}

@Component({
  selector: 'fb-pb-blocks',
  templateUrl: './blocks.component.html',
  styleUrls: ['./blocks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlocksComponent extends FieldComponent<BlocksData> implements OnInit {
  constructor(
    @Inject(COMPONENT_DATA)
    public cData: BlocksData,
    private service: FormBuilderService,
    private el: ElementRef,
    @Inject(DOCUMENT)
    private document: any
  ) {
    super(cData);
  }

  @ViewChild(FormBuilderComponent, {static: false})
  formBuilderComponent: FormBuilderComponent;

  @ViewChild('presetDialog', {static: true})
  presetDialogTemplate: TemplateRef<any>;

  formBuilder: FormBuilderData;

  ngOnInit() {

    const {
      blocks = [],
      style,
      control
    } = this.cData;

    if (style) {
      const styleEl = this.document.createElement('style');
      styleEl.type = 'text/css';
      styleEl.appendChild(
        this.document.createTextNode(style)
      );
      this.el.nativeElement.appendChild(styleEl);
    }

    const {
      selection,
      dataSet
    } = blocks.reduce((acc, cur) => {

      acc.selection[cur.id] = cur.form;
      // @ts-ignore
      acc.dataSet.push({name: cur.label, value: cur.id});

      return acc;
    }, {
      selection: {},
      dataSet: []
    });

    this.formBuilder = {
      schema: {
        properties: {
          blocks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: {
                  type: 'string'
                },
                options: {
                  type: 'string'
                }
              }
            }
          }
        }
      },
      segments: [{
        title: 'Blocks',
        array: '/blocks',
        fields: [
          '/type',
          '/options'
        ]
      }],
      definitions: {
        'blocks/type': {
          label: 'Type',
          component: {
            type: 'select',
            configuration: {
              dataSet
            }
          }
        },
        'blocks/options': {
          component: {
            type: 'pb-block',
            configuration: {
              selection
            }
          }
        }
      },
      value: {blocks: control.value || []}
    };
    this.service.saveComponents.push(this);
  }

  save(moduleId: string, documentId: string) {
    return this.formBuilderComponent.save(moduleId, documentId)
      .pipe(
        switchMap(() => {
          this.cData.control.setValue(
            this.formBuilderComponent.form.getRawValue().blocks
          );
          return of(true);
        })
      );
  }

}
