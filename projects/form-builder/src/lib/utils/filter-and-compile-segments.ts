import {Injector} from '@angular/core';
import {Definitions} from '../interfaces/definitions.interface';
import {Segment} from '../interfaces/segment.interface';
import {compileSegment} from './compile-segment';
import {Parser, Pointer} from './parser';

export function filterAndCompileSegments(config: {
  segments: Segment[],
  parser: Parser,
  definitions: Definitions,
  injector: Injector,
  value: any,
  formId?: string;
  parentForm?: {
    id: string;
    pointer: string;
  },
  parent?: string,
  index?: number,
  pointer?: Pointer
}) {

  const {segments, parser, ...segmentConfig} = config;

  return segments.reduce((acc, segment) => {
    if (!segment.authorization || segment.authorization.includes(parser.role)) {

      const compiled = compileSegment({
        segment,
        parser,
        ...segmentConfig,
      });

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
