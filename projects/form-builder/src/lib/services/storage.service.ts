export abstract class StorageService {
  upload(path: string, data: any, metadata?: any): any {}

  storage: any;
}
