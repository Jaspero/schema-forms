import {CommonModule} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Compiler,
  Component,
  ComponentRef,
  Inject,
  NgModule,
  OnDestroy,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {COMPONENT_DATA, FieldComponent, FieldData, FormBuilderComponent, FormBuilderData, FormBuilderService} from '@jaspero/form-builder';
import {merge, of, Subscription} from 'rxjs';
import {debounceTime, switchMap, tap} from 'rxjs/operators';
import {BlockComponent} from '../block/block.component';
import {FbPageBuilderOptions} from '../options.interface';
import {FB_PAGE_BUILDER_OPTIONS} from '../options.token';

interface Block {
  label: string;
  id: string;
  form: FormBuilderData;
  previewTemplate?: string;
  previewStyle?: string;
  previewValue?: any;
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
export class BlocksComponent extends FieldComponent<BlocksData> implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    @Inject(COMPONENT_DATA)
    public cData: BlocksData,
    private service: FormBuilderService,
    @Optional()
    @Inject(FB_PAGE_BUILDER_OPTIONS)
    private options: FbPageBuilderOptions,
    private dialog: MatDialog,
    private compiler: Compiler,
    private cdr: ChangeDetectorRef
  ) {
    super(cData);
  }

  @ViewChild('previewDialog', {static: true})
  previewDialogTemplate: TemplateRef<any>;

  @ViewChild('ipi', {static: true, read: ViewContainerRef})
  vci: ViewContainerRef;

  @ViewChild('ipe', {static: true, read: ViewContainerRef})
  vce: ViewContainerRef;

  @ViewChild(FormBuilderComponent, {static: false})
  formBuilderComponent: FormBuilderComponent;

  formBuilder: FormBuilderData;
  isOpen = false;

  private formSub: Subscription;
  private componentSub: Subscription;
  private compRefs: ComponentRef<any>[];

  ngOnInit() {
    const {
      blocks = [],
      control
    } = this.cData;

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
        title: 'Segments',
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

  ngAfterViewInit() {
    this.preview(this.vci);
  }

  ngOnDestroy() {
    this.service.removeComponent(this);

    if (this.formSub) {
      this.formSub.unsubscribe();
    }

    if (this.componentSub) {
      this.componentSub.unsubscribe();
    }
  }

  openAdd() {

  }

  closeAdd() {

  }

  open() {
    this.isOpen = true;
    this.preview(this.vce);

    this.formSub = this.formBuilderComponent.form.valueChanges
      .pipe(
        debounceTime(500)
      )
      .subscribe(() => {

        if (this.componentSub) {
          this.componentSub.unsubscribe();
        }

        this.componentSub = merge(
          ...this.preview(this.vce)
            .map((block, index) =>
              block.formBuilderComponent.form.valueChanges
                .pipe(
                  tap(value => {
                    if (this.compRefs && this.compRefs[index]) {
                      this.compRefs[index].instance.data = value;
                      this.compRefs[index].changeDetectorRef.markForCheck();
                    }
                  })
                )
            )
        )
          .subscribe()

      })
  }

  close() {
    this.isOpen = false;
    this.vce.clear();
    this.preview(this.vci);
  }

  preview(vc: ViewContainerRef) {
    // @ts-ignore
    const blocks: BlockComponent[] = this.formBuilderComponent.service.saveComponents
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
            styles: [
              ...this.cData.style ? [this.cData.style] : [],
              block.selection.previewStyle
            ],
            encapsulation: ViewEncapsulation.ShadowDom
          }
        })(class {})
      ),
      imports: [
        CommonModule,
        ...(this.options && this.options.previewModules) || []
      ]
    })(class A { });

    vc.clear();

    this.compiler.compileModuleAndAllComponentsAsync(tmpModule)
      .then((factories) => {
        this.compRefs = factories.componentFactories.map((f, index) => {
          const cmpRef = vc.createComponent(f);
          cmpRef.instance.data = blocks[index].formBuilderComponent.form.getRawValue();
          return cmpRef;
        });
        this.cdr.markForCheck();
      });

    return blocks;
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
