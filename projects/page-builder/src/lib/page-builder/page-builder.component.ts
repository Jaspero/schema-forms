import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {DOCUMENT} from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  ElementRef,
  Inject, Injector, OnDestroy,
  OnInit,
  Optional,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
  ViewContainerRef
} from '@angular/core';
import {DomSanitizer, ɵDomSharedStylesHost} from '@angular/platform-browser';
import {
  COMPONENT_DATA,
  FieldComponent,
  FieldData,
  FormBuilderContextService,
  FormBuilderData, Segment
} from '@jaspero/form-builder';
import {safeEval} from '@jaspero/utils';
import {TranslocoService} from '@ngneat/transloco';
import {UntilDestroy} from '@ngneat/until-destroy';
import {set} from 'json-pointer';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {BlockFormComponent} from '../block-form/block-form.component';
import {BlockComponent} from '../block/block.component';
import {NavigationComponent} from '../navigation/navigation.component';
import {FbPageBuilderOptions} from '../options.interface';
import {FB_PAGE_BUILDER_OPTIONS} from '../options.token';
import {PageBuilderCtxService} from '../page-builder-ctx.service';
import {registerBlocks} from '../register-blocks';
import {Selected} from '../selected.interface';
import {STATE} from '../state.const';
import {TopBlock} from '../top-block.interface';
import {uniqueId, UniqueId} from '../utils/unique-id';

declare global {
  interface Window {
    jpFbPb: {
      [key: string]: {
        [key: string]: any
      }
    }
  }
}

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

interface CompileOptions {
  removeWrapper: boolean;
}

export interface BlocksConfiguration {
  blocks?: Block[];
  layout?: {
    selector: string;
    content: string;
  };
  intro?: string | {[key: string]: string};
  rightSidebar?: {
    emptyState?: string;
  };
  styles?: string | string[];
  styleUrls?: string | string[];
  parentFormId?: string;
  /**
   * Should the compiled version of the html
   * be persisted in to database
   */
  saveCompiled?: boolean | CompileOptions;
}

export type BlocksData = BlocksConfiguration & FieldData;

