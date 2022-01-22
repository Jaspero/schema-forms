import {DefinitionWithConfiguration, FieldDefinition} from '@jaspero/form-builder';
import {AutocompleteData} from './fields/autocomplete/autocomplete.component';
import {ChipsData} from './fields/chips/chips.component';
import {DateData} from './fields/date-field/date-field.component';
import {DragData} from './fields/draggable-list/draggable-list.component';
import {FileData} from './fields/file/file.component';
import {GalleryData} from './fields/gallery/gallery.component';
import {ImageData} from './fields/image/image.component';
import {InputData} from './fields/input/input.component';
import {RadioData} from './fields/radio/radio.component';
import {RangeData} from './fields/range/range.component';
import {RefData} from './fields/ref/ref.component';
import {SelectData} from './fields/select/select.component';
import {SliderData} from './fields/slider/slider.component';
import {TextareaData} from './fields/textarea/textarea.component';

export type FieldDefinitions<Prefix extends string = 'mat'> =
  DefinitionWithConfiguration<AutocompleteData, Prefix, 'autocomplete'> |
  FieldDefinition<Prefix, 'checkbox'> |
  DefinitionWithConfiguration<ChipsData, Prefix, 'chips'> |
  DefinitionWithConfiguration<DateData, Prefix, 'date'> |
  DefinitionWithConfiguration<DragData, Prefix, 'draggable'> |
  DefinitionWithConfiguration<FileData, Prefix, 'file'> |
  DefinitionWithConfiguration<GalleryData, Prefix, 'gallery'> |
  DefinitionWithConfiguration<ImageData, Prefix, 'image'> |
  DefinitionWithConfiguration<InputData, Prefix, 'input'> |
  DefinitionWithConfiguration<RadioData, Prefix, 'radio'> |
  DefinitionWithConfiguration<RangeData, Prefix, 'range'> |
  DefinitionWithConfiguration<RefData, Prefix, 'ref'> |
  DefinitionWithConfiguration<SelectData, Prefix, 'select'> |
  DefinitionWithConfiguration<SliderData, Prefix, 'slider'> |
  DefinitionWithConfiguration<TextareaData, Prefix, 'textarea'> |
  FieldDefinition<Prefix, 'toggle'>;
