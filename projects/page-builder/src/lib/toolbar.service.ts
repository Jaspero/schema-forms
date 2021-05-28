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
  };
}

@Injectable()
export class ToolbarService {
  constructor() {
    this.uniqueId = uniqueId();
  }

  uniqueId: UniqueId;

  _toolbars: {[key: string]: Toolbar} = {};
  toolbarProps = {
    width: 200,
    height: 50
  }

  get parentEl() {
    return document.body;
  }

  get iframeEl() {
    return document.getElementById('fb-pb-iframe') as HTMLIFrameElement;
  }

  createToolbar(
    elementOptions?: string[],
    textDecorations?: string[]
  ): Toolbar {
    const toolbar = document.createElement('div');
    const id = this.uniqueId.next();
    const elements: any = {};

    toolbar.style.position = 'absolute';
    toolbar.style.width = `${this.toolbarProps.width}px`;
    toolbar.style.height = `${this.toolbarProps.height}px`;
    toolbar.style.background = '#fff';
    toolbar.style.border = '1px solid #333';
    toolbar.style.zIndex = '10000';

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

      textDecorations.forEach(decoration => {
        const el = document.createElement('button');

        el.textContent = decoration.toUpperCase();
        el.style.border = 'none';
        el.style.height = '100%';
        el.style.width = '50px';

        for (const key in textDecorationMap[decoration].style) {
          if (el.style.hasOwnProperty(key)) {
            el.style[key] = textDecorationMap[decoration].style[key];
          }
        }

        el.addEventListener('mouseenter', () => el.style.backgroundColor = '');
        el.addEventListener('mouseleave', () => el.style.backgroundColor = 'white');

        toolbar.appendChild(el);

        elements[decoration] = el;
      })
    }

    this._toolbars[id] = {
      id,
      elements,
      el: toolbar,
      visible: false,
    };

    return this._toolbars[id];
  }

  clearToolbar(id: number) {

    const toolbar = this._toolbars[id];

    if (toolbar.visible) {
      this.hideToolbar(id);
    }

    delete this._toolbars[id];
  }

  showToolbar(top: number, left: number, id: number) {

    const toolbar = this._toolbars[id];

    if (toolbar.visible) {
      return;
    }

    /**
     * Clear any other open toolbars
     */
    for (const key in this._toolbars) {
      const tb = this._toolbars[key];

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

    const toolbar = this._toolbars[id];

    if (toolbar.visible) {
      this.parentEl.removeChild(toolbar.el);
      toolbar.visible = false;
    }
  }
}
