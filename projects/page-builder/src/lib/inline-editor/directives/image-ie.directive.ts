import {AfterViewInit, Directive, ElementRef, Input, Renderer2, Optional} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {filter} from 'rxjs/operators';
import {domListener} from '../../utils/dom-listener';
import {ImageDialogComponent} from '../components/image-dialog/image-dialog.component';
import {ToolbarService} from '../../toolbar.service';

interface Options {
  property: string;
  data: any;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  customElements?: string[];
}

@UntilDestroy()
@Directive({selector: '[fbPbImageIE]'})
export class ImageIEDirective implements AfterViewInit {
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private dialog: MatDialog,
    @Optional()
    private toolbarService: ToolbarService
  ) { }

  @Input('fbPbImageIE')
  entryOptions: Partial<Options>;
  defaultOptions: Partial<Options> = {
    position: 'top-right'
  };

  options: Options;
  toolbar: HTMLDivElement;
  triggerEl: HTMLButtonElement;

  get htmlEl() {
    return this.el.nativeElement;
  }

  ngAfterViewInit() {
    if (!this.toolbarService) {
      return;
    }

    this.options = {
      ...this.defaultOptions,
      ...this.entryOptions
    } as Options;

    this.buildToolbar();

    this.renderer.setStyle(
      this.htmlEl,
      'position',
      'relative'
    );

    domListener(
      this.renderer,
      this.htmlEl,
      'mouseenter'
    )
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(() =>
        this.toolbar.style.opacity = '1'
      );

    domListener(
      this.renderer,
      this.htmlEl,
      'mouseleave'
    )
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(() =>
        this.toolbar.style.opacity = '0'
      );

    domListener(
      this.renderer,
      this.triggerEl,
      'click'
    )
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(() => {
        this.dialog.open(
          ImageDialogComponent,
          {
            width: '500px',
            data: this.options.data[this.options.property]
          }
        )
          .afterClosed()
          .pipe(
            filter(it => it)
          )
          .subscribe(({url}) => {
            this.options.data[this.options.property] = url;
            this.htmlEl.querySelector('img').src = url;
          })
      });
  }

  private buildToolbar() {
    this.toolbar = document.createElement('div');

    this.toolbar.style.position = 'absolute';
    this.toolbar.style.zIndex = '1000';
    this.toolbar.style.height = '40px';
    this.toolbar.style.padding = '5px';
    this.toolbar.style.margin = '5px';
    this.toolbar.style.translate = '.2s';
    this.toolbar.style.display = 'flex';
    this.toolbar.style.opacity = '0';
    this.toolbar.style.background = '#fff';
    this.toolbar.style.borderRadius = '4px';

    this.options.position.split('-')
      .forEach(it => {
        this.toolbar.style[it] = 0;
      });

    this.triggerEl = document.createElement('button');
    this.triggerEl.style.width = '40px';
    this.triggerEl.style.height = '40px';
    this.triggerEl.style.display = 'flex';
    this.triggerEl.style.justifyContent = 'center';
    this.triggerEl.style.alignItems = 'center';
    this.triggerEl.style.cursor = 'pointer';
    this.triggerEl.style.background = 'none';
    this.triggerEl.style.border = 'none';

    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    svgEl.setAttribute('viewBox', '0 0 24 24');
    svgEl.setAttribute('fill', '#000');
    svgEl.setAttribute('height', '24px');
    svgEl.setAttribute('width', '24px');

    svgEl.innerHTML = `<path d="M0 0h24v24H0V0z" fill="none"/><path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"/>`;
    svgEl.style.pointerEvents = 'none';

    this.triggerEl.appendChild(svgEl);

    this.toolbar.appendChild(this.triggerEl);

    if (this.options.customElements) {
      this.options.customElements.forEach(el => {
        this.toolbar.innerHTML += el;
      })
    }

    this.htmlEl.appendChild(this.toolbar);
  }
}
