import {FlatTreeControl} from '@angular/cdk/tree';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {SegmentType} from '@jaspero/form-builder';
import {TranslocoService} from '@ngneat/transloco';
import {MatDialog} from '@angular/material/dialog';

/**
 * Food data with nested structure.
 * Each node has a name and an optional list of children.
 */
interface FoodNode {
  name: string;
  children?: FoodNode[];
}


/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'fb-pb-block-navigation',
  templateUrl: './block-navigation.component.html',
  styleUrls: ['./block-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockNavigationComponent implements OnInit {

  constructor(
    private transloco: TranslocoService,
    private dialog: MatDialog
  ) {
  }

  @ViewChild('itemOptions')
  itemOptionsDialog: TemplateRef<any>;

  @Input() index: number;
  @Input() selectBlock: any;
  treeControl: FlatTreeControl<any>;
  treeFlattener: MatTreeFlattener<any, any>;
  dataSource: MatTreeFlatDataSource<any, any>;

  valueCache: any;
  blockCache: any;

  selectLastItem = false;

  @Input()
  set value(value: any) {

    if (this.valueCache) {
      this.populateNavigation({
        ...this.blockCache,
        value
      });

      this.treeControl.expandAll();
    }

    this.valueCache = value;
  }

  @Input()
  set block(block: any) {
    this.blockCache = block;

    this.populateNavigation(block);
  }

  @Output()
  optionsChanged = new EventEmitter<any>();

  ngOnInit() {}

  populateNavigation(block) {
    if (!this.treeControl) {
      this.treeControl = new FlatTreeControl<ExampleFlatNode>(
        node => node.level, node => node.expandable);
    }

    if (!this.treeFlattener) {
      this.treeFlattener = new MatTreeFlattener(
        this._transformer, node => node.level, node => node.expandable, node => node.children);
    }

    if (!this.dataSource) {
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    }

    const children = (block.form.segments || []).map((segment, index) => {

      segment.type = SegmentType.Empty;

      let child = {
        ...block,
        ...segment,
        name: segment.title,
        form: {
          ...block.form,
          segments: block.form.segments.map((item, i) => {
            if (i === index) {
              return item;
            }
            return {...item, fields: []};
          })
        }
      };


      if (child.array) {

        const arrayProperty = child.array.slice(1);
        child.form = {
          ...child.form,
          segments: [
            {
              type: 'empty',
              fields: segment.fields
            }
          ],
          schema: child.form.schema.properties[arrayProperty].items
        };

        delete child.array;

        const addButton = {
          ...child,
          name: this.transloco.translate('PB.ADD') + ' ' + child.singleLabel || child.label,
          button: true,
          icon: 'add_circle_outline',
          class: 'navigation-button',
          action: 'add',
          arrayProperty,
          value: {}
        };

        child = (child.value?.[arrayProperty] || []).map((item, i) => {
          return {
            ...child,
            name: child.singleLabel || child.label,
            value: child.value?.[arrayProperty]?.[i],
            nested: {
              arrayProperty,
              index: i
            }
          };
        });

        if (this.selectLastItem) {
          this.selectLastItem = false;
          setTimeout(() => {
            this.selectCustomBlock(child[child.length - 2]);
            this.optionsChanged.next(this.valueCache);
          });
        }

        child.push(addButton);
      }

      return child;
    }).reduce((acc, child: Array<any> | object) => {
      return [...acc, ...(child.constructor === Array ? child : [child])];
    }, []);

    this.dataSource.data = [{
      name: block.label,
      icon: block.icon,
      children
    }];
  }

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  selectCustomBlock(node) {
    if (node.button) {

      if (node.action === 'add') {
        this.blockCache.value[node.arrayProperty] = [
          ...(this.blockCache.value[node.arrayProperty] || []),
          // TODO: Here define value from copied item
          {}
        ];

        this.valueCache = this.blockCache;

        this.selectBlock({
          ...node,
          nested: {
            ...node.nested,
            completeValue: this.valueCache,
            arrayProperty: node.arrayProperty,
            index: this.blockCache.value[node.arrayProperty].length - 1
          },
          value: {}
        }
        , this.index);

        setTimeout(() => {
          this.optionsChanged.next(this.blockCache.value);

          this.selectLastItem = true;
        }, 100);
      }

      return;
    }

    if (node.nested) {
      return this.selectBlock({
        ...node,
        nested: {
          ...node.nested,
          completeValue: this.valueCache
        },
        value: {
          ...this.blockCache.value[node.nested.arrayProperty][node.nested.index]
        }
      }, this.index);
    }

    if ((this.blockCache.form.segments || []).length > 1) {
      return this.selectBlock({...node, value: this.blockCache.value}, this.index);
    }

    return this.selectBlock(this.blockCache, this.index);
  }

  openItemOptions(event, block) {
    event.preventDefault();
    event.stopPropagation();

    this.dialog.open(this.itemOptionsDialog, {
      autoFocus: false,
      position: {
        top: event.clientY + 'px',
        left: event.clientX + 'px'
      },
      backdropClass: 'clear-backdrop',
      panelClass: 'contextmenu-dialog',
      width: '200px',
      data: {
        block
      }
    });
  }

  private _transformer = (node: FoodNode, level: number) => {
    return {
      ...node,
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level
    };
  };
}
