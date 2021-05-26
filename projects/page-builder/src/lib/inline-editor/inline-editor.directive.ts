import {AfterViewInit, Directive, ElementRef, Input, Renderer2} from '@angular/core';

interface Options {
  property: string;
  data: any;
  elementOptions?: string[];
}

@Directive({selector: '[fbPbInlineEditor]'})
export class InlineEditorDirective implements AfterViewInit {
  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) { }

  @Input('fbPbInlineEditor')
  entryOptions: Options;

  toolbarEl: HTMLDivElement;
  typeSelectEl: HTMLSelectElement;
  toolbarRendered = false;

  defaultOptions = {
    elementOptions: ['H1', 'H2', 'H3', 'H4', 'H5', 'P']
  }

  options: Options;

  get htmlEl() {
    return this.el.nativeElement;
  }

  ngAfterViewInit() {

    this.options = {
      ...this.defaultOptions,
      ...this.entryOptions
    };

    this.buildToolbar();

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
      (document.querySelector('#fb-pb-iframe') as HTMLIFrameElement).contentDocument,
      'click',
      (e) => {

        const target = e.path[0];

        if (this.htmlEl.contains(target)) {
          if (!this.toolbarRendered) {
            this.htmlEl.appendChild(this.toolbarEl);
            this.toolbarRendered = true;
          }
        } else if (this.toolbarRendered) {
          this.toolbarRendered = false;
          this.htmlEl.removeChild(this.toolbarEl);
        }
      }
    )
  }

  private buildToolbar() {
    this.toolbarEl = document.createElement('div');

    this.toolbarEl.style.position = 'absolute';
    this.toolbarEl.style.width = '200px';
    this.toolbarEl.style.height = '50px';
    this.toolbarEl.style.bottom = '0';
    this.toolbarEl.style.left = '0';
    this.toolbarEl.style.background = '#fff';
    this.toolbarEl.style.border = '1px solid #333';

    if (this.options.elementOptions?.length) {
      this.typeSelectEl = document.createElement('select');

      for (const option of this.options.elementOptions) {

        const optionEl = document.createElement('option');

        optionEl.value = option;
        optionEl.innerText = option;

        this.typeSelectEl.appendChild(optionEl);
      }

      this.toolbarEl.appendChild(this.typeSelectEl);
    }

  }
}
