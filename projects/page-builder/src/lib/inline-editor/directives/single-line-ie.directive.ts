import {AfterViewInit, Directive, ElementRef, Input, OnDestroy, Optional, Renderer2} from '@angular/core';
import {Toolbar, ToolbarService} from '../../toolbar.service';

interface Options {
  property: string;
  data: any;
  elementOptions?: string[];
  textDecorations?: string[];
  multiline?: boolean;
}

@Directive({selector: '[fbPbSingleLineIE]'})
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
    textDecorations: ['b', 'i', 'u']
  };
  lastTarget: HTMLElement | null;
  iframe: Window;
  options: Options;
  toolbar: Toolbar;
  decorations = [];

  get htmlEl() {
    return this.el.nativeElement;
  }

  ngAfterViewInit() {
    this.options = {
      ...this.defaultOptions,
      ...this.entryOptions
    };

    this.toolbar = this.toolbarService.createToolbar(
      this.options.elementOptions,
      this.options.textDecorations
    );
    this.iframe = (document.querySelector('#fb-pb-iframe') as HTMLIFrameElement).contentWindow as Window;

    if (this.toolbar.elements.typeSelect) {
      this.toolbar.elements.typeSelect.addEventListener(
        'change',
        () => {
          if (this.lastTarget) {

            const currentTag = this.lastTarget.tagName.toLowerCase();
            // @ts-ignore
            const newTag = this.toolbar.elements.typeSelect.tagName.toLowerCase();

            this.lastTarget.outerHTML = this.lastTarget.outerHTML
              .replace(new RegExp(`\<${currentTag}`), `<${newTag}`)
              .replace(new RegExp(`${currentTag}/>`), `${newTag}/>`);

            /**
             * Updating outerHTML detaches the element and
             * creates a new one in its place
             */
            setTimeout(() => {
              this.lastTarget = this.htmlEl.children[0];
            })
          }
        }
      )
    }

    if (this.options.textDecorations) {


      this.options.textDecorations.forEach((el) => {
        const toolbarEl = this.toolbar.elements[el];

        this.renderer.listen(
          toolbarEl,
          'click',
          () => {

            if (this.lastTarget) {
              const selection = this.iframe.getSelection()?.toString() as string;

              console.log(selection, this.lastTarget);

              if (toolbarEl.classList.contains('active')) {

              } else {
                if (selection) {
                  this.lastTarget.innerHTML = this.lastTarget.innerHTML
                    .replace(selection, `<${el}>${selection}</${el}>`)
                } else {
                }
              }

            }
          }
        )
      })
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

    this.renderer.listen(
      this.htmlEl,
      'input',
      () =>
        this.options.data[this.options.property] = this.htmlEl.innerHTML
    );

    this.renderer.listen(
      this.htmlEl,
      'click',
      () => {
        if (this.toolbar.visible) {
          return;
        }

        const {top, left} = this.htmlEl.getBoundingClientRect();

        this.toolbarService.showToolbar(top, left, this.toolbar.id);
      }
    );

    this.lastTarget = this.htmlEl.children[0] as HTMLElement;

    if (this.toolbar.elements.typeSelect) {
      this.toolbar.elements.typeSelect.value = this.lastTarget.tagName;
    }
  }

  ngOnDestroy() {
    if (this.toolbar) {
      this.toolbarService.clearToolbar(this.toolbar.id);
    }
  }
}
