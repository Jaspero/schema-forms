import {ChangeDetectionStrategy, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {BehaviorSubject, combineLatest, Observable, of} from 'rxjs';
import {distinctUntilChanged, map, scan, startWith, switchMap, tap} from 'rxjs/operators';
import {FilterMethod} from '../../enums/filter-method.enum';
import {FieldComponent} from '../../field/field.component';
import {FieldData} from '../../interfaces/field-data.interface';
import {DbService} from '../../services/db.service';
import {COMPONENT_DATA} from '../../utils/create-component-injector';
import {WhereFilter} from '../../interfaces/where-filter.interface';

interface RefData extends FieldData {
  /**
   * Collection to query for search
   * @required
   */
  collection: string;
  /**
   * Save value of provided key to database
   * @default 'id'
   */
  valueKey?: string;
  /**
   * Set to provided value on 'Clear' action
   * @default null
   */
  clearValue?: string | null;
  /**
   * Max number of rows to show per search
   * @default 5
   */
  limit?: number;
  /**
   * Search key for querying database
   * Label for showing next to 'Search by...'
   * @default {
   *   key: '/name',
   *   label: 'Name'
   * }
   */
  search?: {
    key?: string;
    label?: string;
  };
  /**
   * Display provided key to user and its label
   * @default {
   *   key: '/name',
   *   label: 'Name'
   * }
   */
  display: {
    key?: string;
    label?: string;
  };
  /**
   * Table columns for displaying search table
   * @required
   * @default {
   *   tableColumns: [
   *     {key: '/id', label: 'ID'}
   *   ]
   * }
   */
  table?: {
    tableColumns?: {
      key: string;
      label: string;
    }[];
  }

  /**
   * Additional Filters for provided collection
   * @default []
   */
  filters?: WhereFilter[];

  /**
   * Close search dialog after selecting item
   * @default true
   */
  closeOnSelect?: boolean;
}

@Component({
  selector: 'fb-ref',
  templateUrl: './ref.component.html',
  styleUrls: ['./ref.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RefComponent extends FieldComponent<RefData> implements OnInit {
  constructor(
    @Inject(COMPONENT_DATA) public cData: RefData,
    private db: DbService
  ) {
    super(cData);
  }

  data$: Observable<any>;
  display$: Observable<any>;

  displayedColumns: string[] = [];

  searchControl: FormControl;

  cursor = null;

  loadMore$ = new BehaviorSubject(true);

  lastSearch: string;

  hasMore: boolean;

  cleared: boolean;

  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;

  ngOnInit() {

    this.searchControl = new FormControl('');

    this.cData.collection = this.cData.collection || '';

    this.cData.filters = this.cData.filters || [];

    this.cData.valueKey = this.cData.valueKey || 'id';

    if (this.cData.clearValue !== undefined) {
      this.cData.clearValue = this.cData.clearValue ?? null;
    }

    this.cData.limit = Math.abs(this.cData.limit || 4);

    this.cData.display = this.cData.display || {};
    this.cData.display.key = this.cData.display.key || '/name';
    this.cData.display.label = this.cData.display.label || 'Name';

    this.cData.search = this.cData.search || {};
    this.cData.search.key = this.cData.search.key || '/name';
    this.cData.search.label = this.cData.search.label || 'Name';
    this.cData.table = this.cData.table || {};
    this.cData.table.tableColumns = this.cData.table.tableColumns || [{key: '/id', label: 'ID'}];
    this.displayedColumns = this.cData.table.tableColumns.map(column => column.key.slice(1)) as string[];

    this.cData.closeOnSelect = this.cData.closeOnSelect ?? true;

    this.display$ = this.cData.control.valueChanges.pipe(
      startWith(this.cData.control.value),
      switchMap(value => {
        if (!value) {
          return of('');
        }

        return this.db.getDocument(this.cData.collection, value).pipe(
          map((data) => {

            if (!data || String(Object.keys(data || {})) === 'id') {
              return value;
            }

            // @ts-ignore
            return data[this.cData.display.key.slice(1)] || '';
          }),
        );
      }),
      tap(display => {
        if (this.cleared) {
          this.cleared = false;
          return;
        }

        this.searchControl.setValue(display);
      })
    );

    this.data$ = combineLatest([this.searchControl.valueChanges
      .pipe(distinctUntilChanged(), tap(() => this.cursor = null)), this.display$, this.loadMore$]).pipe(
      switchMap(([search]: [string, any, boolean]) => {
        search = search || '';
        return this.db.getDocuments(this.cData.collection, this.cData.limit, undefined, this.cursor, [
          ...this.cData.filters,
          {
            // @ts-ignore
            key: this.cData.search.key.slice(1),
            // @ts-ignore
            label: this.cData.search.label,
            operator: FilterMethod.GreaterThenOrEqual,
            value: search
          },
          {
            // @ts-ignore
            key: this.cData.search.key.slice(1),
            // @ts-ignore
            label: this.cData.search.label,
            operator: FilterMethod.LessThen,
            value:  search.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1))
          }
        ]);
      }),
      map((snaps: any) => {
        if (snaps.length) {
          this.cursor = snaps[snaps.length - 1];
        } else {
          this.cursor = null;
        }

        return snaps.map(doc => {
          return {
            id: doc.id,
            ...doc.data()
          };
        });
      }),
      scan((documents, cur) => {
        if (cur.length) {
          this.hasMore = true;
        } else {
          this.hasMore = false;
          this.cursor = null;
        }

        if (this.lastSearch !== this.searchControl.value) {
          this.lastSearch = this.searchControl.value;
          return cur;
        }

        this.lastSearch = this.searchControl.value;

        return [...documents, ...(this.hasMore ? cur : [])];
      }, [])
    );
  }

  selectRow(row) {
    if (this.cData.closeOnSelect) {
      this.autocomplete.closePanel();
    }

    // @ts-ignore
    this.cData.control.setValue(row[this.cData.valueKey]);
  }

  resetValue() {
    this.cData.control.setValue(this.cData.clearValue);
    this.searchControl.setValue('');

    setTimeout(() => {
      if (this.cData.closeOnSelect) {
        this.autocomplete.closePanel();
      }
    });
  }

  applySearchValue() {
    if (this.cData.closeOnSelect) {
      this.autocomplete.closePanel();
    }

    this.cData.control.setValue(this.searchControl.value || '');
    this.cleared = true;
  }

  loadMore() {
    this.loadMore$.next(true);
  }
}
