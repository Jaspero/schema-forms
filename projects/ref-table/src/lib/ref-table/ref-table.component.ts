import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit, QueryList,
  ViewChildren
} from '@angular/core';
import {
  COMPONENT_DATA,
  DbService,
  Definitions,
  FieldComponent,
  FieldData, FormBuilderComponent,
  FormBuilderData,
  FormBuilderService,
  parseTemplate,
  SegmentType
} from '@jaspero/form-builder';
import {JSONSchema7} from 'json-schema';
import {forkJoin, of} from 'rxjs';
import {switchMap, take, tap} from 'rxjs/operators';

export interface RefTableData extends FieldData {
  collection: string;
  schema: JSONSchema7;
  definitions: Definitions;
  fields: string[];
  addLabel: string;
}

interface Item {
  type: 'new' | 'existing',
  data: FormBuilderData;
  edited?: boolean;
}

@Component({
  selector: 'fb-rt-ref-table',
  templateUrl: './ref-table.component.html',
  styleUrls: ['./ref-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RefTableComponent extends FieldComponent<RefTableData> implements OnInit, OnDestroy {
  constructor(
    @Inject(COMPONENT_DATA) public cData: RefTableData,
    private dbService: DbService,
    private cdr: ChangeDetectorRef,
    private formBuilderService: FormBuilderService
  ) {
    super(cData)
  }

  @ViewChildren(FormBuilderComponent)
  formBuilders: QueryList<FormBuilderComponent>;

  items: Item[] = [];
  loading = true;
  toRemove: string[] = [];

  collection: string;

  ngOnInit() {

    this.collection = parseTemplate(
      this.cData.collection,
      this.cData.form.getRawValue()
    );

    if (this.cData.control.value.length) {
      forkJoin(
        this.cData.control.value.map(itemId =>
          this.dbService.getDocument(this.collection, itemId)
        )
      )
        .pipe(
          take(1)
        )
        .subscribe(docs => {
          this.items = docs.map(doc => ({
            type: 'existing',
            data: {
              value: doc,
              schema: this.cData.schema,
              definitions: this.cData.definitions,
              segments: [{
                type: SegmentType.Empty,
                fields: this.cData.fields
              }]
            }
          }));
          this.loading = false;
          this.cdr.markForCheck();
        })
    }

    this.formBuilderService.saveComponents.push(this);
  }

  ngOnDestroy() {
    this.formBuilderService.removeComponent(this);
  }

  add() {
    this.items.push({
      type: 'new',
      data: {
        definitions: this.cData.definitions,
        schema: this.cData.schema,
        segments: [{
          type: SegmentType.Empty,
          fields: this.cData.fields
        }]
      }
    });
    this.cdr.markForCheck();
  }

  remove(item: Item, index: number) {
    if (item.type === 'existing') {
      this.toRemove.push(item.data.value.id);
    }

    this.items.splice(index, 1);
    this.cdr.markForCheck();
  }

  save() {
    const toExec: any[] = this.toRemove.map(it => this.dbService.removeDocument(this.collection, it));
    const toSet: string[] = [];


    this.formBuilders.toArray().forEach((comp, index) => {
      comp.process();
      // @ts-ignore
      const id = comp.form.getRawValue().id || this.dbService.createId();

      if (this.items[index].edited || this.items[index].type === 'new') {
        toExec.push(
          comp.save(
            this.collection,
            id
          )
            .pipe(
              switchMap(() => {
                let data = comp.form.getRawValue();

                delete data.id;

                return this.dbService.setDocument(
                  this.collection,
                  id,
                  data,
                  {merge: true}
                )
              })
            )
        )
      }
    });

    return (toExec.length ? forkJoin(toExec) : of(true))
      .pipe(
        // @ts-ignore
        tap(() => {
          this.cData.control.setValue(toSet);
        })
      )
  }
}
