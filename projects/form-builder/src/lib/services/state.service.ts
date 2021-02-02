import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  constructor() { }

  listeners: {
    [key: string]: Observable<any>;
  } = {};
}
