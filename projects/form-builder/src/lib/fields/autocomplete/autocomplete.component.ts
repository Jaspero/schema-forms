import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of, combineLatest} from 'rxjs';
import {map, startWith, switchMap, tap, take} from 'rxjs/operators';
import {FilterMethod} from '../../enums/filter-method.enum';
import {FieldComponent} from '../../field/field.component';
import {FieldData} from '../../interfaces/field-data.interface';
import {WhereFilter} from '../../interfaces/where-filter.interface';
import {DbService} from '../../services/db.service';
import {COMPONENT_DATA} from '../../utils/create-component-injector';
import {getHsd, HSD} from '../../utils/get-hsd';
import {FormControl} from '@angular/forms';

interface Populate {
  collection: string;
  subcollection?: string;
  nameKey?: string;
  valueKey?: string;
  orderBy?: string;
  filter?: WhereFilter;
  limit?: number;
}

interface AutocompleteData extends FieldData {
  dataSet: Array<{name: string; value: any}>;
  multiple?: boolean;
  addOnBlur?: boolean;
  populate?: Populate;
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
    private dbService: DbService,
    private cdr: ChangeDetectorRef
  ) {
    super(cData);
  }

  filteredSet$: Observable<Array<{name: string; value: string}>>;
  loading$ = new BehaviorSubject(true);
  prefix$: Observable<string>;
  suffix$: Observable<string>;
  search = new FormControl();
  selected: string[] = [];

  ngOnInit() {
    this.prefix$ = getHsd('prefix', this.cData);
    this.suffix$ = getHsd('suffix', this.cData);

    let dataSet$: Observable<Array<{name: string; value: string}>>;

    if (this.cData.populate) {

      const {populate} = this.cData;

      const nameKey = populate.nameKey || 'name';
      const valueKey = populate.valueKey || 'id';

      if (populate.limit) {
        this.filteredSet$ = combineLatest([
          this.cData.control.valueChanges
            .pipe(
              startWith(this.cData.control.value)
            ),
          this.cData.control.valueChanges
            .pipe(
              startWith(this.cData.control.value)
            )
        ]).pipe(
          switchMap(([search]) => {
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
                name: `${doc[nameKey]} (${doc[valueKey]})`,
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

    if (!this.filteredSet$) {
      this.filteredSet$ = dataSet$.pipe(
        switchMap(dataSet =>
          combineLatest([
            this.cData.control.valueChanges
              .pipe(
                startWith(this.cData.control.value)
              ),
            this.search.valueChanges.pipe(
              startWith(this.search.value)
            ),
          ]).pipe(
            map(([value, search]) => {
              if (!value && !search) {
                return dataSet;
              }

              if (this.cData.multiple) {
                value = Array.isArray(value) ? value.map(v => v.toLowerCase()) : [];

                return dataSet.filter(item =>
                  !value.some(v => item.name.toLowerCase().includes(v)) &&
                  item.name.toLowerCase().includes(search?.toLowerCase())
                );
              } else {

                value = value.toLowerCase();

                return dataSet.filter(item =>
                  item.name.toLowerCase().includes(value)
                );
              }
            })
          )
        )
      );
    }
  }

  optionSelected(event: string) {
    this.selected.push(event);
    this.setValue();
  }

  remove(event) {
    const index = this.selected.indexOf(event);

    if (index !== -1) {
      this.selected.splice(index, 1);
    }

    this.setValue();
  }

  add(event) {
    if (this.cData.addOnBlur) {
      const value = event.value.trim();

      if (value) {
        this.filteredSet$
          .pipe(
            take(1)
          )
          .subscribe(dataSet => {
            if (dataSet.find(data => data.value.toLowerCase() === value)) {
              this.selected.push(value);
              this.setValue();
            }
          });
      }
    }
  }

  private setValue() {
    this.search.reset();
    this.cData.control.setValue(this.selected);
    this.cdr.detectChanges();
  }
}
