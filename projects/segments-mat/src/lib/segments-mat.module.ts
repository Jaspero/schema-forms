import {PortalModule} from '@angular/cdk/portal';
import {CommonModule} from '@angular/common';
import {Inject, InjectionToken, ModuleWithProviders, NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FormBuilderContextService, ShowFieldModule} from '@jaspero/form-builder';
import {TranslocoModule} from '@jsverse/transloco';
import {AccordionComponent} from './segments/accordion/accordion.component';
import {CardComponent} from './segments/card/card.component';
import {EmptyComponent} from './segments/empty/empty.component';
import {StepperComponent} from './segments/stepper/stepper.component';
import {TabsComponent} from './segments/tabs/tabs.component';

export interface SegmentsMatConfig {
  prefix: string;
}

const SEGMENTS_CONFIG = new InjectionToken<SegmentsMatConfig>('SEGMENTS_CONFIG');

@NgModule({
  declarations: [
    AccordionComponent,
    CardComponent,
    EmptyComponent,
    StepperComponent,
    TabsComponent,
  ],
  imports: [
    CommonModule,

    ShowFieldModule,

    /**
     * Material
     */
    MatDividerModule,
    MatExpansionModule,
    PortalModule,

    /**
     * Other
     */
    TranslocoModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatTabsModule
  ]
})
export class FbSegmentsMatModule {

  static forRoot(config?: SegmentsMatConfig): ModuleWithProviders<FbSegmentsMatModule> {
    return {
      ngModule: FbSegmentsMatModule,
      providers: [{
        provide: SEGMENTS_CONFIG,
        useValue: {
          prefix: 'mat',
          ...config
        }
      }]
    }
  }

  constructor(
    private ctx: FormBuilderContextService,
    @Inject(SEGMENTS_CONFIG)
    private config: SegmentsMatConfig
  ) {

    const {prefix} = config;

    [
      ['empty', EmptyComponent],
      ['card', CardComponent],
      ['accordion', AccordionComponent],
      ['stepper', StepperComponent],
      ['tabs', TabsComponent]
    ]
      .forEach(([key, component]) => {
        this.ctx.registerSegment(
          (prefix ? [prefix, key].join('-') : key) as string,
          component
        );
      })
  }
}
