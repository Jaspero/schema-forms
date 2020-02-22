import {ComponentType} from '../enums/component-type.enum';
import {AutocompleteComponent} from '../fields/autocomplete/autocomplete.component';
import {CheckboxComponent} from '../fields/checkbox/checkbox.component';
import {ChipsComponent} from '../fields/chips/chips.component';
import {DateFieldComponent} from '../fields/date-field/date-field.component';
import {DraggableListComponent} from '../fields/draggable-list/draggable-list.component';
import {FileComponent} from '../fields/file/file.component';
import {GalleryComponent} from '../fields/gallery/gallery.component';
import {ImageComponent} from '../fields/image/image.component';
import {InputComponent} from '../fields/input/input.component';
import {RadioComponent} from '../fields/radio/radio.component';
import {SelectComponent} from '../fields/select/select.component';
import {SliderComponent} from '../fields/slider/slider.component';
import {TextareaComponent} from '../fields/textarea/textarea.component';
import {ToggleComponent} from '../fields/toggle/toggle.component';
import {WysiwygComponent} from '../fields/wysiwyg/wysiwyg.component';


export const COMPONENT_TYPE_COMPONENT_MAP = {
  [ComponentType.Input]: InputComponent,
  [ComponentType.Toggle]: ToggleComponent,
  [ComponentType.Select]: SelectComponent,
  [ComponentType.File]: FileComponent,
  [ComponentType.Image]: ImageComponent,
  [ComponentType.Gallery]: GalleryComponent,
  [ComponentType.Checkbox]: CheckboxComponent,
  [ComponentType.Autocomplete]: AutocompleteComponent,
  [ComponentType.Date]: DateFieldComponent,
  [ComponentType.Slider]: SliderComponent,
  [ComponentType.Wysiwyg]: WysiwygComponent,
  [ComponentType.Draggable]: DraggableListComponent,
  [ComponentType.Radio]: RadioComponent,
  [ComponentType.Chips]: ChipsComponent,
  [ComponentType.Textarea]: TextareaComponent
};
