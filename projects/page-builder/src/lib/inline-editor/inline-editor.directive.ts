import {AfterViewInit, Directive, ElementRef, Input, OnDestroy, Optional, Renderer2} from '@angular/core';
import {Toolbar, ToolbarService} from '../toolbar.service';

interface Options {
  property: string;
  data: any;
  elementOptions?: string[];
}

@Directive({selector: '[fbPbInlineEditor]'})
export class InlineEditorDirective implements AfterViewInit, OnDestroy {
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    @Optional()
    private toolbarService: ToolbarService
  ) { }

  @Input('fbPbInlineEditor')
  entryOptions: Options;

  defaultOptions = {
    elementOptions: ['H1', 'H2', 'H3', 'H4', 'H5', 'P']
  };
  lastTarget: HTMLElement | null;
  iframe: Window;
  options: Options;
  toolbar: Toolbar;

  textDecorations = [
    {key: 'bold', el: 'b'},
    {key: 'italic', el: 'i'},
    {key: 'underline', el: 'u'}
  ];

  get htmlEl() {
    return this.el.nativeElement;
  }

  ngAfterViewInit() {
    this.options = {
      ...this.defaultOptions,
      ...this.entryOptions
    };

    this.toolbar = this.toolbarService.createToolbar(this.options.elementOptions);
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
             * TODO:
             * Because changing outerHTML detaches the element
             * we reset lastTarget to null so that we don't
             * get an error when trying to update the tagName
             *
             * This approach isn't ideal and we could probably
             * replace the element in a different way.
             */
            this.lastTarget = null;
          }
        }
      )
    }

    this.textDecorations.forEach(({key, el}) => {
      const toolbarEl = this.toolbar.elements[`${key}Btn`];

      if (toolbarEl) {
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
      }
    })

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
      (e) => {
        if (this.toolbar.visible) {
          return;
        }

        const {target} = e;
        const type = target.tagName;

        this.lastTarget = target;

        if (this.options.elementOptions?.includes(type)) {
          // @ts-ignore
          this.toolbar.elements.typeSelect.value = type;
        }

        const {top, left} = this.htmlEl.getBoundingClientRect();

        this.toolbarService.showToolbar(top, left, this.toolbar.id);
      }
    )
  }

  ngOnDestroy() {
    if (this.toolbar) {
      this.toolbarService.clearToolbar(this.toolbar.id);
    }
  }
}
