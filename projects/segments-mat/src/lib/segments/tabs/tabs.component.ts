import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {MatLegacyTabChangeEvent as MatTabChangeEvent} from '@angular/material/legacy-tabs';
import {
  CompiledSegment,
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

interface SegmentTab extends Segment {
  disabled?: boolean;
}

interface CompiledTab {
  title: string;
  disabled?: boolean;
  segment: CompiledSegment;
}

@Component({
  selector: 'fb-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsComponent extends SegmentComponent<TabsConfiguration> implements OnInit {

  tabs: CompiledTab[];
  selectedTabChange?: SelectedTabChange;
  loaded = new Set();

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

    this.loaded.add(this.configuration.selectedIndex || 0);

    this.tabs = this.configuration.tabs.reduce((acc, tab) => {
      const compiled = filterAndCompileSegments({
        segments: [{
          ...tab,
          title: '',
          type: tab.type || 'empty'
        }],
        parser: this.sData.parser,
        definitions: this.sData.definitions,
        injector: this.injector,
        value: this.segment.entryValue,
        formId: this.sData.formId,
        parentForm: this.sData.parentForm
      });

      if (compiled.length) {
        acc.push({
          title: tab.title,
          disabled: tab.disabled,
          segment: compiled[0]
        })
      }

      return acc;
    }, []);
  }

  tabChange(event: MatTabChangeEvent) {

    this.loaded.add(event.index);

    if (this.selectedTabChange) {
      this.selectedTabChange(
        event,
        this.sData
      );
    }
  }
}

