import {AfterViewInit, Directive, ElementRef, Input, Renderer2, Optional} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Parser} from '@jaspero/form-builder';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {merge} from 'rxjs';
import {filter, switchMap, tap} from 'rxjs/operators';
import {PageBuilderCtxService} from '../../page-builder-ctx.service';
import {domListener} from '../../utils/dom-listener';
import {getControl} from '../../utils/get-control';
import {ImageDialogComponent} from '../components/image-dialog/image-dialog.component';
import {ToolbarService} from '../../toolbar.service';

interface Options {
  formId?: string;
  array?: string;
  index?: number;
  pointer: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  customElements?: string[];
  remove?: boolean;
}

@UntilDestroy()
@Directive({selector: '[fbPbImageIE]'})
export class ImageIEDirective implements AfterViewInit {
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private dialog: MatDialog,
    @Optional()
    private toolbarService: ToolbarService,
    @Optional()
    private ctx: PageBuilderCtxService
  ) { }

  @Input('fbPbImageIE')
  entryOptions: Partial<Options>;
  defaultOptions: Partial<Options> = {position: 'top-right', remove: true};
  id: string;
  pointer: string;
  options: Options;
  toolbar: HTMLDivElement;
  triggerEl: HTMLButtonElement;
  removeEl: HTMLButtonElement;

  isHoovered: boolean;
  isActive: boolean;

  get htmlEl() {
    return this.el.nativeElement;
  }

  get host() {
    return this.htmlEl.getRootNode().host;
  }

  get index() {
    return [...this.host.parentElement.children].indexOf(this.host);
  }

  get control() {
    return getControl(
      this.id,
      this.index,
      this.pointer,
      this.options.array,
      this.options.index
    )
  }

  ngAfterViewInit() {
    if (!this.toolbarService) {
      return;
    }

    this.options = {
      ...this.defaultOptions,
      ...this.entryOptions
    } as Options;

    this.id = this.options.formId || 'main';
    this.pointer = Parser.standardizeKeyWithSlash(this.options.pointer);

    if (this.options.array) {
      this.pointer = this.options.array + this.pointer;
    }

    this.buildToolbar();

    this.renderer.setStyle(
      this.htmlEl,
      'position',
      'relative'
    );

    merge(
      domListener(
        this.renderer,
        this.htmlEl,
        'mouseenter'
      )
        .pipe(
          tap(() => {
            if (this.isActive) {
              this.toolbar.style.opacity = '1';
            }
            this.isHoovered = true;
          })
        ),
      domListener(
        this.renderer,
        this.htmlEl,
        'mouseleave'
      )
        .pipe(
          tap(() => {
            if (this.isActive) {
              this.toolbar.style.opacity = '0';
            }
            this.isHoovered = false;
          })
        )
    )
      .pipe(
        untilDestroyed(this)
      )
      .subscribe();

    this.ctx.selectedBlock$
      .pipe(
        filter(index => {
          this.isActive = this.index === index;

          if (!this.isActive) {
            this.toolbar.style.opacity = '0';
          } else if (this.isHoovered) {
            this.toolbar.style.opacity = '1';
          }

          return this.isActive;
        }),
        switchMap(() =>
          merge(
            domListener(
              this.renderer,
              this.triggerEl,
              'click'
            )
              .pipe(
                tap(() => {
                  this.dialog.open(
                    ImageDialogComponent,
                    {
                      width: '500px',
                      data: this.control.value
                    }
                  )
                    .afterClosed()
                    .pipe(
                      filter(it => it)
                    )
                    .subscribe(({url}) => {
                      this.update(url);
                      this.htmlEl.querySelector('img').src = url;
                    })
                })
              ),
            domListener(
              this.renderer,
              this.removeEl,
              'click',
            )
              .pipe(
                tap(() => {
                  this.update('');
                  this.htmlEl.parentElement.removeChild(this.htmlEl);
                })
              )
          )
        ),
        untilDestroyed(this)
      )
      .subscribe()
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

    const drawButton = (icon: string, color = '#000') => {
      const buttonEl = document.createElement('button');
      const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

      buttonEl.style.width = '40px';
      buttonEl.style.height = '40px';
      buttonEl.style.display = 'flex';
      buttonEl.style.justifyContent = 'center';
      buttonEl.style.alignItems = 'center';
      buttonEl.style.cursor = 'pointer';
      buttonEl.style.background = 'none';
      buttonEl.style.border = 'none';

      svgEl.setAttribute('viewBox', '0 0 24 24');
      svgEl.setAttribute('fill', color);
      svgEl.setAttribute('height', '24px');
      svgEl.setAttribute('width', '24px');

      svgEl.innerHTML = icon;
      svgEl.style.pointerEvents = 'none';

      buttonEl.appendChild(svgEl);

      return buttonEl;
    }

    this.triggerEl = drawButton(
      `<path d="M0 0h24v24H0V0z" fill="none"/><path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"/>`
    );

    if (this.options.remove) {
      this.removeEl = drawButton(
        `<path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/>`,
        '#f44336'
      );

      this.toolbar.appendChild(this.removeEl);
    }

    this.toolbar.appendChild(this.triggerEl);

    if (this.options.customElements) {
      this.options.customElements.forEach(el => {
        this.toolbar.innerHTML += el;
      })
    }

    this.htmlEl.appendChild(this.toolbar);
  }

  update(value: string, onlySelf = false) {
    this.control.setValue(value, {onlySelf});
  }
}
