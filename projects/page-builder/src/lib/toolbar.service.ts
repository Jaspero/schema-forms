import {Injectable} from '@angular/core';
import {UniqueId, uniqueId} from './utils/unique-id';

export interface Toolbar {
  id: number;
  el: HTMLDivElement;
  visible: boolean;
  elements: {
    typeSelect?: HTMLSelectElement;
    boldBtn?: HTMLButtonElement;
    italicBtn?: HTMLButtonElement;
    underlineBtn?: HTMLButtonElement;
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

    toolbar.style.position = 'absolute';
    toolbar.style.width = `${this.toolbarProps.width}px`;
    toolbar.style.height = `${this.toolbarProps.height}px`;
    toolbar.style.background = '#fff';
    toolbar.style.border = '1px solid #333';
    toolbar.style.zIndex = '10000';

    let typeSelectEl: HTMLSelectElement | null = null;

    if (elementOptions?.length) {
      typeSelectEl = document.createElement('select');

      for (const option of elementOptions) {

        const optionEl = document.createElement('option');

        optionEl.value = option;
        optionEl.innerText = option;

        typeSelectEl.appendChild(optionEl);
      }

      toolbar.appendChild(typeSelectEl);
    }

    const boldBtn = document.createElement('button')
    boldBtn.classList.add('button-pero');
    boldBtn.textContent= 'B';
    boldBtn.style.outline = 'none';
    boldBtn.style.border = 'none';
    boldBtn.style.height = '100%';
    boldBtn.style.width = '50px';
    boldBtn.style.fontSize = '30px';
    boldBtn.style.fontWeight = '700';
    boldBtn.addEventListener('mouseenter', () => {
      boldBtn.style.backgroundColor = '';
    } );
    boldBtn.addEventListener('mouseleave', () => {
      boldBtn.style.backgroundColor = 'white';
    } );

    toolbar.appendChild(boldBtn);

    const italicBtn = document.createElement('button')

    italicBtn.classList.add('button-italic');
    italicBtn.textContent= 'I';
    italicBtn.style.outline = 'none';
    italicBtn.style.border = 'none';
    italicBtn.style.height = '100%';
    italicBtn.style.width = '50px';
    italicBtn.style.fontStyle = 'italic';
    italicBtn.style.fontSize = '30px';
    italicBtn.style.fontWeight = '700';
    italicBtn.addEventListener('mouseenter', () => {
      italicBtn.style.backgroundColor = '';
    } );
    italicBtn.addEventListener('mouseleave', () => {
      italicBtn.style.backgroundColor = 'white';
    } );

    toolbar.appendChild(italicBtn);

    this._toolbars[id] = {
      el: toolbar,
      id,
      visible: false,
      elements: {
        ...typeSelectEl && {typeSelect: typeSelectEl},
        boldBtn,
        italicBtn
      }
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
