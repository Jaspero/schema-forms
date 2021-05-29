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
  iframe: Window;
  options: Options;
  toolbar: Toolbar;
  decorations: Array<{value: string; type: string}> = [];

  selectionChange = () => {

    if (!this.toolbar.visible) {
      return;
    }

    this.triggerSelection();
  };

  get htmlEl() {
    return this.el.nativeElement;
  }

  get iFrameDoc() {
    return (document.querySelector('#fb-pb-iframe') as HTMLIFrameElement).contentDocument as Document;
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

    this.iframe = (document.querySelector('#fb-pb-iframe') as HTMLIFrameElement).contentWindow as Window;

    this.iFrameDoc
      .addEventListener(
        'selectionchange',
        this.selectionChange
      );

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
      this.options.textDecorations.forEach((el) => {
        const toolbarEl = this.toolbar.elements[el];

        domListener(
          this.renderer,
          toolbarEl,
          'click'
        )
          .pipe(
            untilDestroyed(this)
          )
          .subscribe(() => {
            const selection = this.iframe.getSelection()?.toString() as string;
            const value = selection || this.lastTarget.innerHTML;

            if (toolbarEl.classList.contains('pb-t-active')) {
              this.lastTarget.innerHTML = this.lastTarget.innerHTML
                .replace(`<${el}>${value}</${el}>`, value)
            } else {
              this.lastTarget.innerHTML = this.lastTarget.innerHTML
                .replace(value, `<${el}>${value}</${el}>`)
            }

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
          'click'
        )
          .pipe(
            untilDestroyed(this)
          )
          .subscribe(() => {
            if (toolbarEl.classList.contains('pb-t-active')) {
              this.lastTarget.removeAttribute('style');
              toolbarEl.classList.remove('pb-t-active');
            } else {
              this.lastTarget.setAttribute('style', `text-align:${el}`);
              toolbarEl.classList.add('pb-t-active');
            }

            this.options.textAligns?.forEach(el => {
              if (this.toolbar.elements[el] !== toolbarEl) {
                this.toolbar.elements[el].classList.remove('pb-t-active');
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

    this.iFrameDoc.removeEventListener('selectionchange', this.selectionChange)
  }

  triggerSelection() {
    const selection = this.iframe.getSelection()?.toString();

    let decoration: string;

    if (selection) {

    }

    /**
     * If the content of element is same as the content of the first child
     * of the element we know that the entire element is decorated
     */
    else if (this.lastTarget?.children[0] && (this.lastTarget?.children[0] as HTMLElement).innerText === this.lastTarget?.innerText) {
      decoration = this.lastTarget.children[0].tagName.toLowerCase();
    }

    this.options.textDecorations?.forEach(dec => {
      if (decoration === dec) {
        this.toolbar.elements[dec].classList.add('pb-t-active');
      } else if (this.toolbar.elements[dec].classList.contains('pb-t-active')) {
        this.toolbar.elements[dec].classList.remove('pb-t-active');
      }
    })
  }

  update() {
    this.options.data[this.options.property] = this.htmlEl.innerHTML;
  }
}
