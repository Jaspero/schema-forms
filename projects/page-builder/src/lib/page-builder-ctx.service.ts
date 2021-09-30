import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable()
export class PageBuilderCtxService {
  selectedBlock$ = new Subject<number>();
}
