import {Injector} from '@angular/core';
import {ModuleDefinitions} from '../interfaces/module-definitions.interface';
import {ModuleInstanceSegment} from '../interfaces/module-instance-segment.interface';
import {compileSegment} from './compile-segment';
import {Parser} from './parser';

export function filterAndCompileSegments(
  role: string,
  segments: ModuleInstanceSegment[],
  parser: Parser,
  definitions: ModuleDefinitions,
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
