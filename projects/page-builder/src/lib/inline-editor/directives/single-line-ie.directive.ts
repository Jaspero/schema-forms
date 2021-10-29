import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  Optional,
  Renderer2,
  ViewEncapsulation
} from '@angular/core';
import {Parser} from '@jaspero/form-builder';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {merge, Subscription} from 'rxjs';
import {filter, switchMap, tap} from 'rxjs/operators';
import {PageBuilderCtxService} from '../../page-builder-ctx.service';
import {Toolbar, ToolbarService} from '../../toolbar.service';
import {domListener} from '../../utils/dom-listener';
import {getControl} from '../../utils/get-control';

interface Options {
  formId?: string;
  array?: string;
  index?: number;
  pointer: string;
  elementOptions?: string[];
  textDecorations?: string[];
  textAligns?: string[];
  multiline?: boolean;
  remove?: boolean;
}

@UntilDestroy()
@Component({
  // tslint:disable-next-line:component-selector
  selector: '[fbPbSingleLineIE]',
  template: '',
  styleUrls: ['./toolbar.scss'],
  encapsulation: ViewEncapsulation.None
})
// tslint:disable-next-line:component-class-suffix
export class SingleLineIEDirective implements AfterViewInit, OnDestroy {
  @Input('fbPbSingleLineIE')
  entryOptions: Options;
  defaultOptions = {
    elementOptions: ['H1', 'H2', 'H3', 'H4', 'H5', 'P'],
    textDecorations: ['b', 'i', 'u'],
    textAligns: ['left', 'center', 'right', 'justify'],
    remove: true
  };
  lastTarget: HTMLElement;
  options: Options;
  toolbar: Toolbar;
  id: string;
  pointer: string;
  activeCls = 'pb-t-active';
  private scrollListener: Subscription;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    @Optional()
    private toolbarService: ToolbarService,
    @Optional()
    private ctx: PageBuilderCtxService
  ) {
  }

  get htmlEl() {
    return this.el.nativeElement;
  }

  get iFrame() {
    return (document.querySelector('#fb-pb-iframe') as HTMLIFrameElement);
  }

  get shadowRoot() {
    return this.el.nativeElement.getRootNode() as ShadowRoot;
  }

  get host() {
    return this.htmlEl.getRootNode().host;
  }

  get index() {
    return [...this.host.parentElement?.children || []].indexOf(this.host);
  }

  get control() {
    return getControl(
      this.id,
      this.index,
      this.pointer,
      this.options.array,
      this.options.index
    );
  }

  async ngAfterViewInit() {
    await new Promise((resolve) => setTimeout(resolve, 10));
    if (!this.toolbarService) {
      return;
    }

    this.options = {
      ...this.defaultOptions,
      ...this.entryOptions
    };

    this.id = this.options.formId || 'main';
    this.pointer = Parser.standardizeKeyWithSlash(this.options.pointer);

    if (this.options.array) {
      this.pointer = this.options.array + this.pointer;
    }

    this.toolbar = this.toolbarService.createToolbar(
      this.options.elementOptions,
      this.options.textDecorations,
      this.options.textAligns,
      this.options.remove
    );

    this.assignLastTarget();

    if (this.toolbar.elements.typeSelect) {
      this.toolbar.elements.typeSelect.value = this.lastTarget.tagName;
    }

    this.renderer.setAttribute(
      this.htmlEl,
      'contenteditable',
      ''
    );

    this.renderer.setStyle(
      this.htmlEl,
      'position',
      'relative'
    );

    const events: any[] = [
      domListener(
        this.renderer,
        this.htmlEl,
        'blur'
      )
        .pipe(
          tap(() => {
            this.update();
            setTimeout(() => this.assignLastTarget());
          })
        )
    ];
    const filteredEvents: any[] = [
      domListener(
        this.renderer,
        this.htmlEl,
        'keydown'
      )
        .pipe(
          tap((e: KeyboardEvent) => {

            /**
             * Prevent creating new elements and adding br instead
             */
            if (e.key === 'Enter') {

              const selection = (this.shadowRoot.getSelection() as Selection);
              const range = selection.getRangeAt(0);
              const br = document.createElement('br');

              range.insertNode(br);
              range.setStartAfter(br);
              selection.removeAllRanges();
              selection.addRange(range);

              e.preventDefault();
            }
          })
        )
    ];

    if (this.toolbar.elements.typeSelect) {
      filteredEvents.push(
        domListener(
          this.renderer,
          this.toolbar.elements.typeSelect,
          'change'
        )
          .pipe(
            tap(() => {
              if (!this.lastTarget) {
                return;
              }

              const currentTag = this.lastTarget.tagName.toLowerCase();
              const newTag = this.toolbar.elements.typeSelect?.value.toLowerCase();

              this.lastTarget.outerHTML = this.lastTarget.outerHTML
                .replace(new RegExp(`\<${currentTag}`), `<${newTag}`)
                .replace(new RegExp(`${currentTag}/>`), `${newTag}/>`);

              /**
               * Updating outerHTML detaches the element and
               * creates a new one in its place
               */
              setTimeout(() => {
                this.assignLastTarget();
              });

              this.update();
            })
          )
      );
    }

    if (this.options.textDecorations) {

      if (this.iFrame?.contentDocument) {
        filteredEvents.push(
          domListener(
            this.renderer,
            this.iFrame.contentDocument as any,
            'selectionchange'
          )
            .pipe(
              filter(() => this.toolbar.visible),
              tap(() =>
                this.triggerSelection()
              )
            )
        );
      }

      this.options.textDecorations.forEach((el) => {
        const toolbarEl = this.toolbar.elements[el];

        events.push(
          domListener(
            this.renderer,
            toolbarEl,
            'mousedown'
          )
            .pipe(tap((e: MouseEvent) =>
              e.preventDefault()
            ))
        );

        filteredEvents.push(
          domListener(
            this.renderer,
            toolbarEl,
            'click'
          )
            .pipe(
              tap(() => {
                const {classList} = toolbarEl;
                const active = classList.contains(this.activeCls);
                const execMap = {
                  i: 'italic',
                  b: 'bold',
                  u: 'underline'
                };

                if (active) {
                  classList.remove(this.activeCls);
                } else {
                  classList.add(this.activeCls);
                }

                (this.iFrame.contentDocument as Document).execCommand(execMap[el]);
              })
            )
        );
      });
    }

    if (this.options.textAligns) {
      this.options.textAligns.forEach(el => {
        const toolbarEl = this.toolbar.elements[el];

        events.push(
          domListener(
            this.renderer,
            toolbarEl,
            'mousedown'
          )
            .pipe(
              tap((e: MouseEvent) => e.preventDefault())
            ),
          domListener(
            this.renderer,
            toolbarEl,
            'click'
          )
            .pipe(
              tap(() => {

                const {classList} = toolbarEl;

                if (classList.contains(this.activeCls)) {
                  this.lastTarget.removeAttribute('style');
                  classList.remove(this.activeCls);
                } else {
                  this.lastTarget.setAttribute('style', `text-align:${el}`);
                  classList.add(this.activeCls);
                }

                this.options.textAligns?.forEach(key => {
                  if (this.toolbar.elements[key] !== toolbarEl) {
                    this.toolbar.elements[key].classList.remove(this.activeCls);
                  }
                });
              })
            )
        );
      });
    }

    if (this.toolbar.elements.remove) {
      const el = this.toolbar.elements.remove;

      filteredEvents.push(
        domListener(
          this.renderer,
          el,
          'mousedown'
        )
          .pipe(
            tap((e: MouseEvent) => e.preventDefault())
          ),
        domListener(
          this.renderer,
          el,
          'click'
        )
          .pipe(
            tap(() => {
              // this.htmlEl.parentElement.removeChild(this.htmlEl);
              // this.htmlEl.remove();

              setTimeout(() => {
                this.update('');
                setTimeout(() => {
                  this.toolbarService.clearToolbar(this.toolbar.id);
                }, 50);
              }, 10);
            })
          )
      );
    }

    filteredEvents.push(
      domListener(
        this.renderer,
        this.htmlEl,
        'click'
      )
        .pipe(
          tap(() => this.showToolbar())
        )
    );

    merge(
      ...events
    )
      .pipe(
        untilDestroyed(this)
      )
      .subscribe();

    this.ctx.selectedBlock$
      .pipe(
        filter(index => {
          const match = this.index === index;

          if (!match) {
            this.toolbarService.hideToolbar(this.toolbar.id);

            if (this.scrollListener) {
              this.scrollListener.unsubscribe();
              this.scrollListener = null;
            }
          } else if (
            this.htmlEl.contains((this.shadowRoot.getSelection() as Selection)?.anchorNode?.parentElement)
          ) {
            this.showToolbar();
          }

          return match;
        }),
        switchMap(() =>
          merge(...filteredEvents)
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  ngOnDestroy() {
    if (this.toolbar) {
      this.toolbarService.clearToolbar(this.toolbar.id);
    }
  }

  showToolbar() {
    if (this.toolbar.visible) {
      return;
    }

    this.triggerSelection();

    const {top, left} = this.htmlEl.getBoundingClientRect();

    this.toolbarService.showToolbar(top, left, this.toolbar.id);

    let {scrollY} = this.iFrame.contentWindow;

    /**
     * Add the offset from top for the begining of the iframe
     * and remove the default height of the toolbar and border
     */
    scrollY += this.iFrame.getBoundingClientRect().y - 40;

    this.scrollListener = this.toolbarService.scroll$()
      .pipe(untilDestroyed(this))
      .subscribe(num => {
        this.toolbar.el.style.top = (top + scrollY - num) + 'px';
      });


    setTimeout(() => {
      this.toolbar.elements.typeSelect.click();
    });
  }

  triggerSelection() {

    const selection = this.shadowRoot.getSelection() as Selection;
    const existing = this.options.textDecorations as string[];
    const decorations: string[] = [];

    let el = (selection.anchorNode as HTMLElement)?.parentElement as HTMLElement;

    while (el && el !== this.lastTarget) {

      const tag = el.tagName.toLowerCase();

      if (existing.includes(tag)) {
        decorations.push(tag);
      }

      el = el.parentElement as HTMLElement;
    }

    this.options.textDecorations?.forEach(dec => {

      const {classList} = this.toolbar.elements[dec];
      const contains = classList.contains(this.activeCls);

      if (decorations.includes(dec)) {
        if (!contains) {
          classList.add(this.activeCls);
        }
      } else if (contains) {
        classList.remove(this.activeCls);
      }
    });
  }

  update(data = this.htmlEl.innerHTML, onlySelf = false) {
    this.control.setValue(data, {onlySelf});
  }

  private assignLastTarget() {
    this.lastTarget = this.htmlEl.children[0] as HTMLElement;
  }
}
