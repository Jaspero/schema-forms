import {ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit, Optional} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, of, Subscription} from 'rxjs';
import {map, startWith, switchMap, take, tap} from 'rxjs/operators';
import {FilterMethod} from '../../enums/filter-method.enum';
import {FieldComponent} from '../../field/field.component';
import {FieldData} from '../../interfaces/field-data.interface';
import {WhereFilter} from '../../interfaces/where-filter.interface';
import {DbService} from '../../services/db.service';
import {COMPONENT_DATA} from '../../utils/create-component-injector';
import {getHsd, HSD} from '../../utils/get-hsd';
import {FormControl} from '@angular/forms';
import {safeEval} from '../../utils/safe-eval';
import {parseTemplate} from '../../utils/parse-template';
import {ROLE} from '../../utils/role';
import {ADDITIONAL_CONTEXT} from '../../utils/additional-context';

interface Populate {
  collection: string;
  subcollection?: string;
  nameKey?: string;
  valueKey?: string;
  orderBy?: string;
  filter?: WhereFilter;
  limit?: number;

  /**
   * A method for mapping all of the results
   * (items: T[]) => any[]
   */
  mapResults?: string;
}

interface AutocompleteData extends FieldData {
  dataSet: Array<{name: string; value: any}>;
  multiple?: boolean;
  addOnBlur?: boolean;
  populate?: Populate;
  autocomplete?: string;
  suffix?: HSD | string;
  prefix?: HSD | string;

  /**
   * Search value doesn't need to be listed in the options to be add
   */
  allowAny?: boolean;
}

@Component({
  selector: 'fb-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutocompleteComponent extends FieldComponent<AutocompleteData>
  implements OnInit, OnDestroy {
  constructor(
    @Inject(COMPONENT_DATA) public cData: AutocompleteData,
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

  filteredSet$: Observable<Array<{name: string; value: string}>>;
  loading$ = new BehaviorSubject(true);
  prefix$: Observable<string>;
  suffix$: Observable<string>;
  search = new FormControl();
  selected: {name: string; value: string;}[] = [];

  block = false;

  private searchSubscription: Subscription;

  ngOnInit() {
    this.prefix$ = getHsd('prefix', this.cData);
    this.suffix$ = getHsd('suffix', this.cData);

    let dataSet$: Observable<Array<{name: string; value: string}>>;

    if (this.cData.populate) {
      const {populate} = this.cData;

      const mapResults = populate.mapResults ? safeEval(populate.mapResults) : null;
      const nameKey = populate.nameKey || 'name';
      const valueKey = populate.valueKey || 'id';

      if (populate.limit) {
        this.filteredSet$ = this.search.valueChanges.pipe(
          startWith(this.search.value),
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
            if (this.cData.multiple) {
              docs = docs.filter(doc => !this.selected.some(it => it.value === doc.id));
            }

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
                  !value.some(v => item.value.toLowerCase().includes(v)) &&
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

    if (!this.cData.multiple && this.cData.allowAny) {
      this.searchSubscription = this.search.valueChanges
        .subscribe(res => {
          if (!this.block) {
            this.filteredSet$
              .pipe(
                take(1)
              )
              .subscribe(dataSet => {
                const option = dataSet.find(data => data.value.toLowerCase() === res);
                this.cData.control.setValue(option?.value || res);
              });
          } else {
            this.block = false;
          }
        });
    }
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  optionSelected(e) {
    this.selected.push({
      name: e.option.viewValue,
      value: e.option.value
    });
    this.setValue();
  }

  remove(event) {
    const index = this.selected.findIndex(it => it.value === event);

    if (index !== -1) {
      this.selected.splice(index, 1);
    }

    this.setValue();
  }

  add(event) {
    if (this.cData.addOnBlur) {
      const value = event.value.trim();

      if (!this.cData.allowAny && value) {
        this.filteredSet$
          .pipe(
            take(1)
          )
          .subscribe(dataSet => {
            const option = dataSet.find(data => data.value.toLowerCase() === value);
            if (option) {
              this.selected.push(option);
              this.setValue();
            }
          });
      } else {
        this.selected.push({value, name: value});
        this.setValue();
      }
    }
  }

  private setValue() {
    if (this.cData.multiple) {
      this.cData.control.setValue(this.selected.map(it => it.value));
    } else {
      this.cData.control.setValue(this.selected[0].value);
      this.block = true;
      this.search.setValue(this.selected[0].name, {emitEvent: false})
    }
  }
}
