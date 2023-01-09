import {DragDropModule} from '@angular/cdk/drag-drop';
import {ObserversModule} from '@angular/cdk/observers';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatLegacyChipsModule as MatChipsModule} from '@angular/material/legacy-chips';
import {MatRippleModule} from '@angular/material/core';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
import {MatTreeModule} from '@angular/material/tree';
import {FormBuilderContextService, FormBuilderModule} from '@jaspero/form-builder';
import {SanitizeModule, StopPropagationModule} from '@jaspero/ng-helpers';
import {TranslocoModule, TRANSLOCO_SCOPE} from '@ngneat/transloco';
import {BlockFormComponent} from './block-form/block-form.component';
import {BlockComponent} from './block/block.component';
import {BackgroundComponent} from './fields/background/background.component';
import {MbpComponent} from './fields/mbp/mbp.component';
import {NavigationComponent} from './navigation/navigation.component';
import {PageBuilderCtxService} from './page-builder-ctx.service';
import {PageBuilderComponent} from './page-builder/page-builder.component';
import {ToolbarService} from './toolbar.service';

@NgModule({
  declarations: [
    PageBuilderComponent,
    BlockFormComponent,
    NavigationComponent,
    BlockComponent,
    MbpComponent,
    BackgroundComponent
  ],
  imports: [
    CommonModule,
    FormBuilderModule,
    ReactiveFormsModule,

    MatButtonModule,
    MatDialogModule,
    MatRippleModule,
    MatButtonToggleModule,
    MatIconModule,
    DragDropModule,
    MatTreeModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,
    MatInputModule,
    MatChipsModule,
    MatCheckboxModule,

    StopPropagationModule,
    SanitizeModule,
    ObserversModule,

    TranslocoModule
  ],
  providers: [
    ToolbarService,
    PageBuilderCtxService,
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'fb-pb'
    }
  ]
})
export class PageBuilderModule {
  constructor(
    private ctx: FormBuilderContextService
  ) {
    [
      ['blocks', PageBuilderComponent],
      ['block', BlockFormComponent],
      ['mbp', MbpComponent],
      ['background', BackgroundComponent]
    ]
      .forEach(([key, component]) =>
        this.ctx.registerField('pb-' + key, component)
      )
  }
}
