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
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {filter} from 'rxjs/operators';
import {Toolbar, ToolbarService} from '../../toolbar.service';
import {domListener} from '../../utils/dom-listener';

interface Options {
  property: string;
  data: any;
  elementOptions?: string[];
  textDecorations?: string[];
  textAligns?: string[];
  multiline?: boolean;
}

@UntilDestroy()
@Component({
  selector: '[fbPbSingleLineIE]',
  template: '',
  styleUrls: ['./toolbar.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SingleLineIEDirective implements AfterViewInit, OnDestroy {
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    @Optional()
    private toolbarService: ToolbarService
  ) { }

  @Input('fbPbSingleLineIE')
  entryOptions: Options;

  defaultOptions = {
    elementOptions: ['H1', 'H2', 'H3', 'H4', 'H5', 'P'],
    textDecorations: ['b', 'i', 'u'],
    textAligns: ['left', 'center', 'right', 'justify']
  };
  lastTarget: HTMLElement;
  options: Options;
  toolbar: Toolbar;

  activeCls = 'pb-t-active';

  get htmlEl() {
    return this.el.nativeElement;
  }

  get iFrame() {
    return (document.querySelector('#fb-pb-iframe') as HTMLIFrameElement);
  }

  get shadowRoot() {
    return (
      (this.iFrame.contentDocument as Document)
        .body
        .children[0] as HTMLElement
    )
      .shadowRoot as ShadowRoot;
  }

  ngAfterViewInit() {
    this.options = {
      ...this.defaultOptions,
      ...this.entryOptions
    };

    this.toolbar = this.toolbarService.createToolbar(
      this.options.elementOptions,
      this.options.textDecorations,
      this.options.textAligns
    );

    this.lastTarget = this.htmlEl.children[0] as HTMLElement;

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

    domListener(
      this.renderer,
      this.htmlEl,
      'keydown'
    )
      .pipe(
        untilDestroyed(this)
      )
      .subscribe((e: KeyboardEvent) => {

        /**
         * Prevent creating new elements and adding br instead
         */
        if (e.key === 'Enter') {
          document.execCommand('insertLineBreak');
          return false;
        }
      });

    if (this.toolbar.elements.typeSelect) {
      domListener(
        this.renderer,
        this.toolbar.elements.typeSelect,
        'change'
      )
        .pipe(
          untilDestroyed(this)
        )
        .subscribe(() => {

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
            this.lastTarget = this.htmlEl.children[0];
          });

          this.update();
        });
    }

    if (this.options.textDecorations) {

      domListener(
        this.renderer,
        this.iFrame.contentDocument as any,
        'selectionchange'
      )
        .pipe(
          filter(() => this.toolbar.visible),
          untilDestroyed(this)
        )
        .subscribe(() =>
          this.triggerSelection()
        );

      this.options.textDecorations.forEach((el) => {
        const toolbarEl = this.toolbar.elements[el];

        domListener(
          this.renderer,
          toolbarEl,
          'mousedown'
        )
          .pipe(
            untilDestroyed(this)
          )
          .subscribe(e =>
            e.preventDefault()
          );

        domListener(
          this.renderer,
          toolbarEl,
          'click'
        )
          .pipe(
            untilDestroyed(this)
          )
          .subscribe(() => {
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

            this.update();
          })
      })
    }

    if (this.options.textAligns) {
      this.options.textAligns.forEach(el => {
        const toolbarEl = this.toolbar.elements[el];

        domListener(
          this.renderer,
          toolbarEl,
          'mousedown'
        )
          .pipe(
            untilDestroyed(this)
          )
          .subscribe(e =>
            e.preventDefault()
          );

        domListener(
          this.renderer,
          toolbarEl,
          'click'
        )
          .pipe(
            untilDestroyed(this)
          )
          .subscribe(() => {

            const {classList} = toolbarEl;

            if (classList.contains(this.activeCls)) {
              this.lastTarget.removeAttribute('style');
              classList.remove(this.activeCls);
            } else {
              this.lastTarget.setAttribute('style', `text-align:${el}`);
              classList.add(this.activeCls);
            }

            this.options.textAligns?.forEach(el => {
              if (this.toolbar.elements[el] !== toolbarEl) {
                this.toolbar.elements[el].classList.remove(this.activeCls);
              }
            });

            this.update();
          })
      })
    }

    domListener(
      this.renderer,
      this.htmlEl,
      'input'
    )
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(() =>
        this.update()
      );

    domListener(
      this.renderer,
      this.htmlEl,
      'click',
    )
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(() => {
        if (this.toolbar.visible) {
          return;
        }

        this.triggerSelection();

        const {top, left} = this.htmlEl.getBoundingClientRect();

        this.toolbarService.showToolbar(top, left, this.toolbar.id);
      });
  }

  ngOnDestroy() {
    if (this.toolbar) {
      this.toolbarService.clearToolbar(this.toolbar.id);
    }
  }

  triggerSelection() {

    const selection = this.shadowRoot.getSelection() as Selection;
    const existing = this.options.textDecorations as string[];
    const decorations: string[] = [];

    let el = (selection.anchorNode as HTMLElement)?.parentElement as HTMLElement;

    while (el && el !== this.lastTarget) {

      const tag = el.tagName.toLowerCase();

      if (existing.includes(tag)) {
        decorations.push(tag)
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

  update() {
    this.options.data[this.options.property] = this.htmlEl.innerHTML;
  }
}
