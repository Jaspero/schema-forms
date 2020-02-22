import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {CompiledField} from '../../interfaces/compiled-field.interface';
import {CompiledSegment} from '../../interfaces/compiled-segment.interface';
import {ModuleInstanceSegment} from '../../interfaces/module-instance-segment.interface';
import {SegmentComponent, SegmentData} from '../../segment/segment.component';
import {filterAndCompileSegments} from '../../utils/filter-and-compile-segments';
import {safeEval} from '../../utils/safe-eval';

type SelectedTabChange = (event: MatTabChangeEvent, sData: SegmentData) => void;

interface TabsConfiguration {
  selectedIndex?: number;
  dynamicHeight?: boolean;
  disableRipple?: boolean;
  selectedTabChange?: string | SelectedTabChange;
  alignment?: 'start' | 'center' | 'end';
  tabs: SegmentTab[];
}

interface SegmentTabShared {
  title?: string;
  disabled?: boolean;
}

interface SegmentTab extends SegmentTabShared {
  fields?: string[];
  nestedSegments?: ModuleInstanceSegment[];
}

interface CompiledSegmentTab extends SegmentTabShared {
  fields?: CompiledField[];
  nestedSegments?: CompiledSegment[];
}

@Component({
  selector: 'fb-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsComponent extends SegmentComponent<TabsConfiguration> implements OnInit {

  tabs: CompiledSegmentTab[];
  selectedTabChange?: SelectedTabChange;

  ngOnInit() {
    super.ngOnInit();

    const configuration = this.segment.configuration as TabsConfiguration;

    if (configuration.selectedTabChange) {
      this.selectedTabChange = safeEval(
        configuration.selectedTabChange as string
      );
    }

    this.tabs = configuration.tabs.map(
      tab => ({
        ...tab,
        fields: (tab.fields || []).map(key =>
          this.sData.parser.field(
            key,
            this.pointers[key],
            this.sData.definitions
          )
        ),
        nestedSegments: filterAndCompileSegments(
          this.role,
          tab.nestedSegments || [],
          this.sData.parser,
          this.sData.definitions,
          this.injector,
          this.segment.entryValue
        )
      })
    );
  }

  tabChange(event: MatTabChangeEvent) {
    if (this.selectedTabChange) {
      this.selectedTabChange(
        event,
        this.sData
      );
    }
  }
}

