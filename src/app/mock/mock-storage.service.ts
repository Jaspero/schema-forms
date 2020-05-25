import { Injectable } from '@angular/core';
import {StorageService} from 'form-builder';

@Injectable()
export class MockStorageService implements StorageService {

  storage = {};

  upload(path: string, data: any, metadata?: any): any {
    return Promise.resolve();
  }
}
