import {CommonModule, DOCUMENT} from '@angular/common';
import {
  ChangeDetectionStrategy, Compiler,
  Component,
  ElementRef,
  Inject, NgModule,
  OnInit, Optional,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {FormArray} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
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
import {BlockComponent} from '../block/block.component';
import {FbPageBuilderOptions} from '../options.interface';
import {FB_PAGE_BUILDER_OPTIONS} from '../options.token';

interface Block {
  label: string;
  id: string;
  form: FormBuilderData;
  previewTemplate?: string;
  previewStyle?: string;
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
    private document: any,
    @Optional()
    @Inject(FB_PAGE_BUILDER_OPTIONS)
    private options: FbPageBuilderOptions,
    private dialog: MatDialog,
    private compiler: Compiler
  ) {
    super(cData);
  }

  @ViewChild('previewDialog', {static: true})
  previewDialogTemplate: TemplateRef<any>;

  @ViewChild('el', {static: false, read: ViewContainerRef})
  vc: ViewContainerRef;

  @ViewChild(FormBuilderComponent, {static: false})
  formBuilderComponent: FormBuilderComponent;

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

      acc.selection[cur.id] = {
        form: cur.form,
        previewTemplate: cur.previewTemplate,
        previewStyle: cur.previewStyle
      };
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

  preview() {
    this.dialog.open(
      this.previewDialogTemplate,
      {
        width: '80%'
      }
    )
      .afterOpened()
      .subscribe(() => {

        const blocks: BlockComponent[] = this.formBuilderComponent['service'].saveComponents
          .filter(block => block.selection)
          .sort((one, two) =>
            (one.cData.form.controls.blocks.controls.indexOf(one.cData.control.parent)) -
            (two.cData.form.controls.blocks.controls.indexOf(two.cData.control.parent))
          );

        const tmpModule = NgModule({
          declarations: blocks.map(block =>
            Component({
              template: block.selection.previewTemplate,
              ...block.selection.previewStyle && {
                styles: [block.selection.previewStyle]
              }
            })(class {})
          ),
          imports: [
            CommonModule,
            ...(this.options && this.options.previewModules) || []
          ]
        })(class A { });

        this.compiler.compileModuleAndAllComponentsAsync(tmpModule)
          .then((factories) => {
            factories.componentFactories.forEach((f, index) => {
              const cmpRef = this.vc.createComponent(f);
              cmpRef.instance.data = blocks[index].formBuilderComponent.form.getRawValue();
            })
          });
      })
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
