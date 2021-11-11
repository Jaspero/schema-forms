import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {CommonModule, DOCUMENT} from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Compiler,
  Component,
  ComponentFactory,
  ComponentRef,
  ElementRef,
  Inject,
  NgModule,
  OnDestroy,
  OnInit,
  Optional,
  Renderer2,
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
  FormBuilderContextService,
  FormBuilderData,
  FormBuilderService,
  Segment
} from '@jaspero/form-builder';
import {TranslocoService} from '@ngneat/transloco';
import {UntilDestroy} from '@ngneat/until-destroy';
import {forkJoin, Observable, of} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {BlockComponent} from '../block/block.component';
import {FbPageBuilderOptions} from '../options.interface';
import {FB_PAGE_BUILDER_OPTIONS} from '../options.token';
import {PageBuilderCtxService} from '../page-builder-ctx.service';
import {Selected} from '../selected.interface';
import {STATE} from '../state.const';
import {TopBlock} from '../top-block.interface';
import {uniqueId, UniqueId} from '../utils/unique-id';
import {safeEval} from '@jaspero/utils';

interface BlockSegment extends Segment {
  icon: string | ((value: any) => string);
}

interface BlockFormBuilderData extends FormBuilderData {
  segments?: BlockSegment[];
}

interface Block {
  label: string;
  id: string;
  form: BlockFormBuilderData;

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

  /**
   * Limit the number of instances per page
   */
  maxInstances?: number;

  /**
   * Default value to use when duplicated
   */
  duplicateValue?: any;
}

interface BlocksData extends FieldData {
  blocks: Block[];
  intro?: string | { [key: string]: string };
  rightSidebar?: {
    emptyState?: string;
  };
  styles?: string | string[];
  styleUrls?: string | string[];
  parentFormId?: string;
}

