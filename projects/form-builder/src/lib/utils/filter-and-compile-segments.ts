import {Injector} from '@angular/core';
import {Definitions} from '../interfaces/definitions.interface';
import {Segment} from '../interfaces/segment.interface';
import {compileSegment} from './compile-segment';
import {Parser} from './parser';

export function filterAndCompileSegments(
  role = '',
  segments: Segment[],
  parser: Parser,
  definitions: Definitions,
  injector: Injector,
  value: any
) {
  return segments.reduce((acc, cur) => {
    if (!cur.authorization || cur.authorization.includes(role)) {

      const compiled = compileSegment(
        cur,
        parser,
        definitions,
        injector,
        value
      );

      if (compiled) {
        acc.push(
          // @ts-ignore
          compiled
        );
      }
    }

    return acc;
  }, []);
}
