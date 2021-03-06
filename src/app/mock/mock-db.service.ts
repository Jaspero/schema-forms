import {Injectable} from '@angular/core';
import {DbService} from '@jaspero/form-builder';
import {Observable, of} from 'rxjs';
import {WhereFilter} from '../../../projects/form-builder/src/lib/interfaces/where-filter.interface';

@Injectable()
export class MockDbService implements DbService {
  getDocuments(moduleId: string, pageSize?: number, sort?: { active: string; direction: string }, cursor?: any, filters?: any[]): Observable<any[]> {
    return of([]);
  }

  getDocumentsSimple(
    moduleId: string,
    orderBy?: string,
    filter?: any
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
    filters?: any[],
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

  createId(): string {
    return '';
  }
}
