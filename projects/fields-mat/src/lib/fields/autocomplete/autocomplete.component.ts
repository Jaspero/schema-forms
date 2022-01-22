import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {
  COMPONENT_DATA,
  DbService,
  FieldComponent,
  FieldData,
  FilterMethod,
  getHsd,
  HSD,
  WhereFilter
} from '@jaspero/form-builder';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {map, startWith, switchMap, tap} from 'rxjs/operators';

export interface AutocompleteData extends FieldData {
  dataSet: Array<{name: string; value: any}>;
  populate?: {
    collection: string;
    nameKey: string;
    valueKey?: string;
    orderBy?: string;
    filter?: WhereFilter;
    limit?: number;
    hideValueKey?: boolean;
  };
  autocomplete?: string;
  suffix?: HSD | string;
  prefix?: HSD | string;
}

@Component({
  selector: 'fb-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutocompleteComponent extends FieldComponent<AutocompleteData>
  implements OnInit {
  constructor(
    @Inject(COMPONENT_DATA) public cData: AutocompleteData,
    private dbService: DbService
  ) {
    super(cData);
  }

  filteredSet$: Observable<Array<{name: string; value: string}>>;
  loading$ = new BehaviorSubject(true);
  prefix$: Observable<string>;
  suffix$: Observable<string>;

  ngOnInit() {

    this.prefix$ = getHsd('prefix', this.cData);
    this.suffix$ = getHsd('suffix', this.cData);

    let dataSet$: Observable<Array<{name: string; value: string}>>;

    if (this.cData.populate) {

      const {populate} = this.cData;

      const nameKey = populate.nameKey || 'name';
      const valueKey = populate.valueKey || 'id';

      if (populate.limit) {
        this.filteredSet$ = this.cData.control.valueChanges.pipe(
          startWith(''),
          switchMap(search => {
            const end = search.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));

            const filters = [
              {
                key: nameKey,
                operator: FilterMethod.GreaterThenOrEqual,
                value: search
              },
              {
                key: nameKey,
                operator: FilterMethod.LessThen,
                value: end
              }
            ];

            if (populate.filter) {
              filters.push(populate.filter);
            }

            return this.dbService.getDocuments(populate.collection, populate.limit, undefined, null, filters);
          }),
          map(docs => {
            return docs.map(it => {
              return {
                id: it.id,
                ...it.data()
              };
            });
          }),
          map(docs => {
            return docs.map(doc => {
              return {
                name: `${doc[nameKey]} ${this.cData.populate.hideValueKey ? '' : '(' + doc[valueKey] + ')'}`,
                value: doc[valueKey]
              };
            });
          })
        );
      }

      dataSet$ = this.dbService
        .getDocumentsSimple(
          this.cData.populate.collection,
          this.cData.populate.orderBy,
          this.cData.populate.filter
        )
        .pipe(
          map(docs =>
            docs.map(doc => ({
              name: doc[nameKey],
              value: doc[valueKey]
            }))
          ),
          tap(() => this.loading$.next(false))
        );
    } else {
      dataSet$ = of(this.cData.dataSet);
    }

    if (this.filteredSet$) {
      return;
    }

    this.filteredSet$ = dataSet$.pipe(
      switchMap(dataSet =>
        this.cData.control.valueChanges.pipe(
          startWith(this.cData.control.value),
          map(value => {
            if (!value) {
              return dataSet;
            }

            value = value.toLowerCase();

            return dataSet.filter(item =>
              item.name.toLowerCase().includes(value)
            );
          })
        )
      )
    );
  }
}
