import {ChangeDetectionStrategy, Component, Inject, OnInit, Optional} from '@angular/core';
import {
  ADDITIONAL_CONTEXT,
  COMPONENT_DATA,
  DbService,
  FieldComponent,
  FieldData,
  Option,
  Parser,
  ROLE,
  WhereFilter
} from '@jaspero/form-builder';
import {parseTemplate, safeEval} from '@jaspero/utils';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {map, startWith, switchMap, tap} from 'rxjs/operators';

interface Populate {
  collection?: string;
  subcollection?: string;
  nameKey?: string;
  valueKey?: string;
  orderBy?: string;

  /**
   * A method for mapping all of the results
   * (items: T[]) => any[]
   */
  mapResults?: string;

  /**
   * If a filter is a string
   * it represents the id of the document
   */
  filter?: WhereFilter | string;

  /**
   * A stringified function that receives
   * an object with {fieldData: SelectData, value: form.getRawValue(), role: string, additionalContext?: any}
   * and should return a WhereFilter.
   * This doesn't work in combination with the dependency property
   */
  dynamicFilter?: string;

  /**
   * Use this property if the field depends on changes
   * of a different field in the form
   */
  dependency?: {
    key: string;

    /**
     * A method for defining query dynamically
     * (value) => {collection: string; orderBy: string; filter: WhereFilter | string}
     */
    method: string;
  };
}

export interface SelectConfiguration {
  dataSet?: Option[];
  multiple?: boolean;
  populate?: Populate;
  autocomplete?: string;
  reset?: boolean;
  resetIcon?: string;
}

export type SelectData = SelectConfiguration & FieldData;

@Component({
  selector: 'fb-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectComponent extends FieldComponent<SelectData>
  implements OnInit {
  dataSet$: Observable<Option[]>;
  loading$ = new BehaviorSubject(true);

  constructor(
    @Inject(COMPONENT_DATA) public cData: SelectData,
    private dbService: DbService,
    @Optional()
    @Inject(ROLE)
    private role: string,
    @Optional()
    @Inject(ADDITIONAL_CONTEXT)
    private additionalContext: any
  ) {
    super(cData);
  }

  get hasValue() {
    return this.cData.control.value || this.cData.control.value === 0 || this.cData.control.value === false;
  }

  ngOnInit() {
    if (this.cData.populate) {

      const populate = this.cData.populate as Populate;

      const mapResults = populate.mapResults ? safeEval(populate.mapResults) : null;
      const documentsMethod = (
        query?: {
          collection: string,
          subcollection: string,
          orderBy: string,
          filter: WhereFilter[] | WhereFilter | string
        }
      ) => {

        this.loading$.next(true);

        if (!query) {
          this.loading$.next(false);
          return of([]);
        }

        if (query.filter && typeof query.filter === 'string') {
          return this.dbService.getDocument(
            query.collection,
            query.filter
          )
            .pipe(
              map(it => {
                return (mapResults ? mapResults(it) : [it]).map((doc: any) => ({
                  value: doc[populate.valueKey || 'id'],
                  name: parseTemplate(
                    populate.nameKey || 'name',
                    doc
                  )
                }));
              }),
              tap(() => this.loading$.next(false))
            );
        }

        if (query.filter && Array.isArray(query.filter)) {
          return this.dbService.getDocuments(
            query.collection,
            undefined,
            undefined,
            undefined,
            query.filter
          )
            .pipe(
              map(docs => {
                if (mapResults) {
                  docs = mapResults(docs, {
                    fieldData: this.cData,
                    value: this.cData.form.getRawValue(),
                    role: this.role,
                    additionalContext: this.additionalContext
                  });
                }

                return docs.map(doc => ({
                  value: doc[populate.valueKey || 'id'],
                  name: parseTemplate(
                    populate.nameKey || 'name',
                    doc
                  )
                }));
              }),
              tap(() => this.loading$.next(false))
            );
        }

        if (query.subcollection) {
          return this.dbService
            .getSubdocumentsSimple(
              query.subcollection,
              query.orderBy,
              query.filter as WhereFilter
            )
            .pipe(
              map(docs => {
                if (mapResults) {
                  docs = mapResults(docs, {
                    fieldData: this.cData,
                    value: this.cData.form.getRawValue(),
                    role: this.role,
                    additionalContext: this.additionalContext
                  });
                }

                return docs.map(doc => ({
                  value: doc[populate.valueKey || 'id'],
                  name: parseTemplate(
                    populate.nameKey || 'name',
                    doc
                  )
                }));
              }),
              tap(() => this.loading$.next(false))
            );
        }

        return this.dbService
          .getDocumentsSimple(
            query.collection,
            query.orderBy,
            query.filter as WhereFilter
          )
          .pipe(
            map(docs => {
              if (mapResults) {
                docs = mapResults(docs, {
                  fieldData: this.cData,
                  value: this.cData.form.getRawValue(),
                  role: this.role,
                  additionalContext: this.additionalContext
                });
              }

              return docs.map(doc => ({
                value: doc[populate.valueKey || 'id'],
                name: parseTemplate(
                  populate.nameKey || 'name',
                  doc
                )
              }));
            }),
            tap(() => this.loading$.next(false))
          );
      };

      if (populate.dependency) {
        const pointer = this.cData.pointers[Parser.standardizeKeyWithSlash(populate.dependency.key)];
        const gm = safeEval(populate.dependency.method);

        this.dataSet$ = pointer.control.valueChanges
          .pipe(
            startWith(
              pointer.control.value
            ),
            switchMap(value =>
              documentsMethod(
                gm(value, {
                  fieldData: this.cData,
                  value: this.cData.form.getRawValue(),
                  role: this.role,
                  additionalContext: this.additionalContext
                })
              )
            )
          );
      } else {

        let filter: WhereFilter | WhereFilter[] = populate.filter as (WhereFilter | WhereFilter[]);

        if (populate.dynamicFilter) {
          filter = safeEval(populate.dynamicFilter)({
            fieldData: this.cData,
            value: this.cData.form.getRawValue(),
            role: this.role,
            additionalContext: this.additionalContext
          });
        }

        this.dataSet$ = documentsMethod({
          collection: populate.collection,
          subcollection: populate.subcollection,
          orderBy: populate.orderBy,
          filter
        } as any);
      }
    } else {
      this.dataSet$ = of(this.cData.dataSet as any);
    }
  }

  reset(event) {
    event.stopPropagation();
    this.cData.control.reset();
  }
}
