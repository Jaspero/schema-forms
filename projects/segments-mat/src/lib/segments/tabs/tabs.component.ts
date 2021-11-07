import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {
  CompiledField,
  CompiledSegment,
  compileFields,
  filterAndCompileSegments,
  Segment,
  SegmentComponent,
  SegmentData
} from '@jaspero/form-builder';
import {safeEval} from '@jaspero/utils';

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
  nestedSegments?: Segment[];
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

  get configuration() {
    return this.segment.configuration as TabsConfiguration;
  }

  ngOnInit() {
    super.ngOnInit();

    if (this.configuration.selectedTabChange) {
      this.selectedTabChange = safeEval(
        this.configuration.selectedTabChange as string
      );
    }

    this.tabs = this.configuration.tabs.map(
      tab => ({
        ...tab,
        fields: compileFields(this.sData.parser, this.sData.definitions, tab.fields),
        nestedSegments: filterAndCompileSegments(
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

