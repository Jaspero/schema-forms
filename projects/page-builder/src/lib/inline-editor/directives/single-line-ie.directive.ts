import {AfterViewInit, Directive, ElementRef, Input, OnDestroy, Optional, Renderer2} from '@angular/core';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {Toolbar, ToolbarService} from '../../toolbar.service';
import {domListener} from '../../utils/dom-listener';

interface Options {
  property: string;
  data: any;
  elementOptions?: string[];
  textDecorations?: string[];
  multiline?: boolean;
}

@UntilDestroy()
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
  decorations: string[] = [];
  selectionChange = () => {
    console.log(this.iframe.getSelection()?.toString());
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
      this.options.textDecorations
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
          })
        });
    }

    if (this.options.textDecorations) {

      this.collectDecorations(this.lastTarget.innerHTML);

      console.log(this.decorations);

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
            if (this.lastTarget) {
              const selection = this.iframe.getSelection()?.toString() as string;

              if (toolbarEl.classList.contains('active')) {

              } else {
                if (selection) {
                  this.lastTarget.innerHTML = this.lastTarget.innerHTML
                    .replace(selection, `<${el}>${selection}</${el}>`)
                } else {
                }
              }

            }
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
        this.options.data[this.options.property] = this.htmlEl.innerHTML
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

  collectDecorations(entry: string) {
    console.log(entry);
    const matcher = /(<b>|<i>|<u>|<\/b>|<\/i><\/u>)/g;
    const matches = [
      ...(entry.match(/(<b>)(.*?)(<\/b>)/g) || []),
      ...(entry.match(/(<i>)(.*?)(<\/i>)/g) || []),
      ...(entry.match(/(<u>)(.*?)(<\/u>)/g) || []),
    ];

    if (matches) {
      matches.forEach(match => {

        const value = match.slice(3, -4);

        if (matcher.test(value)) {
          this.decorations.push(
            value.replace(matcher, '')
          );

          this.collectDecorations(value);
        } else {
          this.decorations.push(value);
        }
      })
    }
  }
}
