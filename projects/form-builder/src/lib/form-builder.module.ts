import {DragDropModule} from '@angular/cdk/drag-drop';
import {PortalModule} from '@angular/cdk/portal';
import {CommonModule} from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSliderModule} from '@angular/material/slider';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatTooltipModule} from '@angular/material/tooltip';
import {SanitizeModule} from '@jaspero/ng-helpers';
import {TranslocoModule} from '@ngneat/transloco';
import {DropzoneDirective} from './directives/dropzone/dropzone.directive';
import {FieldComponent} from './field/field.component';
import {AutocompleteComponent} from './fields/autocomplete/autocomplete.component';
import {CheckboxComponent} from './fields/checkbox/checkbox.component';
import {ChipsComponent} from './fields/chips/chips.component';
import {DateFieldComponent} from './fields/date-field/date-field.component';
import {DraggableListComponent} from './fields/draggable-list/draggable-list.component';
import {FileComponent} from './fields/file/file.component';
import {GalleryComponent} from './fields/gallery/gallery.component';
import {ImageComponent} from './fields/image/image.component';
import {InputComponent} from './fields/input/input.component';
import {RadioComponent} from './fields/radio/radio.component';
import {RangeComponent} from './fields/range/range.component';
import {RefComponent} from './fields/ref/ref.component';
import {SelectComponent} from './fields/select/select.component';
import {SliderComponent} from './fields/slider/slider.component';
import {TextareaComponent} from './fields/textarea/textarea.component';
import {ToggleComponent} from './fields/toggle/toggle.component';
import {FormBuilderContextService} from './form-builder-context.service';
import {FormBuilderComponent} from './form-builder.component';
import {ShowFieldPipe} from './pipes/show-field/show-field.pipe';
import {SegmentComponent} from './segment/segment.component';
import {AccordionComponent} from './segments/accordion/accordion.component';
import {CardComponent} from './segments/card/card.component';
import {EmptyComponent} from './segments/empty/empty.component';
import {StepperComponent} from './segments/stepper/stepper.component';
import {TabsComponent} from './segments/tabs/tabs.component';
import { CustomComponent } from './custom/custom.component';
import { FileSelectComponent } from './components/file-select/file-select.component';

@NgModule({
  declarations: [

    /**
     * Fields
     */
    FieldComponent,

    AutocompleteComponent,
    CheckboxComponent,
    ChipsComponent,
    DateFieldComponent,
    RangeComponent,
    DraggableListComponent,
    FileComponent,
    GalleryComponent,
    ImageComponent,
    InputComponent,
    RadioComponent,
    SelectComponent,
    SliderComponent,
    TextareaComponent,
    ToggleComponent,
    RefComponent,

    /**
     * Segments
     */
    SegmentComponent,

    AccordionComponent,
    CardComponent,
    EmptyComponent,
    StepperComponent,
    TabsComponent,

    /**
     * Directives
     */
    DropzoneDirective,

    /**
     * Pipes
     */
    ShowFieldPipe,

    FormBuilderComponent,

    CustomComponent,

    FileSelectComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    /**
     * Material
     */
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    DragDropModule,
    MatDialogModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatDividerModule,
    PortalModule,
    MatCardModule,
    MatTabsModule,
    MatRadioModule,
    MatTableModule,

    /**
     * Jp Helpers
     */
    SanitizeModule,

    /**
     * Other
     */
    TranslocoModule
  ],
  exports: [FormBuilderComponent]
})
export class FormBuilderModule {
  static forRoot(): ModuleWithProviders<FormBuilderModule> {
    return {
      ngModule: FormBuilderModule,
      providers: [FormBuilderContextService]
    }
  }
}
