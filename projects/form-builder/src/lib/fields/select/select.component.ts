import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {map, startWith, switchMap, tap} from 'rxjs/operators';
import {FieldComponent} from '../../field/field.component';
import {FieldData} from '../../interfaces/field-data.interface';
import {Option} from '../../interfaces/option.interface';
import {WhereFilter} from '../../interfaces/where-filter.interface';
import {DbService} from '../../services/db.service';
import {COMPONENT_DATA} from '../../utils/create-component-injector';
import {parseTemplate} from '../../utils/parse-template';
import {safeEval} from '../../utils/safe-eval';

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

  dependency?: {
    key: string;
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
  constructor(
    @Inject(COMPONENT_DATA) public cData: SelectData,
    private dbService: DbService
  ) {
    super(cData);
  }

  dataSet$: Observable<Option[]>;
  loading$ = new BehaviorSubject(true);

  ngOnInit() {
    if (this.cData.populate) {

      const populate = this.cData.populate as Populate;

      const mapResults = populate.mapResults ? safeEval(populate.mapResults) : null;
      const documentsMethod = (
        query?: {
          collection: string,
          orderBy: string,
          filter: WhereFilter | string
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
                    doc[populate.nameKey || 'name'],
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
                docs = mapResults(docs);
              }

              return docs.map(doc => ({
                value: populate.valueKey || 'id',
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

        const pointer = this.cData.pointers[populate.dependency.key];
        const gm = safeEval(populate.dependency.method);

        this.dataSet$ = pointer.control.valueChanges
          .pipe(
            startWith(
              pointer.control.value
            ),
            switchMap(value =>
              documentsMethod(
                gm(value)
              )
            )
          );
      } else {
        this.dataSet$ = documentsMethod({
          collection: populate.collection,
          orderBy: populate.orderBy,
          filter: populate.filter
        } as any);
      }
    } else {
      this.dataSet$ = of(this.cData.dataSet as any);
    }
  }
}
