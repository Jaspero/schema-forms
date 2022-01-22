import {DefinitionWithConfiguration, FieldDefinition} from '@jaspero/form-builder';
import {AutocompleteConfiguration} from './fields/autocomplete/autocomplete.component';
import {ChipsConfiguration} from './fields/chips/chips.component';
import {DateConfiguration} from './fields/date-field/date-field.component';
import {DragConfiguration} from './fields/draggable-list/draggable-list.component';
import {FileConfiguration} from './fields/file/file.component';
import {GalleryConfiguration} from './fields/gallery/gallery.component';
import {ImageConfiguration} from './fields/image/image.component';
import {InputConfiguration} from './fields/input/input.component';
import {RadioConfiguration} from './fields/radio/radio.component';
import {RangeConfiguration} from './fields/range/range.component';
import {RefConfiguration} from './fields/ref/ref.component';
import {SelectConfiguration} from './fields/select/select.component';
import {SliderConfiguration} from './fields/slider/slider.component';
import {TextareaConfiguration} from './fields/textarea/textarea.component';

export type FieldDefinitions<Prefix extends string = 'mat-'> =
  DefinitionWithConfiguration<AutocompleteConfiguration, Prefix, 'autocomplete'> |
  FieldDefinition<Prefix, 'checkbox'> |
  DefinitionWithConfiguration<ChipsConfiguration, Prefix, 'chips'> |
  DefinitionWithConfiguration<DateConfiguration, Prefix, 'date'> |
  DefinitionWithConfiguration<DragConfiguration, Prefix, 'draggable'> |
  DefinitionWithConfiguration<FileConfiguration, Prefix, 'file'> |
  DefinitionWithConfiguration<GalleryConfiguration, Prefix, 'gallery'> |
  DefinitionWithConfiguration<ImageConfiguration, Prefix, 'image'> |
  DefinitionWithConfiguration<InputConfiguration, Prefix, 'input'> |
  DefinitionWithConfiguration<RadioConfiguration, Prefix, 'radio'> |
  DefinitionWithConfiguration<RangeConfiguration, Prefix, 'range'> |
  DefinitionWithConfiguration<RefConfiguration, Prefix, 'ref'> |
  DefinitionWithConfiguration<SelectConfiguration, Prefix, 'select'> |
  DefinitionWithConfiguration<SliderConfiguration, Prefix, 'slider'> |
  DefinitionWithConfiguration<TextareaConfiguration, Prefix, 'textarea'> |
  FieldDefinition<Prefix, 'toggle'>;
