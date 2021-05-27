import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {UniqueId, uniqueId} from './utils/unique-id';

export interface Toolbar {
  id: number;
  el: HTMLDivElement;
  tagChanged$: Subject<string>;
  visible: boolean;
  elements: {
    typeSelect?: HTMLSelectElement;
  }
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

  createToolbar(elementOptions?: string[]): Toolbar {
    const toolbar = document.createElement('div');
    const id = this.uniqueId.next();
    const tagChanged$ = new Subject<string>();

    toolbar.style.position = 'absolute';
    toolbar.style.width = `${this.toolbarProps.width}px`;
    toolbar.style.height = `${this.toolbarProps.height}px`;
    toolbar.style.background = '#fff';
    toolbar.style.border = '1px solid #333';
    toolbar.style.zIndex = '10000';

    let typeSelectEl: HTMLSelectElement | null = null;

    if (elementOptions?.length) {
      typeSelectEl = document.createElement('select');

      typeSelectEl.addEventListener(
        'change',
        () =>
          tagChanged$.next((typeSelectEl as HTMLSelectElement).value.toLowerCase())
      )

      for (const option of elementOptions) {

        const optionEl = document.createElement('option');

        optionEl.value = option;
        optionEl.innerText = option;

        typeSelectEl.appendChild(optionEl);
      }

      toolbar.appendChild(typeSelectEl);
    }

    this._toolbars[id] = {
      el: toolbar,
      id,
      visible: false,
      tagChanged$,
      elements: {
        ...typeSelectEl && {typeSelect: typeSelectEl}
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
