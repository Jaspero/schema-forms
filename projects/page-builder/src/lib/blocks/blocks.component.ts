import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {CommonModule} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Compiler,
  Component, ComponentRef,
  Inject,
  NgModule,
  OnDestroy,
  OnInit,
  Optional,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {COMPONENT_DATA, FieldComponent, FieldData, FormBuilderData, FormBuilderService} from '@jaspero/form-builder';
import {of} from 'rxjs';
import {FbPageBuilderOptions} from '../options.interface';
import {FB_PAGE_BUILDER_OPTIONS} from '../options.token';
import {Selected} from '../selected.interface';
import {TopBlock} from '../top-block.interface';

interface Block {
  label: string;
  id: string;
  form: FormBuilderData;
  previewTemplate?: string;
  previewStyle?: string;
  previewValue?: any;
  icon?: string;
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

  @ViewChild('ipi', {static: true, read: ViewContainerRef})
  vci: ViewContainerRef;

  @ViewChild('ipe', {static: true, read: ViewContainerRef})
  vce: ViewContainerRef;

  state = 'blocks';
  selected: Selected | null;
  selectedIndex: number;
  selection: {[key: string]: Selected};
  blocks: TopBlock[];
  previewed: number | undefined;

  isOpen = false;

  private compRefs: ComponentRef<any>[];

  ngOnInit() {
    const {
      blocks = [],
      control
    } = this.cData;

    this.selection = blocks.reduce((acc, cur) => {
      acc[cur.id] = cur;
      return acc;
    }, {});

    this.blocks = control.value.map(it => {
      const item = this.selection[it.type];
      return {
        value: it.value,
        type: it.type,
        icon: item.icon,
        label: item.label,
        visible: true
      } as TopBlock;
    });

    this.service.saveComponents.push(this);
  }

  ngAfterViewInit() {
    this.preview(this.vci);
  }

  ngOnDestroy() {
    this.service.removeComponent(this);
  }

  openAdd() {
    this.state = 'add';
    this.cdr.markForCheck();
  }

  previewBlock(block: Block, index: number) {

    if (this.previewed !== undefined) {
      this.compRefs[this.compRefs.length - 1].destroy();
      this.compRefs.splice(this.compRefs.length - 1, 1);
    }

    this.compiler.compileModuleAndAllComponentsAsync(
      this.tempModule([{
        value: block.previewValue || {},
        type: block.id,
        icon: block.icon,
        label: block.label,
        visible: true
      }])
    )
      .then((factories) => {
        this.compRefs.push(
          ...factories.componentFactories.map(f => {
            const cmpRef = this.vce.createComponent(f);
            cmpRef.instance.data = block.previewValue || {};
            return cmpRef;
          })
        );
      });

    this.previewed = index;
    this.cdr.markForCheck();
  }

  addBlock(block: Block) {
    this.blocks.push({
      value: block.previewValue || {},
      type: block.id,
      icon: block.icon,
      label: block.label,
      visible: true
    });
    this.previewed = undefined;
    this.state = '';
    this.cdr.markForCheck();
  }

  closeAdd() {
    this.state = '';

    if (this.previewed !== undefined) {
      this.compRefs[this.compRefs.length - 1].destroy();
      this.compRefs.splice(this.compRefs.length - 1, 1);
    }

    this.previewed = undefined;

    this.cdr.markForCheck();
  }

  moveBlocks(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.blocks, event.previousIndex, event.currentIndex);
    this.preview(this.vce);
  }

  /**
   * TODO:
   * Run save operations
   */
  removeBlock() {
    this.state = '';
    this.blocks.splice(this.selectedIndex, 1);
    this.compRefs[this.selectedIndex].destroy();
    this.compRefs.splice(this.selectedIndex, 1);
    this.cdr.markForCheck();
  }

  toggleVisible(index: number) {

  }

  selectBlock(block: TopBlock, index: number) {
    this.selectedIndex = index;
    this.selected = {
      ...this.selection[block.type],
      value: block.value
    };
    this.state = 'inner';
    this.cdr.markForCheck();
  }

  optionsChanged(data: any) {
    this.compRefs[this.selectedIndex].instance.data = data;
    this.compRefs[this.selectedIndex].changeDetectorRef.markForCheck();
  }

  closeBlock() {
    this.selected = null;
    // @ts-ignore
    this.selectedIndex = undefined;
    this.state = '';
    this.cdr.markForCheck();
  }

  open() {
    this.isOpen = true;
    this.preview(this.vce);
  }

  close() {
    this.isOpen = false;
    this.vce.clear();
    this.preview(this.vci);
  }

  preview(vc: ViewContainerRef) {
    const tmpModule = this.tempModule(this.blocks);

    vc.clear();

    this.compiler.compileModuleAndAllComponentsAsync(tmpModule)
      .then((factories) => {
        this.compRefs = factories.componentFactories.map((f, index) => {
          const cmpRef = vc.createComponent(f);
          cmpRef.instance.data = this.blocks[index].value;
          return cmpRef;
        });
        this.cdr.markForCheck();
      });
  }

  tempModule(blocks: TopBlock[]) {
    return  NgModule({
      declarations: blocks.map(block =>
        this.createPreviewComponent(block)
      ),
      imports: [
        CommonModule,
        ...(this.options && this.options.previewModules) || []
      ]
    })(class A { });
  }

  createPreviewComponent(block: TopBlock) {
    const type = this.selection[block.type];
    return Component({
      template: type.previewTemplate,
      ...type.previewStyle && {
        styles: [
          ...this.cData.style ? [this.cData.style] : [],
          type.previewStyle
        ],
        encapsulation: ViewEncapsulation.ShadowDom
      }
    })(class {})
  }

  /**
   * TODO: Save each blocks options
   */
  save(moduleId: string, documentId: string) {
    this.cData.control.setValue(this.blocks.map(block => ({value: block.value, type: block.type})));
    return of(true);
  }
}
