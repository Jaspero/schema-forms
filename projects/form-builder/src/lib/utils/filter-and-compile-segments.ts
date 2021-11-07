import {Injector} from '@angular/core';
import {Definitions} from '../interfaces/definitions.interface';
import {Segment} from '../interfaces/segment.interface';
import {compileSegment} from './compile-segment';
import {Parser} from './parser';

export function filterAndCompileSegments(
  segments: Segment[],
  parser: Parser,
  definitions: Definitions,
  injector: Injector,
  value: any,
  parent?: string,
  index?: number
) {
  return segments.reduce((acc, cur) => {
    if (!cur.authorization || cur.authorization.includes(parser.role)) {

      const compiled = compileSegment(
        cur,
        parser,
        definitions,
        injector,
        value,
        parent,
        index
      );

      /**
       * TODO:
       * Exclude any segments that end up not having
       * a single field or component
       */
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
