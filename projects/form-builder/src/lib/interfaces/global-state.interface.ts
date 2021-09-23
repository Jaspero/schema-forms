import {FormGroup} from '@angular/forms';
import {Parser} from '../utils/parser';

export interface GlobalState {
  forms: {[id: string]: FormGroup}
  parsers: {[id: string]: Parser}
}
