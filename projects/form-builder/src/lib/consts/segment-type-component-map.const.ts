import {SegmentType} from '../enums/segment-type.enum';
import {AccordionComponent} from '../segments/accordion/accordion.component';
import {CardComponent} from '../segments/card/card.component';
import {EmptyComponent} from '../segments/empty/empty.component';
import {StepperComponent} from '../segments/stepper/stepper.component';
import {TabsComponent} from '../segments/tabs/tabs.component';

export const SEGMENT_TYPE_COMPONENT_MAP: {[key: string]: any} = {
  [SegmentType.Empty]: EmptyComponent,
  [SegmentType.Card]: CardComponent,
  [SegmentType.Accordion]: AccordionComponent,
  [SegmentType.Tabs]: TabsComponent,
  [SegmentType.Stepper]: StepperComponent
};
