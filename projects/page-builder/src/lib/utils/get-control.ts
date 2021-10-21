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

  const parser = window.jpFb.parsers[key];
  let pointers;
  if (parser) {
    pointers = parser.pointers;
  } else {
    pointers = window.jpFb.parsers.main.pointers;
  }
  console.log('id', id);
  console.log('index', index);
  console.log('pointer', pointer);
  console.log('array', array);
  console.log('arrayIndex', arrayIndex);
  console.log('pointers', pointers);
  console.log('----------');

  if (array) {
    pointers = pointers[array].arrayPointers[arrayIndex];
  }

  return pointers[pointer].control;
}
