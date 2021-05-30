import {Renderer2} from '@angular/core';
import {fromEventPattern} from 'rxjs';

export function domListener(
  renderer: Renderer2,
  target: HTMLElement,
  event: string
) {

  let removeListener: () => void;

  const createListener = (
    handler: (e: Event) => boolean | void
  ) => {
    removeListener = renderer.listen(target, event, handler);
  };

  return fromEventPattern<Event>(createListener, () =>
    removeListener()
  );
}
