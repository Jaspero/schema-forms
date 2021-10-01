import {GlobalState} from '@jaspero/form-builder';

declare const window: Window & {jpFb: GlobalState};

/**
 * TODO:
 * Array updating isn't recursive at the moment
 * and only supports one level of nesting
 */
export function getControl(
  id: string,
  index: number,
  pointer: string,
  array?: string,
  arrayIndex?: number
) {

  const key = [id, 'blocks', index].join('-');

  let {pointers} = window.jpFb.parsers[key];

  if (array) {
    pointers = pointers[array].arrayPointers[arrayIndex];
  }

  return pointers[pointer].control
}