@UntilDestroy()
@Component({
  selector: 'fb-pb-page-builder',
  templateUrl: './page-builder.component.html',
  styleUrls: ['./page-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageBuilderComponent extends FieldComponent<BlocksData> implements OnInit, OnDestroy {
  constructor(
    @Inject(COMPONENT_DATA)
    public cData: BlocksData,
    public transloco: TranslocoService,
    private formCtx: FormBuilderContextService,
    @Optional()
    @Inject(FB_PAGE_BUILDER_OPTIONS)
    private options: FbPageBuilderOptions,
    private cdr: ChangeDetectorRef,
    private domSanitizer: DomSanitizer,
    @Inject(DOCUMENT)
    private document: any,
    private renderer: Renderer2,
    private ctx: PageBuilderCtxService,
    private injector: Injector,
    private domSharedStyleHost: ɵDomSharedStylesHost
  ) {
    super(cData);
  }

  @ViewChild('ipe', {static: false, read: ViewContainerRef}) vce: ViewContainerRef;
  @ViewChild('iframe', {static: false}) iframeEl: ElementRef<HTMLIFrameElement>;
  @ViewChild(BlockFormComponent, {static: false}) blockFormComponent: BlockFormComponent;
  @ViewChildren(NavigationComponent) navigations: QueryList<NavigationComponent>;

  iframeTarget: HTMLElement;
  state = 'blocks';
  selected: Selected | null;
  selectedIndex: number;
  selection: {[key: string]: Selected};
  blocks: TopBlock[];
  availableBlocks: Block[];
  previewed: number | undefined;
  isOpen = false;
  originalOverflowY: string;
  view: 'fullscreen' | 'desktop' | 'mobile' = 'desktop';
  counter: UniqueId;
  intro$: Observable<string>;
  rightEmpty$: Observable<string>;

  private compRefs: ComponentRef<BlockComponent>[];

  get isFullscreen() {
    return this.view === 'fullscreen';
  }

  get iFrame() {
    return this.iframeEl.nativeElement as HTMLIFrameElement;
  }

  get iFrameDoc() {
    return (this.iFrame.contentDocument || this.iFrame.contentWindow) as Document;
  }

  get module() {
    return this.formCtx.module || 'pages';
  }

  get dataStore() {
    if (!window.jpFbPb) {
      window.jpFbPb = {};
    }

    if (!window.jpFbPb[this.module]) {
      window.jpFbPb[this.module] = {};
    }

    return window.jpFbPb[this.module];
  }

  ngOnInit() {

    this.counter = uniqueId();

    let {blocks = [], control} = this.cData;

    // @ts-ignore
    const addedBlocks = STATE.blocks[this.module];

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
        form: item.form,
      } as TopBlock;
    });

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

    window.jpFb.assignOperation({
      priority: 0,
      cData: this.cData,
      save: data => {

        const sharedStyles: {[key: string]: string} = {};

        set(
          data.outputValue,
          data.pointer,
          this.blocks.map((block, index) => {

            let compiled: string;

            if (this.cData.saveCompiled) {

              /**
               * If the page builder hasn't been open this will be undefined.
               */
              if (!this.compRefs) {
                this.open();
              }

              const el = this.compRefs[index].location.nativeElement;
              const {firstChild} = el;

              if (!sharedStyles[firstChild.localName]) {
                sharedStyles[firstChild.localName] = this.compileBlockStyle(firstChild);
              }

              compiled = this.compileBlockHtml(firstChild, (this.cData.saveCompiled as CompileOptions)?.removeWrapper)
            }

            return {
              value: block.value,
              type: block.type,
              ...compiled && {compiled}
            }
          })
        );

        const styles = Object.values(sharedStyles);

        if (styles.length) {
          set(
            data.outputValue,
            '/globalStyles',
            styles.reduce((acc, value) => acc + value, '')
          )
        }

        return of(true);
      }
    })
  }

  ngOnDestroy() {
    if (window.jpFbPb?.[this.module]) {
      delete window.jpFbPb[this.module];
    }
  }

  dragStarted() {
    (document.querySelector('.pb-preview-inner') as HTMLDivElement).style.transform = 'scale(0.7)';
  }

  dragStopped() {
    (document.querySelector('.pb-preview-inner') as HTMLDivElement).style.transform = 'scale(1)';
    this.blocks.forEach((_, i) => {
      this.removeFocus(i);
    });

    this.blocks = this.compRefs.map(ref => {
      const id = parseInt(ref.location.nativeElement.id.replace('block-', ''), 10);
      return this.blocks.find(block => block.id === id);
    });

    this.preview();
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

    this.compRefs.push(
      this.renderComponent(
        {type: block.id, id: this.counter.next()},
        value
      )
    );

    this.focusBlock(this.compRefs.length - 1);

    this.previewed = index;
    this.cdr.markForCheck();
  }

  blockSelected(index: number) {
    this.navigations.forEach((el, ind) => {
      if (index !== ind) {
        el.treeControl.collapseAll();
      }
    });
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

    setTimeout(() => {
      this.preview();

      /**
       * Scroll to the bottom of the sidebar
       */
      const listEl = document.querySelector('.pb-sidebar-list');
      listEl.scrollTop = listEl.getBoundingClientRect().height;

      /**
       * Automatically activate the newly added block
       */
      setTimeout(() => {
        (listEl.children[listEl.children.length - 1].querySelector('mat-tree-node') as any).click();
      }, 100);
    });
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

    moveItemInArray(this.compRefs, event.previousIndex, event.currentIndex);

    setTimeout(() => this.focusBlock(event.currentIndex), 200);
  }

  swapElements(previous, current) {
    const parent = this.iframeTarget;

    const after = current.nextElementSibling;
    if (previous === after) {
      parent.insertBefore(previous, current);
    } else {
      previous.replaceWith(current);
      parent.insertBefore(previous, after);
    }
  }

  removeBlock() {
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
      label: block.name || this.selection[block.type]?.label || this.transloco.translate('fbPb.SEGMENT'),
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

      this.compRefs[index].instance.selected = true;

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
    const block = this.compRefs[index];
    if (block) {
      block.instance.selected = false;
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
    this.dataStore[selected.id] = data || {};
    this.compRefs[this.selectedIndex].instance.change();
  }

  closeBlock() {
    if (!this.selected) {
      return;
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

    /**
     * We need to reset the screen scroll to the top
     * in order for the inline editors to work properly
     */
    window.scrollTo(0, 0);

    this.isOpen = true;

    registerBlocks(this.module, this.injector);

    this.originalOverflowY = this.document.body.style.overflowY;
    this.document.body.style.overflowY = 'hidden';

    this.document.body.classList.add('page-builder-open');

    this.cdr.detectChanges();

    /**
     * Set the iframe to standrs mode
     */
    const content = `<!DOCTYPE html><html><head></head><body></body></html>`;

    this.iFrame.contentWindow.document.open('text/htmlreplace');
    this.iFrame.contentWindow.document.write(content);
    this.iFrame.contentWindow.document.close();

    this.preview();

    if (this.cData.styleUrls) {
      const urls = typeof this.cData.styleUrls === 'string' ? [this.cData.styleUrls] : this.cData.styleUrls;

      if (urls.length) {
        urls.forEach(url => {
          const lEl = document.createElement('link');
          lEl.href = url;
          lEl.rel = 'stylesheet';
          lEl.type = 'text/css';
          this.iFrameDoc.head.appendChild(lEl);
        });
      }
    }

    const inlineStyles = (this.cData.styles ? (typeof this.cData.styles === 'string' ? [this.cData.styles] : this.cData.styles) : []);

    if (inlineStyles.length) {
      inlineStyles.forEach(style => {
        const el = document.createElement('style');
        el.innerHTML = style;
        this.iFrameDoc.head.appendChild(el);
      })
    }

    this.domSharedStyleHost.addHost(this.iFrameDoc.head);
  }

  close() {
    this.domSharedStyleHost.removeHost(this.iFrameDoc.head);
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
    if (this.vce.length) {
      this.vce.clear();
    }

    if (this.cData.layout) {
      this.iFrameDoc.body.innerHTML = this.cData.layout.content;
      this.iframeTarget = this.iFrameDoc.querySelector(this.cData.layout.selector);
    } else {
      this.iframeTarget = this.iFrameDoc.body;
    }

    this.compRefs = this.blocks.map((block, index) => {
      const ref = this.renderComponent(block, block.value);
      this.bindSelect(ref, block, index);
      return ref;
    });

    this.cdr.markForCheck();
  }

  isDisabled(block: Block) {
    if (!block.maxInstances) {
      return false;
    }

    return this.blocks.filter(it => it.type === block.id).length >= block.maxInstances;
  }

  private renderComponent(
    block: {type: string; id: number;},
    value: any
  ) {

    /**
     * Define state
     */
    this.dataStore[block.id] = value || {};


    /**
     * Creating block component
     */
    const type = this.selection[block.type];
    const element = document.createElement(block.type);

    element.setAttribute('id', block.id.toString());
    element.setAttribute('module', this.module);

    const cmpRef = this.vce.createComponent(BlockComponent, {
      projectableNodes: [[element]]
    });

    /**
     * Assigning inputs
     */
    cmpRef.instance.id = `block-${block.id}`;
    cmpRef.instance.module = this.module;
    cmpRef.instance.styles = type.previewStyle ? [type.previewStyle] : [];

    this.iframeTarget.appendChild(cmpRef.location.nativeElement);

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

  private compileBlockStyle(component) {
    const selector = component.localName;
    const {styles} = component._ngElementStrategy.componentFactory.componentDef;

    return styles.reduce((acc, style) =>
      acc + style
        .replace(/\[_nghost-%COMP%\]/g, selector)
        .replace(/(\[_ngcontent-%COMP%\])|[\n]|(\/\*.*?\*\/)/g, ''),
    '');
  }

  private compileBlockHtml(component, removeWrapper: boolean) {
    return (removeWrapper ? component.innerHTML : component.outerHTML)
      .replace(/(\x3C!--bindings={(\n|.)*?}-->)|(_nghost.*?"")|(ng-version=".*?")|(_ngcontent.*?"")|(ng-reflect-entry-options="\[object Object\]")|(ng-star-inserted)|(contenteditable=".*?")|(spellcheck="false")|(data-mce-style=".*?")|(data-mce-bogus=".*?")|(id="mce_*.?")|(mce-content-body)/g, '');
  }
}