@UntilDestroy()
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
    private formCtx: FormBuilderContextService,
    @Optional()
    @Inject(FB_PAGE_BUILDER_OPTIONS)
    private options: FbPageBuilderOptions,
    private dialog: MatDialog,
    private compiler: Compiler,
    private cdr: ChangeDetectorRef,
    private domSanitizer: DomSanitizer,
    @Inject(DOCUMENT)
    private document: any,
    private renderer: Renderer2,
    private ctx: PageBuilderCtxService
  ) {
    super(cData);
  }

  @ViewChild('ipe', {static: false, read: ViewContainerRef}) vce: ViewContainerRef;
  @ViewChild('iframe', {static: false}) iframeEl: ElementRef<HTMLIFrameElement>;
  @ViewChild(BlockComponent, {static: false}) blockComponent: BlockComponent;

  state = 'blocks';
  selected: Selected | null;
  selectedIndex: number;
  selection: { [key: string]: Selected };
  blocks: TopBlock[];
  availableBlocks: Block[];
  previewed: number | undefined;
  toProcess: {
    [key: string]: {
      save: (c: string, d: string, comp: any[]) => Observable<any>;
      components: any[];
      metadata?: any;
    }
  } = {};
  isOpen = false;
  originalOverflowY: string;
  view: 'fullscreen' | 'desktop' | 'mobile' = 'desktop';
  counter: UniqueId;
  intro$: Observable<string>;
  rightEmpty$: Observable<string>;

  private compRefs: ComponentRef<any>[];

  get isFullscreen() {
    return this.view === 'fullscreen';
  }

  get iFrameDoc() {
    return (this.iframeEl.nativeElement.contentDocument || this.iframeEl.nativeElement.contentWindow) as Document;
  }

  dragStarted() {
    (document.querySelector('.pb-preview-inner') as HTMLDivElement).style.transform = 'scale(0.7)';
  }

  dragStopped() {
    (document.querySelector('.pb-preview-inner') as HTMLDivElement).style.transform = 'scale(1)';
    this.blocks.forEach((_, i) => {
      this.removeFocus(i);
    });
    this.preview();
  }

  ngOnInit() {

    this.counter = uniqueId();

    let {blocks = [], control} = this.cData;

    // @ts-ignore
    const addedBlocks = STATE.blocks[this.formCtx.module];

    if (addedBlocks) {
      blocks = [
        ...blocks,
        ...Object.entries(addedBlocks).map(([id, block]) => ({
          id,
          ...block
        }))
      ];
    }

    this.selection = blocks.reduce((acc, cur) => {
      acc[cur.id] = cur;
      return acc;
    }, {});

    this.availableBlocks = [...blocks];
    this.blocks = control.value.map(it => {
      const item = this.selection[it.type];
      return {
        id: this.counter.next(),
        value: it.value,
        type: it.type,
        icon: item.icon,
        label: item.label,
        visible: true,
        form: item.form
      } as TopBlock;
    });

    this.service.saveComponents.push(this);

    this.intro$ = this.transloco.langChanges$.pipe(
      map(() => {
        if (!this.cData.intro) {
          return `<p><b>Page Builder</b><br>Create and edit contents of your web page.</p>`;
        }

        if (typeof this.cData.intro === 'string') {
          return this.cData.intro;
        } else {
          return this.cData.intro[this.transloco.getActiveLang()];
        }
      })
    );

    this.rightEmpty$ = this.transloco.langChanges$.pipe(
      map(() => {
        if (!this.cData.rightSidebar?.emptyState) {
          return `
            <ul>
              <li>Use the left sidebar to add additional segments.</li>
              <li>You can delete and duplicate segments by right clicking on them in the sidebar.</li>
              <li>Most content can be edited inline.</li>
            </ul>
          `;
        }

        const {emptyState} = this.cData.rightSidebar;

        if (typeof emptyState === 'string') {
          return emptyState;
        } else {
          return emptyState[this.transloco.getActiveLang()];
        }
      })
    )
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

    const value = block.hasOwnProperty('previewValue') ?
      JSON.parse(JSON.stringify(block.previewValue)) :
      {};

    this.compiler.compileModuleAndAllComponentsAsync(
      this.tempModule([{
        id: this.counter.next(),
        type: block.id,
        icon: block.icon,
        label: block.label,
        visible: true,
        form: block.form,
        value
      }])
    )
      .then((factories) => {
        this.compRefs.push(
          ...factories.componentFactories.map(f =>
            this.renderComponent(f, value)
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
      /**
       * Stringifying and parsing ensures we lose references.
       * The value should always be parsable json so this shouldn't
       * be a problem.
       */
      value: JSON.parse(JSON.stringify(block.duplicateValue || block.previewValue || {})),
      type: block.id,
      icon: block.icon,
      label: block.label,
      form: block.form,
      visible: true
    };

    this.previewed = undefined;
    this.blocks.push(topBlock);

    this.state = '';
    this.cdr.markForCheck();

    const index = this.compRefs.length - 1;

    this.bindSelect(this.compRefs[index], topBlock, index);

    setTimeout(() => this.preview());
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

  moveBlocks(event: CdkDragDrop<string[]> | any) {
    this.swapElements(
      this.compRefs[event.previousIndex].location.nativeElement,
      this.compRefs[event.currentIndex].location.nativeElement
    );

    moveItemInArray(this.blocks, event.previousIndex, event.currentIndex);
    moveItemInArray(this.compRefs, event.previousIndex, event.currentIndex);
    setTimeout(() => this.focusBlock(event.currentIndex), 200);
  }

  swapElements(previous, current) {
    const parent = this.iFrameDoc.body;

    const after = current.nextElementSibling;
    if (previous === after) {
      parent.insertBefore(previous, current);
    } else {
      previous.replaceWith(current);
      parent.insertBefore(previous, after);
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

  selectBlock(block: TopBlock, index: number, focus = true) {
    this.selectedIndex = index;
    this.selected = {
      index,
      ...this.selection[block.type],
      id: block.id,
      value: block.value,
      form: block.form,
      nested: block.nested,
      label: block.name || this.selection[block.type]?.label || this.transloco.translate('PB.SEGMENT'),
      icon: block.icon
    };

    this.cdr.markForCheck();
    this.ctx.selectedBlock$.next(this.selectedIndex);

    if (focus) {
      this.focusBlock();
      this.state = 'inner';
      this.cdr.markForCheck();
    }
  }

  focusBlock(index = this.selectedIndex) {
    setTimeout(() => {
      const activeBlock = this.compRefs[index]?.location.nativeElement;

      if (!activeBlock) {
        return;
      }

      activeBlock.shadowRoot.querySelector('div').style.boxShadow = 'inset  0px 0px 0px 2px rgba(0, 0, 0, .4)';

      if (index === 0) {
        this.iFrameDoc.body.scrollTo({
          behavior: 'smooth',
          top: 0
        });
        return;
      }

      if (activeBlock) {
        activeBlock.scrollIntoView({behavior: 'smooth', block: 'start'});
      }
    });
  }


  removeFocus(index = this.selectedIndex) {
    const block = this.compRefs[index]?.location.nativeElement;
    if (block) {
      block.shadowRoot.querySelector('div').style.boxShadow = 'none';
    }
  }

  optionsChanged(data: any) {
    const selected = this.selected as Selected;

    if (selected?.previewFormat) {
      const format = safeEval(selected.previewFormat);

      if (format) {
        data = format(data, {
          ds: this.domSanitizer
        });
      }
    }

    if (!this.blocks[this.selectedIndex]) {
      return;
    }

    this.blocks[this.selectedIndex].value = data;
    this.blocks[this.selectedIndex].value = {...this.blocks[this.selectedIndex].value};
    this.compRefs[this.selectedIndex].instance.data = data;
    this.compRefs[this.selectedIndex].changeDetectorRef.markForCheck();
  }

  closeBlock() {
    if (!this.selected) {
      return;
    }

    if (this.blockComponent) {
      this.toProcess[(this.selected as Selected).id] = {
        save: this.blockComponent.formBuilderComponent
          .save
          .bind(
            this.blockComponent.formBuilderComponent
          ),
        metadata: this.blockComponent.formBuilderComponent.metadata,
        components: [...(this.blockComponent.formBuilderComponent as any).service.saveComponents]
      };
    }

    this.removeFocus(this.selectedIndex);
    this.selected = null;
    // @ts-ignore
    this.selectedIndex = undefined;
    this.state = '';
    this.ctx.selectedBlock$.next(undefined);
    this.cdr.markForCheck();
  }

  open() {
    this.isOpen = true;
    this.originalOverflowY = this.document.body.style.overflowY;
    this.document.body.style.overflowY = 'hidden';

    this.document.body.classList.add('page-builder-open');

    this.cdr.detectChanges();

    this.preview();
  }

  close() {
    this.closeBlock();
    this.cdr.markForCheck();

    setTimeout(() => {
      this.document.body.style.overflowY = this.originalOverflowY;
      this.document.body.classList.remove('page-builder-open');

      setTimeout(() => {
        this.state = 'blocks';
        this.isOpen = false;
        this.selectedIndex = undefined;
        this.cdr.markForCheck();
      });
    }, 100);
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
    })(class A {});
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
    })(class {});
  }

  isDisabled(block: Block) {
    if (!block.maxInstances) {
      return false;
    }

    return this.blocks.filter(it => it.type === block.id).length >= block.maxInstances;
  }

  save(moduleId: string, documentId: string) {
    const items = Object.entries(this.toProcess);

    if (items.length) {
      return forkJoin(items.map(it => it[1].save(moduleId, documentId, it[1].components)))
        .pipe(
          tap((values) => {
            this.cData.control.setValue(
              this.blocks.map(block => {

                let value: any = block.value;

                if (this.toProcess[block.id]) {
                  const itemIndex = items.findIndex(it => it[0] === block.id.toString());
                  const processedValue = values[itemIndex];
                  const {metadata} = items[itemIndex][1];

                  if (metadata?.array) {
                    value[metadata.array][metadata.index] = processedValue;
                  } else {
                    value = processedValue;
                  }
                }

                return {
                  value,
                  type: block.type
                }
              })
            );
          })
        );
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
           * Prevent clicking on the same element from impacting anything
           */
          if (
            this.compRefs[this.selectedIndex].location.nativeElement === ref.location.nativeElement
            && !this.selected.form.segments.length
          ) {
            this.ctx.selectedBlock$.next(this.selectedIndex);
            return;
          }

          this.closeBlock();
        }

        this.cdr.markForCheck();
        setTimeout(() => {
          this.cdr.markForCheck();
          this.selectBlock({
            ...block,
            form: {
              ...block.form,
              segments: []
            }
          }, index);
          this.cdr.markForCheck();
        }, 50);
      }
    );
  }
}
