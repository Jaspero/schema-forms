import {DragDropModule} from '@angular/cdk/drag-drop';
import {ObserversModule} from '@angular/cdk/observers';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatRippleModule} from '@angular/material/core';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatTreeModule} from '@angular/material/tree';
import {FormBuilderContextService, FormBuilderModule} from '@jaspero/form-builder';
import {SanitizeModule, StopPropagationModule} from '@jaspero/ng-helpers';
import {TRANSLOCO_SCOPE, TranslocoModule} from '@jsverse/transloco';
import {BlockFormComponent} from './block-form/block-form.component';
import {BlockComponent} from './block/block.component';
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
    MbpComponent
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
      ['mbp', MbpComponent]
    ]
      .forEach(([key, component]) =>
        this.ctx.registerField('pb-' + key, component)
      )
  }
}
