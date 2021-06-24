import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable()
export class PageBuilderCtxService {
  triggerUpdate$ = new Subject<any>();
  selectedBlock$ = new Subject<number>();
}
