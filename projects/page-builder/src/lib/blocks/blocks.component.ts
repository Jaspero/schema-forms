import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {CommonModule} from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Compiler,
  Component,
  ComponentRef,
  ElementRef,
  Inject,
  NgModule,
  OnDestroy,
  OnInit,
  Optional,
  ViewChild,
  ViewContainerRef
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
  styles?: string | string[];
  styleUrls?: string | string[];
}

@Component({
  selector: 'fb-pb-blocks',
  templateUrl: './blocks.component.html',
  styleUrls: ['./blocks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlocksComponent extends FieldComponent<BlocksData> implements OnInit, OnDestroy {
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

  @ViewChild('ipe', {static: false, read: ViewContainerRef})
  vce: ViewContainerRef;

  @ViewChild('iframe', {static: false})
  iframeEl: ElementRef<HTMLIFrameElement>;

  state = 'blocks';
  selected: Selected | null;
  selectedIndex: number;
  selection: {[key: string]: Selected};
  blocks: TopBlock[];
  previewed: number | undefined;

  isOpen = false;
  view: 'fullscreen' | 'desktop' | 'mobile' = 'desktop';

  private compRefs: ComponentRef<any>[];

  get isFullscreen() {
    return this.view === 'fullscreen';
  }

  get iFrameDoc() {
    return (this.iframeEl.nativeElement.contentDocument || this.iframeEl.nativeElement.contentWindow) as Document;
  }

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

  ngOnDestroy() {
    this.service.removeComponent(this);
  }

  openAdd() {
    this.state = 'add';
    this.cdr.markForCheck();
  }

  iframeLoaded() {

    if (this.cData.styleUrls) {
      const urls = typeof this.cData.styleUrls === 'string' ? [this.cData.styleUrls] : this.cData.styleUrls;

      for (const url of urls) {
        const lEl = this.iFrameDoc.createElement('link');
        lEl.href = url;
        lEl.rel = 'stylesheet';
        lEl.type = 'text/css';
        this.iFrameDoc.head.appendChild(lEl);
      }
    }

    if (this.cData.styles) {

      const styles = typeof this.cData.styles === 'string' ? [this.cData.styles] : this.cData.styles;

      for (const style of styles) {
        const sEl = this.iFrameDoc.createElement('style');
        sEl.innerHTML = style;
        this.iFrameDoc.head.appendChild(sEl);
      }
    }
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

            this.iFrameDoc.body.appendChild(cmpRef.location.nativeElement);

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
    this.preview();
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

    const el = this.compRefs[index].location.nativeElement;
    const block = this.blocks[index];

    if (block.visible || block.visible === undefined) {
      el.style.display = 'none';
      block.visible = false;
    } else {
      el.style.display = 'unset';
      block.visible = true;
    }
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
    this.blocks[this.selectedIndex].value = data;
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

    this.cdr.detectChanges();

    this.preview();
  }

  close() {
    this.isOpen = false;
  }

  preview() {
    const tmpModule = this.tempModule(this.blocks);

    if (this.vce.length)
    this.vce.clear();

    this.compiler.compileModuleAndAllComponentsAsync(tmpModule)
      .then((factories) => {
        this.compRefs = factories.componentFactories.map((f, index) => {
          const cmpRef = this.vce.createComponent(f);
          cmpRef.instance.data = this.blocks[index].value;
          return cmpRef;
        });
        this.cdr.markForCheck();
      });
  }

  tempModule(blocks: TopBlock[]) {
    return NgModule({
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
        styles: [type.previewStyle],
        // encapsulation: ViewEncapsulation.ShadowDom
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
