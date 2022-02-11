import {Injectable} from '@angular/core';
import {StorageService} from '../../../projects/form-builder/src/lib/services/storage.service';

@Injectable()
export class MockStorageService implements StorageService {

  storage = {};

  upload(path: string, data: any, metadata?: any): any {
    return Promise.resolve({
      ref: {
        getDownloadURL: () => Promise.resolve('https://jaspero.co')
      }
    });
  }
}
