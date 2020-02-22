import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {CompiledField} from '../../interfaces/compiled-field.interface';
import {CompiledSegment} from '../../interfaces/compiled-segment.interface';
import {ModuleInstanceSegment} from '../../interfaces/module-instance-segment.interface';
import {SegmentComponent} from '../../segment/segment.component';
import {filterAndCompileSegments} from '../../utils/filter-and-compile-segments';

interface SegmentAccord {
  title?: string;
  description?: string;
  fields?: string[];
  nestedSegments?: ModuleInstanceSegment[];
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
        fields: (accord.fields || []).map(key =>
          this.sData.parser.field(
            key,
            this.pointers[key],
            this.sData.definitions
          )
        ),
        nestedSegments: filterAndCompileSegments(
          this.role,
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
