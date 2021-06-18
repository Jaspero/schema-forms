import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {combineLatest, Observable, of} from 'rxjs';
import {map, startWith, switchMap, tap} from 'rxjs/operators';
import {FilterMethod} from '../../enums/filter-method.enum';
import {FieldComponent} from '../../field/field.component';
import {FieldData} from '../../interfaces/field-data.interface';
import {DbService} from '../../services/db.service';
import {COMPONENT_DATA} from '../../utils/create-component-injector';

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

  ngOnInit() {

    this.searchControl = new FormControl('');

    this.cData.collection = this.cData.collection || '';

    this.cData.valueKey = this.cData.valueKey || 'id';

    if (this.cData.clearValue !== undefined) {
      this.cData.clearValue = this.cData.clearValue ?? null;
    }

    this.cData.limit = Math.abs(this.cData.limit || 5);

    this.cData.display = this.cData.display || {};
    this.cData.display.key = this.cData.display.key || '/name';
    this.cData.display.label = this.cData.display.label || 'Name';

    this.cData.search = this.cData.search || {};
    this.cData.search.key = this.cData.search.key || '/name';
    this.cData.search.label = this.cData.search.label || 'Name';
    this.cData.table = this.cData.table || {};
    this.cData.table.tableColumns = this.cData.table.tableColumns || [{key: '/id', label: 'ID'}];
    this.displayedColumns = this.cData.table.tableColumns.map(column => column.key.slice(1)) as string[];

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
        this.searchControl.setValue(display);
      })
    );

    this.data$ = combineLatest([this.searchControl.valueChanges, this.display$]).pipe(
      switchMap(([search]: [string, any]) => {
        search = search || '';
        return this.db.getDocuments(this.cData.collection, this.cData.limit, undefined, null, [
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
        return snaps.map(doc => {
          return {
            id: doc.id,
            ...doc.data()
          };
        });
      })
    );
  }

  selectRow(row) {
    // @ts-ignore
    this.cData.control.setValue(row[this.cData.valueKey]);
  }

  resetValue() {
    this.cData.control.setValue(this.cData.clearValue);
  }

  applySearchValue() {
    this.cData.control.setValue(this.searchControl.value || '');
  }
}
