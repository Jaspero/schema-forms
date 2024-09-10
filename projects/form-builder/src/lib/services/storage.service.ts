import {Observable} from 'rxjs';

export abstract class StorageService {
  storage: any;

  upload(path: string, data: any, metadata?: any): any {}

  getDownloadURL(ref: any): Observable<string> {
    return  new Observable();
  }

  deleteObject(url: string): Observable<void> {
    return new Observable();
  }
}
