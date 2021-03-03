import {Observable, of} from 'rxjs';
import {WhereFilter} from '../interfaces/where-filter.interface';

export abstract class DbService {

  getDocuments(
    moduleId: string,
    pageSize?: number,
    sort?: {
      active: string;
      direction: string;
    },
    cursor?: any,
    filters?: WhereFilter[]
  ): Observable<any[]> {
    return of([]);
  }

  getDocumentsSimple(
    moduleId: string,
    orderBy?: string,
    filter?: WhereFilter
  ): Observable<any[]> {
    return of([]);
  }

  getSubdocumentsSimple(
    moduleId: string,
    orderBy?: string,
    filter?: WhereFilter
  ): Observable<any[]> {
    return of([]);
  }

  getStateChanges(
    moduleId: string,
    pageSize?: number,
    sort?: {
      active: string;
      direction: string;
    },
    cursor?: any,
    filters?: WhereFilter[],
  ): Observable<any[]> {
    return of([]);
  }

  getDocument<T = any>(
    moduleId: string,
    documentId: string,
    stream = false
  ): Observable<T> {
    return of();
  }

  setDocument(
    moduleId: string,
    documentId: string,
    data: any,
    options?: any
  ): Observable<void> {
    return of();
  }

  removeDocument(moduleId: string, documentId: string): Observable<void> {
    return of();
  }

  createUserAccount(email: string, password: string): Observable<{id: string}> {
    return of();
  }

  removeUserAccount(id: string): Observable<any> {
    return of();
  }

  createId() {
    return '';
  }
}
