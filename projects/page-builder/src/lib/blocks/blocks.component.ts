import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {CommonModule, DOCUMENT} from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Compiler,
  Component, ComponentFactory,
  ComponentRef,
  ElementRef,
  Inject,
  NgModule,
  OnDestroy,
  OnInit,
  Optional, Renderer2,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {DomSanitizer} from '@angular/platform-browser';
import {
  COMPONENT_DATA,
  FieldComponent,
  FieldData,
  FormBuilderData,
  FormBuilderService,
  safeEval
} from '@jaspero/form-builder';
import {TranslocoService} from '@ngneat/transloco';
import {forkJoin, Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';
import {BlockComponent} from '../block/block.component';
import {FbPageBuilderOptions} from '../options.interface';
import {FB_PAGE_BUILDER_OPTIONS} from '../options.token';
import {Selected} from '../selected.interface';
import {TopBlock} from '../top-block.interface';
import {uniqueId, UniqueId} from '../utils/unique-id';

interface Block {
  label: string;
  id: string;
  form: FormBuilderData;

  /**
   * Prevents automatically opening
   * the block for editing. This is useful
   * on blocks that don't have any configuration.
   */
  skipOpen?: boolean;
  previewTemplate?: string;
  previewStyle?: string;
  previewValue?: any;

  /**
   * Used for formatting the entry value for
   * the preview
   *
   * (value: any, utils: {ds: DomSanitizer}) => any
   */
  previewFormat?: string;
  icon?: string;
}

interface BlocksData extends FieldData {
  blocks: Block[];
  intro?: string | {[key: string] : string};
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
    public transloco: TranslocoService,
    private service: FormBuilderService,
    @Optional()
    @Inject(FB_PAGE_BUILDER_OPTIONS)
    private options: FbPageBuilderOptions,
    private dialog: MatDialog,
    private compiler: Compiler,
    private cdr: ChangeDetectorRef,
    private domSanitizer: DomSanitizer,
    @Inject(DOCUMENT)
    private document: any,
    private renderer: Renderer2
  ) {
    super(cData);
  }

  @ViewChild('ipe', {static: false, read: ViewContainerRef})
  vce: ViewContainerRef;

  @ViewChild('iframe', {static: false})
  iframeEl: ElementRef<HTMLIFrameElement>;

  @ViewChild(BlockComponent, {static: false})
  blockComponent: BlockComponent;

  state = 'blocks';
  selected: Selected | null;
  selectedIndex: number;
  selection: {[key: string]: Selected};
  blocks: TopBlock[];
  previewed: number | undefined;
  toProcess: {
    [key: string]: {
      save: (c: string, d: string, comp: any[]) => Observable<any>;
      components: any[];
    }
  } = {};

  isOpen = false;
  originalOverflowY: string;
  view: 'fullscreen' | 'desktop' | 'mobile' = 'desktop';
  counter: UniqueId;

  private compRefs: ComponentRef<any>[];

  get isFullscreen() {
    return this.view === 'fullscreen';
  }

  get iFrameDoc() {
    return (this.iframeEl.nativeElement.contentDocument || this.iframeEl.nativeElement.contentWindow) as Document;
  }

  get intro() {

    if (!this.cData.intro) {
      return `<p><b>Page Builder</b><br>Create and edit contents of your web page.</p>`;
    }

    if (typeof this.cData.intro === 'string') {
      return this.cData.intro;
    } else {
      return this.cData.intro[this.transloco.getActiveLang()];
    }
  }

  ngOnInit() {

    this.counter = uniqueId();

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
        id: this.counter.next(),
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

  previewBlock(block: Block, index: number) {

    if (this.previewed !== undefined) {
      this.compRefs[this.compRefs.length - 1].destroy();
      this.compRefs.splice(this.compRefs.length - 1, 1);
    }

    this.compiler.compileModuleAndAllComponentsAsync(
      this.tempModule([{
        id: this.counter.next(),
        value: block.previewValue || {},
        type: block.id,
        icon: block.icon,
        label: block.label,
        visible: true
      }])
    )
      .then((factories) => {
        this.compRefs.push(
          ...factories.componentFactories.map(f =>
            this.renderComponent(f, block.previewValue || {})
          )
        );

        this.focusBlock(this.compRefs.length - 1);
      });

    this.previewed = index;
    this.cdr.markForCheck();
  }

  addBlock(block: Block) {

    const topBlock = {
      id: this.counter.next(),
      value: block.previewValue || {},
      type: block.id,
      icon: block.icon,
      label: block.label,
      visible: true
    };

    this.previewed = undefined;
    this.blocks.push(topBlock);

    if (block.skipOpen) {
      this.state = '';
      this.removeFocus(this.compRefs.length - 1);
      this.cdr.markForCheck();
    } else {
      this.selectBlock(topBlock, this.blocks.length - 1);
    }

    const index = this.compRefs.length - 1;

    this.bindSelect(this.compRefs[index], topBlock, index);
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
    this.swapElements(
      this.compRefs[event.previousIndex].location.nativeElement,
      this.compRefs[event.currentIndex].location.nativeElement
    );

    moveItemInArray(this.blocks, event.previousIndex, event.currentIndex);
    moveItemInArray(this.compRefs, event.previousIndex, event.currentIndex);
  }

  swapElements(previous, current) {
    const parent = this.iFrameDoc.body;

    if (current.nextSibling) {
      parent.insertBefore(previous, current);
    } else {
      parent.appendChild(previous);
    }
  }

  /**
   * TODO:
   * Run save operations
   */
  removeBlock() {
    delete this.toProcess[(this.selected as Selected).id];
    this.selected = null;
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
      id: block.id,
      value: block.value
    };

    this.focusBlock();

    this.state = 'inner';
    this.cdr.markForCheck();
  }

  focusBlock(index = this.selectedIndex) {
    const activeBlock = this.compRefs[index].location.nativeElement;
    activeBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
    activeBlock.shadowRoot.querySelector('div').style.boxShadow = 'inset  0px 0px 0px 2px rgba(0, 0, 0, .4)';
  }

  removeFocus(index = this.selectedIndex) {
    const block = this.compRefs[index].location.nativeElement;
    block.shadowRoot.querySelector('div').style.boxShadow = 'none';
  }

  optionsChanged(data: any) {

    const selected = this.selected as Selected;

    if (selected.previewFormat) {
      const format = safeEval(selected.previewFormat);

      if (format) {
        data = format(data, {
          ds: this.domSanitizer
        });
      }
    }

    this.blocks[this.selectedIndex].value = data;
    this.compRefs[this.selectedIndex].instance.data = data;
    this.compRefs[this.selectedIndex].changeDetectorRef.markForCheck();
  }

  closeBlock() {
    this.toProcess[(this.selected as Selected).id] = {
      save: this.blockComponent.formBuilderComponent
        .save
        .bind(
          this.blockComponent.formBuilderComponent
        ),
      components: [...(this.blockComponent.formBuilderComponent as any).service.saveComponents]
    };
    this.removeFocus(this.selectedIndex);
    this.selected = null;
    // @ts-ignore
    this.selectedIndex = undefined;
    this.state = '';
    this.cdr.markForCheck();
  }

  open() {
    this.isOpen = true;
    this.originalOverflowY = this.document.body.style.overflowY;
    this.document.body.style.overflowY = 'hidden';

    this.cdr.detectChanges();

    this.preview();
  }

  close() {

    this.document.body.style.overflowY = this.originalOverflowY;

    /**
     * If we're in a single block edit
     */
    if (this.selected) {
      this.toProcess[this.selected.id] = {
        save: this.blockComponent.formBuilderComponent
          .save
          .bind(this.blockComponent.formBuilderComponent),
        components: [...(this.blockComponent.formBuilderComponent as any).service.saveComponents]
      }
    }

    this.state = 'blocks';
    this.isOpen = false;
  }

  preview() {
    const tmpModule = this.tempModule(this.blocks);

    if (this.vce.length) {
      this.vce.clear();
    }

    this.compiler.compileModuleAndAllComponentsAsync(tmpModule)
      .then((factories) => {
        this.compRefs = factories.componentFactories.map((f, index) => {
          const ref = this.renderComponent(f, this.blocks[index].value);
          this.bindSelect(ref, this.blocks[index], index);
          return ref;
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
      template: `<div id="fb-pb-${block.id}">${type.previewTemplate}</div>`,
      styles: [
        ...type.previewStyle ? [type.previewStyle] : [],
        ...(this.cData.styles ? (typeof this.cData.styles === 'string' ? [this.cData.styles] : this.cData.styles) : [])

      ],
      encapsulation: ViewEncapsulation.ShadowDom
    })(class {})
  }

  save(moduleId: string, documentId: string) {
    const items = Object.entries(this.toProcess);

    if (items.length) {
      return forkJoin(items.map(it => it[1].save(moduleId, documentId, it[1].components)))
        .pipe(
          tap((value) => {
            this.cData.control.setValue(
              this.blocks.map(block => ({
                value: this.toProcess[block.id] ?
                  value[items.findIndex(it => it[0] === block.id.toString())] :
                  block.value,
                type: block.type
              }))
            );
          })
        )
    } else {
      this.cData.control.setValue(this.blocks.map(block => ({value: block.value, type: block.type})));
      return of(true);
    }
  }

  private renderComponent(
    factory: ComponentFactory<any>,
    value: any
  ) {
    const cmpRef = this.vce.createComponent(factory);
    const nElement = cmpRef.location.nativeElement;

    cmpRef.instance.data = value;

    this.iFrameDoc.body.appendChild(nElement);

    if (this.cData.styleUrls) {
      const urls = typeof this.cData.styleUrls === 'string' ? [this.cData.styleUrls] : this.cData.styleUrls;

      for (const url of urls) {
        const lEl = this.iFrameDoc.createElement('link');
        lEl.href = url;
        lEl.rel = 'stylesheet';
        lEl.type = 'text/css';
        nElement.appendChild(lEl);
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

    return cmpRef;
  }

  private bindSelect(ref: ComponentRef<any>, block: TopBlock, index: number) {
    this.renderer.listen(
      ref.location.nativeElement,
      'click',
      () => {

        if (this.selectedIndex !== undefined) {

          /**
           * Prevent clicking on the same elemnt from impacting anything
           */
          if (this.compRefs[this.selectedIndex].location.nativeElement === ref.location.nativeElement) {
            return;
          }

          this.closeBlock();
        }

        setTimeout(() =>
          this.selectBlock(block, index)
        )
      }
    );
  }
}
