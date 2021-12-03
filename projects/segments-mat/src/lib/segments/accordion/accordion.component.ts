import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {CompiledSegment, filterAndCompileSegments, Segment, SegmentComponent} from '@jaspero/form-builder';

interface AccordionSegment extends Segment {
  expanded?: boolean;
  disabled?: boolean;
}

interface CompiledSegmentAccord {
  title: string;
  description?: string;
  disabled?: boolean;
  expanded?: boolean;
  segment: CompiledSegment;
}

@Component({
  selector: 'fb-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccordionComponent extends SegmentComponent<AccordionSegment[]> implements OnInit {

  accordions: CompiledSegmentAccord[];
  loaded = new Set();

  ngOnInit() {
    super.ngOnInit();

    this.accordions = (this.sData.segment.configuration || [])
      .reduce((acc, accord: AccordionSegment) => {

        const compiled = filterAndCompileSegments(
          [{
            ...accord,
            title: '',
            description: '',
            type: accord.type || 'empty'
          }],
          this.sData.parser,
          this.sData.definitions,
          this.injector,
          this.segment.entryValue
        );

        if (compiled.length) {
          acc.push({
            title: accord.title,
            disabled: accord.disabled,
            description: accord.description,
            expanded: accord.expanded,
            segment: compiled[0]
          })
        }

        return acc;
      }, []);

    this.accordions.forEach((accord, index) => {
      if (accord.expanded) {
        this.loaded.add(index);
      }
    });
  }
}
