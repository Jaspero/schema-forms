export abstract class StorageService {
  storage: any;

  upload(path: string, data: any, metadata?: any): any {}

  getDownloadURL(ref: any): Promise<any> {
    return Promise.resolve();
  }
}
