import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {CompiledField} from '../../interfaces/compiled-field.interface';
import {CompiledSegment} from '../../interfaces/compiled-segment.interface';
import {Segment} from '../../interfaces/segment.interface';
import {SegmentComponent} from '../../segment/segment.component';
import {compileFields} from '../../utils/compile-fields';
import {filterAndCompileSegments} from '../../utils/filter-and-compile-segments';

interface SegmentAccord {
  title?: string;
  description?: string;
  fields?: string[];
  nestedSegments?: Segment[];
  expanded?: boolean;
}

interface CompiledSegmentAccord {
  title?: string;
  description?: string;
  fields?: CompiledField[];
  nestedSegments?: CompiledSegment[];
  expanded?: boolean;
}

@Component({
  selector: 'fb-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccordionComponent extends SegmentComponent implements OnInit {

  accordions: CompiledSegmentAccord[];

  ngOnInit() {
    super.ngOnInit();

    this.accordions = (this.sData.segment.configuration || []).map(
      (accord: SegmentAccord) => ({
        title: accord.title,
        fields: compileFields(this.sData.parser, this.sData.definitions, accord.fields),
        nestedSegments: filterAndCompileSegments(
          accord.nestedSegments || [],
          this.sData.parser,
          this.sData.definitions,
          this.injector,
          this.segment.entryValue
        )
      })
    );
  }
}
