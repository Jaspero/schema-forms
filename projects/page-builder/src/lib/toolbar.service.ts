import {Injectable} from '@angular/core';
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
  };
}

@Injectable()
export class ToolbarService {
  constructor() {
    this.uniqueId = uniqueId();
  }

  uniqueId: UniqueId;
  toolbars: {[key: string]: Toolbar} = {};
  toolbarProps = {height: 40};

  get parentEl() {
    return document.body;
  }

  get iframeEl() {
    return document.getElementById('fb-pb-iframe') as HTMLIFrameElement;
  }

  createToolbar(
    elementOptions?: string[],
    textDecorations?: string[],
    textAligns?: string[]
  ): Toolbar {
    const toolbar = document.createElement('div');
    const id = this.uniqueId.next();
    const elements: any = {};

    toolbar.classList.add('pb-t');
    toolbar.style.height = `${this.toolbarProps.height}px`;

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
        const el = document.createElement('button');
        el.classList.add('pb-t-button');

        const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        svgEl.setAttribute('viewBox', '0 0 24 24');
        svgEl.setAttribute('fill', '#000');
        svgEl.setAttribute('width', '24px');
        svgEl.setAttribute('height', '24px');

        svgEl.innerHTML = textAlignsMap[align];
        svgEl.style.pointerEvents = 'none';

        el.appendChild(svgEl);

        wrapperEl.appendChild(el);

        elements[align] = el;
      });

      toolbar.appendChild(wrapperEl);
    }

    this.toolbars[id] = {
      id,
      elements,
      el: toolbar,
      visible: false,
    };

    return this.toolbars[id];
  }

  clearToolbar(id: number) {

    const toolbar = this.toolbars[id];

    if (toolbar.visible) {
      this.hideToolbar(id);
    }

    delete this.toolbars[id];
  }

  showToolbar(top: number, left: number, id: number) {

    const toolbar = this.toolbars[id];

    if (toolbar.visible) {
      return;
    }

    /**
     * Clear any other open toolbars
     */
    for (const key in this.toolbars) {
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
}
