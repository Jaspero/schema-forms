import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
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
  constructor() {
    this.uniqueId = uniqueId();
  }

  uniqueId: UniqueId;
  private _scroll$: Observable<number>;

  get parentEl() {
    return document.body;
  }

  get iframeEl() {
    return document.getElementById('fb-pb-iframe') as HTMLIFrameElement;
  }
}
