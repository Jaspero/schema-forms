import {AfterViewInit, Directive, ElementRef, Input, OnDestroy, Optional, Renderer2} from '@angular/core';
import {Subscription} from 'rxjs';
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
  options: Options;
  toolbar: Toolbar;
  tagChange: Subscription

  get htmlEl() {
    return this.el.nativeElement;
  }

  ngAfterViewInit() {
    this.options = {
      ...this.defaultOptions,
      ...this.entryOptions
    };

    this.toolbar = this.toolbarService.createToolbar(this.options.elementOptions);

    this.tagChange = this.toolbar.tagChanged$
      .subscribe(value => {
        if (this.lastTarget) {

          const currentTag = this.lastTarget.tagName.toLowerCase();

          this.lastTarget.outerHTML = this.lastTarget.outerHTML
            .replace(new RegExp(`\<${currentTag}`), `<${value}`)
            .replace(new RegExp(`${currentTag}/>`), `${value}/>`);

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
      this.tagChange.unsubscribe();
    }
  }
}
