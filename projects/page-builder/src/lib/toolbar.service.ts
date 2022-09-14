import {Injectable} from '@angular/core';
import {fromEvent, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {UniqueId, uniqueId} from './utils/unique-id';

export interface Toolbar {
  id: number;
  el: HTMLDivElement;
  visible: boolean;
  elements: {
    typeSelect?: HTMLSelectElement;
    b?: HTMLButtonElement;
    i?: HTMLButtonElement;
    u?: HTMLButtonElement;
    left?: HTMLButtonElement;
    center?: HTMLButtonElement;
    justify?: HTMLButtonElement;
    right?: HTMLButtonElement;
    remove?: HTMLButtonElement;
    link?: HTMLButtonElement;
    linkDialog: HTMLDivElement;
    linkSubmit?: HTMLButtonElement;
    linkInput?: HTMLInputElement;
    color?: HTMLButtonElement;
    colorPicker?: HTMLInputElement;
  };
}

@Injectable()
export class ToolbarService {
  uniqueId: UniqueId;
  toolbars: {[key: number]: Toolbar} = {};
  toolbarProps = {height: 40};
  private toolbarListener: any;
  private _scroll$: Observable<number>;

  constructor() {
    this.uniqueId = uniqueId();
  }

  get parentEl() {
    return document.body;
  }

  get iframeEl() {
    return document.getElementById('fb-pb-iframe') as HTMLIFrameElement;
  }

  createToolbar(
    elementOptions?: string[],
    textDecorations?: string[],
    textAligns?: string[],
    remove?: boolean,
    colorPicker?: boolean,
    link?: boolean
  ): Toolbar {
    const toolbar = document.createElement('div');
    const id = this.uniqueId.next();
    const elements: any = {};
    const iconButton = (icon: string, color = '#000') => {
      const el = document.createElement('button');
      el.classList.add('pb-t-button');

      const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

      svgEl.setAttribute('viewBox', '0 0 24 24');
      svgEl.setAttribute('fill', color);
      svgEl.setAttribute('width', '24px');
      svgEl.setAttribute('height', '24px');

      svgEl.innerHTML = icon;
      svgEl.style.pointerEvents = 'none';

      el.appendChild(svgEl);

      return el;
    };

    toolbar.classList.add('pb-t');
    toolbar.style.height = `${this.toolbarProps.height}px`;
    toolbar.style.zIndex = '99999999';

    if (elementOptions?.length) {
      const typeSelectEl = document.createElement('select');

      for (const option of elementOptions) {

        const optionEl = document.createElement('option');

        optionEl.value = option;
        optionEl.innerText = option;

        typeSelectEl.appendChild(optionEl);
      }

      toolbar.appendChild(typeSelectEl);

      elements.typeSelect = typeSelectEl;
    }

    if (textDecorations?.length) {
      const textDecorationMap = {
        i: {
          style: {
            fontStyle: 'italic'
          }
        },
        b: {
          style: {
            fontWeight: 'bold'
          }
        },
        u: {
          style: {
            textDecoration: 'underline'
          }
        }
      };

      const wrapperEl = document.createElement('div');

      wrapperEl.classList.add('pb-t-w');

      textDecorations.forEach(decoration => {
        const el = document.createElement('button');

        el.classList.add('pb-t-button');

        el.textContent = decoration.toUpperCase();

        for (const key in textDecorationMap[decoration].style) {
          if (el.style.hasOwnProperty(key)) {
            el.style[key] = textDecorationMap[decoration].style[key];
            el.setAttribute('title', `Toggle ${el.style[key]}`);
          }
        }

        wrapperEl.appendChild(el);

        elements[decoration] = el;
      });

      toolbar.appendChild(wrapperEl);
    }

    if (textAligns?.length) {
      const textAlignsMap = {
        left: `<path d="M0 0h24v24H0V0z" fill="none"/><path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/>`,
        right: `<path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/>`,
        center: `<path d="M0 0h24v24H0V0z" fill="none"/><path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/>`,
        justify: `<path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z"/>`
      };

      const wrapperEl = document.createElement('div');

      wrapperEl.classList.add('pb-t-w');

      textAligns.forEach(align => {
        const el = iconButton(textAlignsMap[align]);
        el.setAttribute('title', `Align ${align}`);
        wrapperEl.appendChild(el);
        elements[align] = el;
      });

      toolbar.appendChild(wrapperEl);
    }

    if (link) {
      const wrapperEl = document.createElement('div');

      wrapperEl.classList.add('pb-t-w');
      wrapperEl.setAttribute('title', 'Toggle link');

      const el = iconButton(
        `<path d="M11 17H7q-2.075 0-3.537-1.463Q2 14.075 2 12t1.463-3.538Q4.925 7 7 7h4v2H7q-1.25 0-2.125.875T4 12q0 1.25.875 2.125T7 15h4Zm-3-4v-2h8v2Zm5 4v-2h4q1.25 0 2.125-.875T20 12q0-1.25-.875-2.125T17 9h-4V7h4q2.075 0 3.538 1.462Q22 9.925 22 12q0 2.075-1.462 3.537Q19.075 17 17 17Z"/>`
      );

      const dialogEl = document.createElement('div');
      dialogEl.classList.add('pb-t-dialog');

      const dialgoOverlayEl = document.createElement('div');
      dialgoOverlayEl.classList.add('pb-t-dialog-overlay');

      dialgoOverlayEl.addEventListener('click', () =>
        dialogEl.classList.remove('active'),
        {passive: true}
      );

      dialogEl.appendChild(dialgoOverlayEl);

      const dialogInnerEl = document.createElement('div');
      dialogInnerEl.classList.add('pb-t-dialog-inner');

      const linkInputEl = document.createElement('input');
      linkInputEl.placeholder = 'URL';
      linkInputEl.type = 'url';

      dialogInnerEl.appendChild(linkInputEl);

      const dialogSubmitButtonEl = document.createElement('button');
      dialogSubmitButtonEl.innerText = 'Submit';

      dialogInnerEl.appendChild(dialogSubmitButtonEl);

      dialogEl.appendChild(dialogInnerEl);

      wrapperEl.appendChild(el);
      toolbar.appendChild(wrapperEl);
      toolbar.appendChild(dialogEl);

      elements.link = el;
      elements.linkDialog = dialogEl;
      elements.linkSubmit = dialogSubmitButtonEl;
      elements.linkInput = linkInputEl;
    }

    if (colorPicker) {
      const wrapperEl = document.createElement('div');

      wrapperEl.classList.add('pb-t-w');
      wrapperEl.setAttribute('title', 'Change text color');

      const el = iconButton(
        `<g><rect fill="none" height="24" width="24"/></g><g><path d="M2,20h20v4H2V20z M5.49,17h2.42l1.27-3.58h5.65L16.09,17h2.42L13.25,3h-2.5L5.49,17z M9.91,11.39l2.03-5.79h0.12l2.03,5.79 H9.91z"/></g>`
      );
      const pickerEl = document.createElement('input');

      wrapperEl.style.position = 'relative';

      pickerEl.type = 'color';
      pickerEl.style.position = 'absolute';
      pickerEl.style.top = '0';
      pickerEl.style.visibility = 'hidden';

      wrapperEl.appendChild(el);
      wrapperEl.appendChild(pickerEl);
      toolbar.appendChild(wrapperEl);

      elements.color = el;
      elements.colorPicker = pickerEl;
    }

    if (remove) {

      const wrapperEl = document.createElement('div');

      wrapperEl.classList.add('pb-t-w');
      wrapperEl.setAttribute('title', 'Remove element');

      const el = iconButton(
        '<path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/>',
        '#f44336'
      );

      wrapperEl.appendChild(el);
      toolbar.appendChild(wrapperEl);

      elements.remove = el;
    }

    this.toolbars[id] = {
      id,
      elements,
      el: toolbar,
      visible: false
    };

    if (!this.toolbarListener) {
      document.addEventListener('click', this.toggleToolbars);
      this.toolbarListener = true;
    }

    return this.toolbars[id];
  }

  clearToolbar(id: number) {
    const toolbar = this.toolbars[id];

    if (!toolbar) {
      return;
    }

    if (toolbar.visible) {
      this.hideToolbar(id);
    }

    delete this.toolbars[id];

    if (!Object.keys(this.toolbars).length && this.toolbarListener) {
      removeEventListener('click', this.toggleToolbars);

      /**
       * Clear state
       */
      this._scroll$ = null;
      this.toolbarListener = null;
    }

    toolbar.el.remove();
  }

  showToolbar(top: number, left: number, id: number) {
    const toolbar = this.toolbars[id];

    if (toolbar.visible) {
      return;
    }

    /**
     * Clear any other open toolbars
     */
    for (const key of Object.keys(this.toolbars)) {
      const tb = this.toolbars[key];

      if (tb.visible) {
        this.hideToolbar(tb.id);
      }
    }

    const {top: tTop, left: tLeft} = this.iframeEl.getBoundingClientRect();

    toolbar.visible = true;

    toolbar.el.style.top = `${tTop + top - this.toolbarProps.height}px`;
    toolbar.el.style.left = `${tLeft + left}px`;

    this.parentEl.appendChild(
      toolbar.el
    );
  }

  hideToolbar(id: number) {
    const toolbar = this.toolbars[id];

    if (toolbar.visible) {
      this.parentEl.removeChild(toolbar.el);
      toolbar.visible = false;
    }
  }

  scroll$() {
    if (this._scroll$) {
      return this._scroll$;
    }

    this._scroll$ = fromEvent(
      this.iframeEl.contentWindow,
      'scroll',
      {passive: true}
    )
      .pipe(
        map((e: any) => (e.path[1] as Window).scrollY)
      );

    return this._scroll$;
  }

  private toggleToolbars = (e) => {
    for (const key of Object.keys(this.toolbars)) {
      if (this.toolbars[key].el.contains(e.target)) {
        return;
      }

      this.hideToolbar(key as any);
    }
  };
}
