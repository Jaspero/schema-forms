import {ChangeDetectionStrategy, Component, Inject, OnInit, Optional} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {map, startWith, switchMap, tap} from 'rxjs/operators';
import {FieldComponent} from '../../field/field.component';
import {FieldData} from '../../interfaces/field-data.interface';
import {Option} from '../../interfaces/option.interface';
import {WhereFilter} from '../../interfaces/where-filter.interface';
import {DbService} from '../../services/db.service';
import {ADDITIONAL_CONTEXT} from '../../utils/additional-context';
import {COMPONENT_DATA} from '../../utils/create-component-injector';
import {parseTemplate} from '../../utils/parse-template';
import {ROLE} from '../../utils/role';
import {safeEval} from '../../utils/safe-eval';
import {Parser} from '../../utils/parser';

interface Populate {
  collection?: string;
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

interface SelectData extends FieldData {
  dataSet?: Option[];
  multiple?: boolean;
  populate?: Populate;
  autocomplete?: string;
}

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
    @Inject(ROLE)
    private role: string,
    @Optional()
    @Inject(ADDITIONAL_CONTEXT)
    private additionalContext: any
  ) {
    super(cData);
  }

  ngOnInit() {
    if (this.cData.populate) {

      const populate = this.cData.populate as Populate;

      const mapResults = populate.mapResults ? safeEval(populate.mapResults) : null;
      const documentsMethod = (
        query?: {
          collection: string,
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
        const pointer = this.cData.pointers[Parser.standardizeKey(populate.dependency.key)];
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
          orderBy: populate.orderBy,
          filter
        } as any);
      }
    } else {
      this.dataSet$ = of(this.cData.dataSet as any);
    }
  }
}
