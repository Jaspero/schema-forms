import {Injector} from '@angular/core';
import {SegmentType} from '../enums/segment-type.enum';
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
  parent?: string
) {
  return segments.reduce((acc, cur) => {
    if (!cur.authorization || cur.authorization.includes(parser.role)) {

      const compiled = compileSegment(
        cur,
        parser,
        definitions,
        injector,
        value,
        parent
      );

      /**
       * Exclude any segments that end up not having
       * a single field or component
       */
      if (
        compiled &&
        (
          (compiled.fields && compiled.fields.length) ||
          (compiled.customComponents && compiled.customComponents.length) ||
          [SegmentType.Accordion, SegmentType.Tabs, SegmentType.Stepper].includes(compiled.type || SegmentType.Card)
        )
      ) {
        acc.push(
          // @ts-ignore
          compiled
        );
      }
    }

    return acc;
  }, []);
}
